import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  DestroyRef,
  ElementRef,
  EmbeddedViewRef,
  inject,
  Inject,
  Injector,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '@core/services/language.service';
import {
  compareFn,
  downloadBlobOrFile,
  formatDateToYYYYMMDD,
  isTouched,
} from '@shared/helpers/helpers';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DocumentExportTo } from '@core/enums/document-export-to.enum';
import { DocumentExportWay } from '@core/enums/document-export-way.enum';
import { switchMap } from 'rxjs/operators';
import { AllEntities, Entity } from '@core/models/entity.model';
import * as moment from 'moment';
import { CustomItemMustHaveValueValidator } from '@shared/custom-validators/custom-item-must-have-value.validator';

import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { Attachment, RequestCurrentExport } from '@core/models/request.model';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { BarcodePlaceHolderComponent } from '../barcode-place-holder/barcode-place-holder.component';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NewHijriCalendarComponent } from '../new-hijri-calendar/new-hijri-calendar.component';
import { RequestProgressType } from '@core/enums/request-progress-type.enum';
import { FoundationsService } from '@core/services/backend-services/foundations.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  host: { '(document:click)': 'hideContextMenu($event)' },

  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.scss'],
})
export class ExportModalComponent {
  destroyRef = inject(DestroyRef);
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  DocumentExportTo = DocumentExportTo;
  DocumentExportWay = DocumentExportWay;

  isRecordFileLoading: boolean = true;

  recordFile: {
    fileBlob: Blob | undefined;
    pdfSrc: Int8Array | undefined;
    name: string;
  } = {
    fileBlob: undefined,
    pdfSrc: undefined,
    name: this.data.currentExport.name,
  };

  lang: string = 'ar';
  RequestProgressType = RequestProgressType;

  readonly dropDownProperties = ['id', 'title', 'titleEn'];

  /////////////////////////
  barcode!: ComponentRef<BarcodePlaceHolderComponent> | null;
  lastContextMenu!: { parent: any; x: number; y: number } | undefined;
  @ViewChild(PdfViewerComponent, { static: true })
  pdfViewer!: PdfViewerComponent;
  @ViewChild('contextmenuEl', { static: true }) contextmenuElement!: ElementRef;
  @ViewChild('pdfHolder', { static: true }) pdfholder!: ElementRef;
  showThumbnails = false;
  contextmenuOpened!: boolean;

  compareFn = compareFn;

  // Foundations list for app-select
  foundationsList: { id: string; title: string }[] = [];

  // Export ways options for app-select
  exportWayOptions = [
    {
      id: DocumentExportWay.None,

      translationKey: 'TransactionsModule.ExportDocumentComponent.none',
    },
    {
      id: DocumentExportWay.Mail,

      translationKey: 'TransactionsModule.ExportDocumentComponent.mail',
    },
    {
      id: DocumentExportWay.Email,

      translationKey: 'TransactionsModule.ExportDocumentComponent.email',
    },
    {
      id: DocumentExportWay.Fax,

      translationKey: 'TransactionsModule.ExportDocumentComponent.fax',
    },
    {
      id: DocumentExportWay.Handover,

      translationKey: 'TransactionsModule.ExportDocumentComponent.handover',
    },
    {
      id: DocumentExportWay.Other,

      translationKey: 'TransactionsModule.ExportDocumentComponent.other',
    },
  ];

