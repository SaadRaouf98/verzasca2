import { DOCUMENT } from '@angular/common';
import { Component, Inject, ViewChild, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SignatureStatus } from '@core/enums/signature-status.enum';
import { AllSignatures } from '@core/models/signature.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import {
  KtdGridComponent,
  ktdTrackById,
  KtdGridLayout,
  KtdDragEnd,
  KtdDragStart,
  KtdResizeEnd,
  KtdResizeStart,
} from '@katoid/angular-grid-layout';
import { TranslateService } from '@ngx-translate/core';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { YesNo } from '@shared/enums/yes-no.enum';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';

import { Observable, Subscription, debounceTime, filter, fromEvent, merge } from 'rxjs';

@Component({
  selector: 'app-signature-format-modal',
  templateUrl: './signature-format-modal.component.html',
  styleUrls: ['./signature-format-modal.component.scss'],
})
export class SignatureFormatModalComponent implements OnInit {
  protected translate = inject(TranslateService);
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  committeeSignaturesList$: Observable<AllSignatures> = new Observable();
  SignatureStatus = SignatureStatus;
  isLoading = false;
  YesNo = YesNo;
  radioText = [
    {
      id: YesNo.Yes,
      title: this.translate.instant('shared.yes'),
    },
    {
      id: YesNo.No,
      title: this.translate.instant('shared.no'),
    },
  ];
  /************************* katoid/angular-grid-layout *****************************************
   * /******************************************************* */
  @ViewChild(KtdGridComponent, { static: true }) grid!: KtdGridComponent;
  trackById = ktdTrackById;

  readonly cols = 12;
  readonly rowHeight = 45;
  currentPlaceholder: string = 'None';
  compactType: 'vertical' | 'horizontal' | null = null;

  layout: KtdGridLayout = [];
  transitions: { name: string; value: string }[] = [
    {
      name: 'ease',
      value: 'transform 500ms ease, width 500ms ease, height 500ms ease',
    },
    {
      name: 'ease-out',
      value: 'transform 500ms ease-out, width 500ms ease-out, height 500ms ease-out',
    },
    {
      name: 'linear',
      value: 'transform 500ms linear, width 500ms linear, height 500ms linear',
    },
    {
      name: 'overflowing',
      value:
        'transform 500ms cubic-bezier(.28,.49,.79,1.35), width 500ms cubic-bezier(.28,.49,.79,1.35), height 500ms cubic-bezier(.28,.49,.79,1.35)',
    },
    {
      name: 'fast',
      value: 'transform 200ms ease, width 200ms linear, height 200ms linear',
    },
    {
      name: 'slow-motion',
      value: 'transform 1000ms linear, width 1000ms linear, height 1000ms linear',
    },
    { name: 'transform-only', value: 'transform 500ms ease' },
  ];
  currentTransition: string = this.transitions[0].value;

  dragStartThreshold = 0;
  autoScroll = true;
  disableDrag = false;
  disableResize = true;
  disableRemove = true;
  autoResize = true;
  preventCollision = false;
  isDragging = false;
  isResizing = false;
  resizeSubscription!: Subscription;
  readonly RectangleWidth = 3;
  readonly RectangleHeight = 1;
  selectedRadioId: YesNo | null = null;
  compareFn = compareFn;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      buttonLabel: string;
      requestId: string;
      actionId: string;
      committeeId: string;
    },
    @Inject(DOCUMENT) public document: Document,
    private dialogRef: MatDialogRef<SignatureFormatModalComponent>,
    private manageSharedService: ManageSharedService,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.committeeSignaturesList$ = this.manageSharedService.signaturesService.getSignaturesList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      { committeeId: this.data.committeeId, status: SignatureStatus.Active }
    );

    this.initializeForm();
    this.resizeSubscription = merge(
      fromEvent(window, 'resize'),
      fromEvent(window, 'orientationchange')
    )
      .pipe(
        debounceTime(50),
        filter(() => this.autoResize)
      )
      .subscribe(() => {
        this.grid?.resize();
      });
  }
  onSelectAction(selectedRadio: any) {
    this.selectedRadioId = selectedRadio;
    // Set the form control value directly, not as an object
    this.form.controls['signatureRequireAttendance']?.patchValue(selectedRadio);
    // Mark the field as touched to trigger validation
    this.form.controls['signatureRequireAttendance']?.markAsTouched();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      committeeSignature: new FormControl(null, [Validators.required]),
      signatureSettings: new FormControl('', []),
      signatureRequireAttendance: new FormControl(null, [Validators.required]),
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;

    const dataToSend: any = {
      signatureRequireAttendance: this.form.value.signatureRequireAttendance,
      signatureSettings: [],
    };

    this.layout.forEach((rectangleItem) => {
      const member = this.getMemberById(rectangleItem.id);

      dataToSend.signatureSettings.push({
        id: rectangleItem.id,
        row: rectangleItem.y,
        size: rectangleItem.w,
        start: rectangleItem.x,
        end: rectangleItem.x + rectangleItem.w,
        memberTitle: member?.memberTitle,
        userId: member?.userId,
        name: member?.name,
      });
    });

    this.executeRequestAction(dataToSend);
  }

  private executeRequestAction(data: any) {
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data,
    });
  }

  searchOnCommitteeSignatures(event: { term: string; items: any[] }): void {
    this.committeeSignaturesList$ = this.manageSharedService.signaturesService.getSignaturesList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      {
        committeeId: this.data.committeeId,
        status: SignatureStatus.Active,
        searchKeyword: event.term,
      }
    );
  }

  onCommitteeSignatureSelected(e: any): void {
    const committeeSignatureId = e;
    if (committeeSignatureId) {
      this.isLoading = true;
      this.manageSharedService.signaturesService
        .getSignatureById(committeeSignatureId)
        .subscribe((res) => {
          this.isLoading = false;

          this.form.patchValue({
            signatureSettings: res.signatureSettings,
          });

          const layout: KtdGridLayout = [];
          res.signatureSettings.forEach((signature) => {
            layout.push({
              id: signature.id,
              x: signature.start,
              y: signature.row,
              h: this.RectangleHeight,
              w: signature.size,
              minH: this.RectangleHeight,
              maxH: this.RectangleHeight,
            });
          });

          this.layout = layout;
        });
    } else {
      //user cleared the selected committee
      this.layout = [];
    }
  }

  getMemberById(id: string):
    | {
        end: number;
        id: string;
        memberTitle: string;
        name: string;
        row: number;
        size: number;
        start: number;
        userId: number;
      }
    | undefined {
    return this.form
      .get('signatureSettings')
      ?.value?.find(
        (ele: {
          end: number;
          id: string;
          memberTitle: string;
          name: string;
          row: number;
          size: number;
          start: number;
          userId: number;
        }) => ele.id === id
      );
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  /******************************** */
  /************************************* */
  /********** Angular grid layout ************* */

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

  onDragStarted(event: KtdDragStart) {
    this.isDragging = true;
  }

  onResizeStarted(event: KtdResizeStart) {
    this.isResizing = true;
  }

  onDragEnded(event: KtdDragEnd) {
    this.isDragging = false;
  }

  onResizeEnded(event: KtdResizeEnd) {
    this.isResizing = false;
  }

  onLayoutUpdated(layout: KtdGridLayout) {
    this.layout = layout;
  }

  /**
   * Fired when a mousedown happens on the remove grid item button.
   * Stops the event from propagating an causing the drag to start.
   * We don't want to drag when mousedown is fired on remove icon button.
   */
  stopEventPropagation(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
}
