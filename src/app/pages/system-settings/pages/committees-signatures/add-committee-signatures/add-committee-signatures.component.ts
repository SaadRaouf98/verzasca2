import { ChangeDetectorRef, Component, ElementRef, Inject, NgZone, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { AllOrganizationUnits } from '@core/models/organization-unit.model';
import { arabicRegex } from '@core/utils/regex';
import { TranslateService } from '@ngx-translate/core';
import { compareFn, isSmallDeviceWidthForPopup, isTouched } from '@shared/helpers/helpers';

import { Location } from '@angular/common';
import { Observable, Subscription, debounceTime, filter, fromEvent, merge } from 'rxjs';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { SignatureCommand, SignatureForm } from '@core/models/signature.model';
import { LanguageService } from '@core/services/language.service';
import { SignatureStatus } from '@core/enums/signature-status.enum';

import {
  KtdDragEnd,
  KtdDragStart,
  KtdGridComponent,
  KtdGridLayout,
  KtdResizeEnd,
  KtdResizeStart,
  ktdTrackById,
} from '@katoid/angular-grid-layout';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TitleModalComponent } from '@pages/system-settings/components/title-modal/title-modal.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { CustomToastrService } from '@core/services/custom-toastr.service';

export function ktdArrayRemoveItem<T>(array: T[], condition: (item: T) => boolean) {
  const arrayCopy = [...array];
  const index = array.findIndex((item) => condition(item));
  if (index > -1) {
    arrayCopy.splice(index, 1);
  }
  return arrayCopy;
}