  // Export destination options for app-select
  exportToOptions = [
    {
      id: DocumentExportTo.RC,
      translationKey: 'shared.RC',
    },
    {
      id: DocumentExportTo.EE,
      translationKey: 'shared.EE',
    },
  ];
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      buttonLabel: string;
      requestId: string;
      actionId: string;
      requestAutoNumber: string;
      currentExport: RequestCurrentExport;
      currentProgress: RequestProgressType;
      foundations: Entity[];
    },
    private dialogRef: MatDialogRef<ExportModalComponent>,
    private manageSharedService: ManageSharedService,
    private languageService: LanguageService,
    private injector: Injector,
    private appRef: ApplicationRef,
    private resolver: ComponentFactoryResolver,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private foundationsService: FoundationsService
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;

    this.initializeForm();
    this.loadFoundations(); // Load foundations list
    this.patchFoundations();
    this.loadRecordFile();
    this.detectBarcodePlaceHolderDeletion();
    this.translatedExportWayOptions();
    this.translatedExportToOptions();
  }
  // Get export way options with translated labels
  translatedExportWayOptions() {
    this.exportWayOptions = this.exportWayOptions.map((option) => ({
      ...option,
      displayLabel: this.translateService.instant(option.translationKey),
    }));
  }

  // Get export destination options with translated labels
  translatedExportToOptions() {
    this.exportToOptions = this.exportToOptions.map((option) => ({
      ...option,
      displayLabel: this.translateService.instant(option.translationKey),
    }));
  }
  initializeForm(): void {
    this.form = new FormGroup(
      {
        basicsTab: new FormGroup({
          exportingMethod: new FormControl('', [Validators.required]),
          exportTo: new FormControl(DocumentExportTo.EE, [Validators.required]),
          foundations: new FormControl('', []),
          physicalHijriDate: new FormControl('', [Validators.required]),
          physicalGregorianDate: new FormControl('', [Validators.required]),
        }),
        documentTab: new FormGroup({}),
      },
      {
        validators: [
          CustomItemMustHaveValueValidator(
            'basicsTab.foundations',
            'basicsTab.exportTo',
            DocumentExportTo.EE
          ),
        ],
      }
    );
  }

  patchFoundations(): void {
    this.basicsTab?.patchValue({
      foundations: this.data.foundations,
    });
  }
  loadFoundations(): void {
    this.foundationsService
      .getFoundationsList(
        {
          pageSize: 100, // Load more foundations initially
          pageIndex: 0,
        },
        {
          parentId: null,
          searchKeyword: '',
        },
        undefined,
        ['id', 'title']
      )
      .subscribe({
        next: (res) => {
          this.foundationsList = res.data;
        },
      });
  }
  loadRecordFile(): void {
    this.isRecordFileLoading = true;

    this.manageSharedService.exportableDocumentService
      .getExportablePdfDocument(this.data.currentExport.id, true)
      .subscribe({
        next: async (res) => {
          this.isRecordFileLoading = false;
          this.recordFile.fileBlob = res;
          this.recordFile.pdfSrc = new Int8Array(await res.arrayBuffer());
        },
      });
  }

  detectBarcodePlaceHolderDeletion(): void {
    this.manageSharedService.BarcodePlaceHoldersDeletion.subscribe({
      next: (toDelete) => {
        if (toDelete && this.barcode) {
          this.appRef.detachView(this.barcode!.hostView);
          this.barcode = null;
        }
      },
    });
  }

  onDownloadRecordFile(): void {
    if (this.recordFile.fileBlob) {
      downloadBlobOrFile(this.recordFile.name, this.recordFile.fileBlob);
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    /*  if (!this.barcode) {
      this.toastr.warning(
        this.translateService.instant(
          'SharedModule.ExportModalComponent.barcodeMustInserted'
        )
      );
      return;
    } */

    this.disableSubmitBtn = true;

    const {
      basicsTab: { exportingMethod, exportTo, foundations, physicalGregorianDate },
      documentTab: {},
    } = this.form.value;

    const dataToSend: any = {
      exportingMethod,
      exportTo,
      foundationsIds: Array.isArray(foundations)
        ? foundations
            .map((ele: any) => {
              // Handle both Entity objects and plain IDs
              if (typeof ele === 'string') {
                return ele;
              } else if (ele && typeof ele === 'object' && ele.id) {
                return ele.id;
              } else {
                console.warn('Invalid foundation element:', ele);
                return null;
              }
            })
            .filter((id) => id !== null) // Remove null values
        : [],
      physicalGregorianDate,
    };

    if (this.barcode) {
      dataToSend.barcode = {
        page: this.barcode.instance.pageNumber,
        top: 100 * (this.barcode.instance.top / this.barcode.instance.parentHeight),
        left: 100 * (this.barcode.instance.left / this.barcode.instance.parentWidth),
        width: 100 * (this.barcode.instance.width / this.barcode.instance.parentWidth),
        height: 100 * (this.barcode.instance.height / this.barcode.instance.parentHeight),
      };
    }
    this.executeRequestAction(dataToSend);
  }

  private executeRequestAction(data: any) {
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data,
    });
  }
  private isUpdating = false;
  onPatchFormPhysicalHijriDate(date: any): void {
    if (this.isUpdating) return; // Prevent recursion

    this.isUpdating = true;
    if (date && date.hijriDate) {
      this.manageSharedService.UmAlQuraCalendarService.getGregorianDate(
        `${date.hijriDate.year}/${date.hijriDate.month}/${date.hijriDate.day}`
      )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: string) => {
          this.basicsTab.patchValue(
            {
              physicalHijriDate: `${date.hijriDate.year}-${date.hijriDate.month}-${date.hijriDate.day}`,
              physicalGregorianDate: `${res.split('/')[0]}-${res.split('/')[1]}-${
                res.split('/')[2]
              }`,
            },
            { emitEvent: false }
          );
          this.isUpdating = false; // Reset flag
        });
    } else {
      this.basicsTab.patchValue(
        {
          physicalHijriDate: null,
          physicalGregorianDate: null,
        },
        { emitEvent: false }
      );
    }

    this.basicsTab.get('physicalHijriDate')?.markAsTouched();
    this.basicsTab.get('physicalGregorianDate')?.markAsTouched();
  }
  onPatchFormPhysicalGregorianDate(date: { gregorianDate: NgbDateStruct }): void {
    if (this.isUpdating) return; // Prevent recursion

    this.isUpdating = true;
    if (date && date.gregorianDate) {
      this.manageSharedService.UmAlQuraCalendarService.getHijriDate(
        `${date.gregorianDate.year}/${date.gregorianDate.month}/${date.gregorianDate.day}`
      )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: string) => {
          this.basicsTab.patchValue(
            {
              physicalHijriDate: `${res.split('/')[0]}-${res.split('/')[1]}-${res.split('/')[2]}`,
              physicalGregorianDate: `${date.gregorianDate.year}-${date.gregorianDate.month}-${date.gregorianDate.day}`,
            },
            { emitEvent: false }
          );
          this.isUpdating = false; // Reset flag
        });
    } else {
      this.basicsTab.patchValue(
        {
          physicalHijriDate: null,
          physicalGregorianDate: null,
        },
        { emitEvent: false }
      );
      this.isUpdating = false; // Reset flag
    }

    this.basicsTab.get('physicalHijriDate')?.markAsTouched();
    this.basicsTab.get('physicalGregorianDate')?.markAsTouched();
  }

  isTouched(groupName: string, controlName: string): boolean | undefined {
    return isTouched(this.form.get(groupName) as FormGroup, controlName);
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  get basicsTab(): FormGroup {
    return this.form?.get('basicsTab') as FormGroup;
  }

  get documentTab(): FormGroup {
    return this.form?.get('documentTab') as FormGroup;
  }

  ////////////////////////////////////////////////////////////////////

  hideContextMenu(e: any) {
    this.contextmenuOpened = false;
  }

  toggleThumbnails() {
    this.showThumbnails = !this.showThumbnails;
    window.dispatchEvent(new Event('resize'));
    this.updateViewer();
  }

  updateViewer() {
    this.pdfViewer.updateSize();
  }

  createBarcodePlaceholderComponent() {
    if (this.barcode) {
      this.barcode.destroy();
      this.barcode = null;
    }
    //1)- Call api to get barcode image
    this.manageSharedService.exportableDocumentService
      .getBarcode(this.data.currentExport.id)
      .subscribe({
        next: (res) => {
          //2)- Add to DOM
          const componentRef = this.resolver
            .resolveComponentFactory(BarcodePlaceHolderComponent)
            .create(this.injector);

          componentRef.instance.top = 0 * this.lastContextMenu!.parent.clientHeight;

          componentRef.instance.left = 0 * this.lastContextMenu!.parent.clientWidth;

          componentRef.instance.width = 170;

          componentRef.instance.height = 100;

          componentRef.instance.pageNumber = parseInt(
            this.lastContextMenu!.parent.getAttribute('data-page-number')
          );

          componentRef.instance.parentHeight = this.lastContextMenu!.parent.clientHeight;
          componentRef.instance.parentWidth = this.lastContextMenu!.parent.clientWidth;

          componentRef.instance.barcodeImageSrc = `data:image/png;base64,${res}`;

          this.appRef.attachView(componentRef.hostView);
          const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

          this.barcode = componentRef;
          this.lastContextMenu!.parent.appendChild(domElem);
        },
      });
  }

  contextmenu(e: any) {
    //e is <pdf-viewer>

    this.contextmenuOpened = true;
    e.preventDefault();

    this.contextmenuElement.nativeElement.style.position = 'fixed';
    this.contextmenuElement.nativeElement.style.left = e.clientX + 'px';
    this.contextmenuElement.nativeElement.style.top = e.clientY + 'px';

    let parent: any = e.srcElement;
    let safeCounter = 0;

    while (!parent.classList.contains('page') && safeCounter < 100) {
      parent = parent.parentNode;
      safeCounter++;
    }

    this.lastContextMenu = {
      parent: parent, //<div class="page" data-page-number=""
      x: e.layerX, //e is <pdf-viewer>
      y: e.layerY, //e is <pdf-viewer>
    };
  }

  onSetIfFoundationIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('foundations')?.markAsTouched();
    } else {
      this.form.get('foundations')?.markAsUntouched();
    }
  }
}