@Component({
  selector: 'app-add-committee-signatures',
  templateUrl: './add-committee-signatures.component.html',
  styleUrls: ['./add-committee-signatures.component.scss'],
})
export class AddCommitteeSignaturesComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  organizationUnitsList$: Observable<AllOrganizationUnits> = new Observable();
  organizationUnitMembers: { id: string; name: string; title?: string }[] = [];
  membersDropDown: { id: string; name: string; title?: string }[] = [];

  lang: string = 'ar';
  SignatureStatus = SignatureStatus;

  /************************* katoid/angular-grid-layout *****************************************
   * /******************************************************* */
  @ViewChild(KtdGridComponent, { static: true }) grid!: KtdGridComponent;
  trackById = ktdTrackById;

  readonly cols = 12;
  readonly rowHeight = 119;
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
  disableResize = false;
  disableRemove = false;
  autoResize = true;
  preventCollision = false;
  isDragging = false;
  isResizing = false;
  resizeSubscription!: Subscription;

  memberControl = new FormControl();
  isLoading = false;

  FormMode = FormMode;
  formMode: FormMode = FormMode.View;

  compareFn = compareFn;

  readonly RectangleWidth = 4;
  readonly RectangleHeight = 1;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private manageSystemSettingsService: ManageSystemSettingsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private ngZone: NgZone,
    public elementRef: ElementRef,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    @Inject(DOCUMENT) public document: Document
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.elementId = this.activatedRoute.snapshot.params['id'];

    this.initializeForm();
    this.intializeDropDownLists();
    this.setFormMode();

    if (this.elementId) {
      this.manageSystemSettingsService.signaturesService
        .getSignatureById(this.elementId)
        .subscribe({
          next: (res) => {
            this.patchForm({
              id: res.id,
              title: res.title,
              committee: {
                id: res.committee.id,
                title: res.committee.title,
              },
              description: res.description,
              status: res.status,
              signatureSettings: res.signatureSettings,
            });
            this.organizationUnitMembers = res.committee?.members;
            this.membersDropDown = res.committee?.members;

            this.searchOnCommittees({ term: res.committee?.title, items: [] });
            const layout: KtdGridLayout = [];

            res.signatureSettings.forEach((signature) => {
              layout.push({
                id: signature.userId,
                x: signature.start,
                y: signature.row,
                h: this.RectangleHeight,
                w: signature.size,
                minH: this.RectangleHeight,
                maxH: this.RectangleHeight,
              });
              if (signature.memberTitle) {
                const member = this.getMemberById(signature.userId);
                if (member) {
                  member.title = signature.memberTitle;
                }
              }
            });

            this.layout = layout;
          },
        });
    }

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

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      committee: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required, Validators.pattern(arabicRegex)]),
      description: new FormControl('', []),
      status: new FormControl(SignatureStatus.Active, [Validators.required]),
      signatureSettings: new FormControl('', []),
    });
  }

  intializeDropDownLists(): void {
    this.organizationUnitsList$ =
      this.manageSystemSettingsService.organizationUnitsService.getOrganizationUnitsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
        }
      );
  }

  patchForm(data: SignatureForm): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    //
    //
    //

    const { id, title, committee, description, status } = this.form.value;
    let dataToSend: SignatureCommand = {
      title,
      status,
      description,
      committeeId: committee.id,
      signatureSettings: [],
    };

    this.layout.forEach((rectangleItem) => {
      const member = this.getMemberById(rectangleItem.id);

      dataToSend.signatureSettings.push({
        id: this.elementId
          ? this.form.get('signatureSettings')?.value.find(
              (ele: {
                id: string;
                row: number;
                size: number; //عدد الأعمدة للمستطيل
                start: number; // باديء عند عمود رقم كام
                end: number; // انتهي عند عمود رقم كام
                memberTitle: string;
                userId: string;
                name: string;
              }) => ele.userId === rectangleItem.id
            )?.id
          : null,
        row: rectangleItem.y,
        size: rectangleItem.w,
        start: rectangleItem.x,
        end: rectangleItem.x + rectangleItem.w,
        memberTitle: member?.title!,
        userId: member?.id!,
        name: member?.name!,
      });
    });

    if (this.elementId) {
      dataToSend.id = id;

      this.manageSystemSettingsService.signaturesService.updateSignature(dataToSend).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
    } else {
      this.manageSystemSettingsService.signaturesService.addSignature(dataToSend).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));
          this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
    }
  }

  onCancel(): void {
    this.form.reset();
    this.navigateToTablePage();
  }

  navigateToTablePage(): void {
    this.location.back();
  }

  searchOnCommittees(event: { term: string; items: any[] }): void {
    this.organizationUnitsList$ =
      this.manageSystemSettingsService.organizationUnitsService.getOrganizationUnitsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
          searchKeyword: event.term,
        }
      );
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onClearCommittee(): void {
    this.searchOnCommittees({ term: '', items: [] });
  }

  onCommitteeSelected(): void {
    const committeeId = this.form.get('committee')?.value?.id;
    if (committeeId) {
      this.isLoading = true;
      this.manageSystemSettingsService.organizationUnitsService
        .getOrganizationUnitUsers(committeeId)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.organizationUnitMembers = res.members;
            const layout: KtdGridLayout = [];

            let x = 0;
            let y = 0;

            this.organizationUnitMembers.forEach((member, index) => {
              if (index && (index * this.RectangleWidth) % 12 === 0) {
                //The row is filled
                y++;
                x = 0;
              } else {
                x = index === 0 ? 0 : x + this.RectangleWidth;
              }

              layout.push({
                id: member.id,
                x,
                y,
                h: this.RectangleHeight,
                w: this.RectangleWidth,
                minH: this.RectangleHeight,
                maxH: this.RectangleHeight,
              });
            });

            this.layout = layout;
            //
          },
        });
    }
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
    //
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

  /** Removes the item from the layout */
  removeItem(itemId: string): void {
    if (this.elementId) {
      this.form.value;
      const signature = this.form.get('signatureSettings')?.value.find(
        (ele: {
          id: string;
          row: number;
          size: number; //عدد الأعمدة للمستطيل
          start: number; // باديء عند عمود رقم كام
          end: number; // انتهي عند عمود رقم كام
          memberTitle: string;
          userId: string;
          name: string;
        }) => ele.userId === itemId
      );
      if (signature?.id) {
        this.manageSystemSettingsService.signaturesService
          .deleteSignatureSetting(signature?.id)
          .subscribe({
            next: (res) => {
              this.layout = ktdArrayRemoveItem(this.layout, (item) => item.id === itemId);
              this.toastr.success(
                this.translateService.instant(
                  'SystemSettingsModule.AddCommitteeSignaturesComponent.successSignatureDeletion'
                )
              );
            },
            error: (err) => {
              this.toastr.error(
                this.translateService.instant(
                  'SystemSettingsModule.AddCommitteeSignaturesComponent.failedSignatureDeletion'
                )
              );
            },
          });
      } else {
        this.layout = ktdArrayRemoveItem(this.layout, (item) => item.id === itemId);
      }
    } else {
      // Important: Don't mutate the array. Let Angular know that the layout has changed creating a new reference.
      this.layout = ktdArrayRemoveItem(this.layout, (item) => item.id === itemId);
    }
  }

  getMemberById(id: string): { id: string; name: string; title?: string } | undefined {
    return this.organizationUnitMembers.find((ele) => ele.id === id);
  }

  getMemberNameById(id: string): string | undefined {
    return this.organizationUnitMembers.find((ele) => ele.id === id)?.name;
  }

  getMemberTitleById(id: string): string | undefined {
    return this.organizationUnitMembers.find((ele) => ele.id === id)?.title;
  }

  onOpenTitleModal(memberId: string): void {
    const member = this.getMemberById(memberId);

    const dialogRef = this.dialog.open(TitleModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        label: `${this.translateService.instant(
          'SystemSettingsModule.AddCommitteeSignaturesComponent.insertTitle'
        )} (${member?.name})`,
        title: member?.title,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe(
        (dialogResult: {
          statusCode: ModalStatusCode;
          status: string;
          data: { title: string };
        }) => {
          if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
            const member = this.getMemberById(memberId);
            if (member) {
              member.title = dialogResult.data?.title;
              this.changeDetectorRef.detectChanges();
            }
          }
        }
      );
  }

  detectFieldChange() {
    const val = this.memberControl.value;
    if (val) {
      val.name ? this.searchOnCommitteeMembers(val.name) : this.searchOnCommitteeMembers(val);
    } else {
      this.membersDropDown = this.organizationUnitMembers;
    }
  }

  searchOnCommitteeMembers(searchKeyword: string): void {
    this.membersDropDown = this.organizationUnitMembers.filter((ele) =>
      ele.name.toLowerCase().includes(searchKeyword.trim().toLowerCase())
    );
  }

  displayItems(option: { id: number; name: string }) {
    return option?.name;
  }

  onAddMember(): void {
    //
    const member = this.memberControl.value;
    if (!member) {
      return;
    }

    const layout: KtdGridLayout = JSON.parse(JSON.stringify(this.layout));

    //Check if member is alreay in the layout
    const memberDoesExist = layout.find((ele) => ele.id === member.id);
    if (memberDoesExist) {
      this.toastr.error(
        this.translateService.instant(
          'SystemSettingsModule.AddCommitteeSignaturesComponent.memberAlreayExist'
        )
      );
      return;
    }
    //The added rectangle will be in row of either 2 positions: 1- the last row  2- A new row
    const lastLayoutRectangle = layout[layout.length - 1];
    let x = 0;
    let y = 0;
    if (lastLayoutRectangle) {
      if (lastLayoutRectangle.x + lastLayoutRectangle.w + this.RectangleWidth <= this.cols) {
        //The added rectangle will be in the last row as it fits it
        x = lastLayoutRectangle.x + lastLayoutRectangle.w;
        y = lastLayoutRectangle.y;
      } else {
        //The added rectangle will be in a new row as the last row won't fit it
        x = 0;
        y = lastLayoutRectangle.y + 1;
      }
    }

    layout.push({
      id: member.id,
      x,
      y,
      h: this.RectangleHeight,
      w: this.RectangleWidth,
      minH: this.RectangleHeight,
      maxH: this.RectangleHeight,
    });
    this.layout = layout;
    this.memberControl.setValue('');
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateSignatureFormat) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateSignatureFormat)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}
