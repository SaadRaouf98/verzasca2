import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActionType } from '@core/enums/action-type.enum';
import { ApprovedAmountMechanism } from '@core/enums/approved-amount-mechanism.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { RecordType } from '@core/enums/record-type.enum';
import { AllEntities, Entity } from '@core/models/entity.model';
import { OrganizationUnit } from '@core/models/organization-unit.model';
import { Attachment, RequestExportRecommendation } from '@core/models/request.model';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import { environment } from '@env/environment';
import { TranslateService } from '@ngx-translate/core';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import {
  downloadBlobOrFile,
  isSmallDeviceWidthForPopup,
  isTouched,
  isWordFile,
} from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';

import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { NoteType } from '@core/enums/note-type.enum';
import { LetterType } from '@core/enums/letter-type.enum';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-study-project-modal',
  templateUrl: './study-project-modal.component.html',
  styleUrls: ['./study-project-modal.component.scss'],
  //encapsulation: ViewEncapsulation.None,
})
export class StudyProjectModalComponent implements OnInit {
  showUpload: boolean = false;
  environment = environment;
  disableSubmitBtn: boolean = false;
  form!: FormGroup;
  organizationUnitsList: OrganizationUnit[] = [];
  processTypeJustificationsList: Entity[] = [];
  recommendationTypesList$: Observable<AllEntities> = new Observable();
  outComesList: Entity[] = [];
  ExportedDocumentType = ExportedDocumentType;

  // Export document type options for app-select
  exportedDocumentTypeOptions = [
    {
      id: this.ExportedDocumentType.Letter,
      title: this.translateService.instant('TransactionsModule.ExportDocumentComponent.letter'),
      value: this.ExportedDocumentType.Letter,
    },
    {
      id: this.ExportedDocumentType.Note,
      title: this.translateService.instant('TransactionsModule.ExportDocumentComponent.note'),
      value: this.ExportedDocumentType.Note,
    },
    {
      id: this.ExportedDocumentType.Record,
      title: this.translateService.instant('TransactionsModule.ExportDocumentComponent.record'),
      value: this.ExportedDocumentType.Record,
    },
  ];

  // Record type options for app-select
  recordTypeOptions = [
    {
      id: RecordType.MeetingRecord,
      title: this.translateService.instant('shared.meetingRecord'),
      value: RecordType.MeetingRecord,
    },
    {
      id: RecordType.HandoverRecord,
      title: this.translateService.instant('shared.handoverRecord'),
      value: RecordType.HandoverRecord,
    },
  ];

  // Note type options for app-select - will be initialized in ngOnInit
  noteTypeOptions: any[] = [];
  letterTypeOptions = [];
  ApprovedAmountMechanism = ApprovedAmountMechanism;

  // Amount mechanism options for app-select
  approvedAmountMechanismOptions = [
    {
      value: ApprovedAmountMechanism.WithinBudget,
      title: this.translateService.instant('shared.withinBudget'),
    },
    {
      value: ApprovedAmountMechanism.Extrabudgetary,
      title: this.translateService.instant('shared.extrabudgetary'),
    },
    {
      value: ApprovedAmountMechanism.Other,
      title: this.translateService.instant('shared.other'),
    },
  ];

  isFileUploaded = false;
  lang: string = 'ar';

  selectedMainTabIndex: number = 0;
  hasUserVisitedRecommendationTab: boolean = false;

  RecordType = RecordType;
  NoteType = NoteType;
  LetterType = LetterType;

  documentStudyFileExtension: string = '.docx';
  readonly dropDownProperties = ['id', 'title', 'titleEn'];

  @ViewChild('hiddenStudyDocumentUploadedAttachment')
  hiddenStudyDocumentUploadedAttachment!: ElementRef;
  @ViewChild('visibleStudyDocumentUploadedAttachment')
  visibleStudyDocumentUploadedAttachment!: ElementRef;

  @ViewChildren('fileToUpload')
  hiddenInputSupportAttachmentfileToUploadsHTML!: QueryList<ElementRef>;
  @ViewChildren('attachment')
  visibleInputSuuportAttachmentFileToUploadHTML!: QueryList<ElementRef>;
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  @ViewChild('uploadAttachment2') uploadAttachmentComponent2: any;
  //New Editor
  hasEditorLoaded: boolean = false;
  editorFileId: string = '';

  @ViewChild('editorForm') editorForm!: ElementRef;
  token: string = '';
  selectedTabIndex: number = 0;
  ActionType = ActionType;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      buttonLabel: string;
      requestId: string;
      requestAutoNumber: string;
      requestTitle: string;
      actionId: string;
      actionType: ActionType;
      formFields: {
        committeeId: string | undefined;
        exportType: ExportedDocumentType | null;
        requestExportRecommendation: RequestExportRecommendation | null;
        creditsRequestedAmount: number;
        creditsApprovedAmount: number;
        costsRequestedAmount: number;
        costsApprovedAmount: number;
      };
      editorFileId: string;
    },
    private dialogRef: MatDialogRef<StudyProjectModalComponent>,
    private manageSharedService: ManageSharedService,
    private languageService: LanguageService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    public sanitizer: DomSanitizer,
    private authService: AuthService,
    private currencyPipe: CurrencyPipe,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Initialize noteTypeOptions with proper translations
    this.noteTypeOptions = [
      {
        id: NoteType.ForInformation,
        title: this.translateService.instant('actions.study.noteType.forInformation'),
        value: NoteType.ForInformation,
      },
      {
        id: NoteType.CloseRequest,
        title: this.translateService.instant('actions.study.noteType.closeRequest'),
        value: NoteType.CloseRequest,
      },
      {
        id: NoteType.RequestStatement,
        title: this.translateService.instant('actions.study.noteType.requestStatement'),
        value: NoteType.RequestStatement,
      },
      {
        id: NoteType.Other,
        title: this.translateService.instant('actions.study.noteType.other'),
        value: NoteType.Other,
      },
    ];

    this.initializeForm();
    this.patchForm();
    this.initializeDropDownLists();
    this.onAddNewAttachment();
    this.lang = this.languageService.language;
    this.token = this.authService.getToken();
    this.editorFileId = this.data.editorFileId;

    // Listen to form value changes to update tab validation indicators
    this.form.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
    });

    // Handle exportType disabled state after view initialization
    setTimeout(() => {
      if (this.data.actionType !== ActionType.ExportTypeRecommendation) {
        this.form.get('basicsTab')?.get('exportType')?.disable();
      }
    }, 0);
  }
  onSelectedTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;
    this.form.updateValueAndValidity();
    this.cdr.detectChanges(); // Trigger change detection for tab validation
  }

  // Tab Navigation Methods
  getTotalTabsCount(): number {
    let count = 2; // basicsTab, attachmentsTab are always present (noteTab and studyDocumentTab are removed)

    // Add amountsTab if it should be visible
    const basicsTab = this.form.get('basicsTab');
    const exportType = basicsTab?.get('exportType')?.value;
    const recommendationType = basicsTab?.get('recommendationType')?.value;

    if (
      exportType === ExportedDocumentType.Record &&
      recommendationType !== environment.extendInvestigationId
    ) {
      count++; // This makes it 4 tabs total when amounts tab is visible
    }

    return count;
  }

  goToNextTab(): void {
    const totalTabs = this.getTotalTabsCount();
    if (this.selectedTabIndex < totalTabs - 1) {
      this.selectedTabIndex++;
      this.form.updateValueAndValidity();
      this.cdr.detectChanges(); // Trigger change detection for tab validation
    }
  }

  goToPreviousTab(): void {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex--;
      this.form.updateValueAndValidity();
      this.cdr.detectChanges(); // Trigger change detection for tab validation
    }
  }

  isLastTab(): boolean {
    const totalTabs = this.getTotalTabsCount();
    return this.selectedTabIndex === totalTabs - 1;
  }
  initializeForm(): void {
    this.form = new FormGroup(
      {
        basicsTab: new FormGroup(
          {
            committeeId: new FormControl(null, []),
            processTypeJustificationsIds: new FormControl(null, []),
            committeeChangeReason: new FormControl(null, []),
            recommendationType: new FormControl(null, []),
            extendDays: new FormControl(null, []),
            recommendationTypeComment: new FormControl(null, []),
            outcomeId: new FormControl(null, []),
            exportType: new FormControl(null, [Validators.required]),
            recordType: new FormControl(null, []),
            noteType: new FormControl(null, []),
            otherNoteType: new FormControl(null, []),
            letterType: new FormControl(null, []),
            comment: new FormControl(null, []),
          },
          {
            validators: this.validateBasicsTab(),
          }
        ),
        amountsTab: new FormGroup({
          creditsRequestedAmount: new FormControl(null, []),

          creditsApprovedAmount: new FormControl(null, []),
          costsRequestedAmount: new FormControl(null, []),
          costsApprovedAmount: new FormControl(null, []),

          creditsAmountMechanism: new FormControl(
            null, //ApprovedAmountMechanism.Extrabudgetary,
            []
          ),
          costsAmountMechanism: new FormControl(
            null, // ApprovedAmountMechanism.Extrabudgetary,
            []
          ),
        }),
        attachmentsTab: new FormGroup({
          attachments: new FormArray([], []),
          oldAttachments: new FormArray([], []), //optional
          originalUploadedFile: new FormControl(null, []),
          uploadedFile: new FormControl(null, []),
        }),
      },
      {
        validators: this.validateAmountsTab(),
      }
    );

    /* this.amountsTab.valueChanges.subscribe((form) => {
          if (form.creditsRequestedAmount) {
        const x = form.creditsRequestedAmount.replace(/[^0-9.]/g, '');
        const y = this.currencyPipe.transform(
          x.replace(/\D/g, '').replace(/^0+/, ''),
          'USD',
          'symbol',
          '1.0-2'
        );


        this.amountsTab.patchValue(
          {
            creditsRequestedAmount: y,
          },
          { emitEvent: false }
        );
      }

      if (form.creditsApprovedAmount) {
        this.amountsTab.patchValue(
          {
            creditsApprovedAmount: this.currencyPipe.transform(
              form.creditsApprovedAmount.replace(/[^0-9.]/g, ''),
              'SAR ', // Use 'SAR' as the currency code
              'symbol', // Display the currency symbol
              '1.0-2' // Minimum 1 integer digit, minimum 2 fraction digits, maximum 2 fraction digits
            ),
          },
          { emitEvent: false }
        );
      }

      if (form.costsRequestedAmount) {
        this.amountsTab.patchValue(
          {
            costsRequestedAmount: this.currencyPipe.transform(
              form.costsRequestedAmount.replace(/[^0-9.]/g, ''),
              'SAR ', // Use 'SAR' as the currency code
              'symbol', // Display the currency symbol
              '1.0-2' // Minimum 1 integer digit, minimum 2 fraction digits, maximum 2 fraction digits
            ),
          },
          { emitEvent: false }
        );
      }

      if (form.costsApprovedAmount) {
        this.amountsTab.patchValue(
          {
            costsApprovedAmount: this.currencyPipe.transform(
              form.costsApprovedAmount.replace(/[^0-9.]/g, ''),
              'SAR ', // Use 'SAR' as the currency code
              'symbol', // Display the currency symbol
              '1.0-2' // Minimum 1 integer digit, minimum 2 fraction digits, maximum 2 fraction digits
            ),
          },
          { emitEvent: false }
        );
      }
    });*/
  }

  private validateBasicsTab(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const errors: any = {};

      const exportType = form.get('exportType')?.value;

      const recordType = form.get('recordType')?.value;
      const noteType = form.get('noteType')?.value;
      const otherNoteType = form.get('otherNoteType')?.value;

      const letterType = form.get('letterType')?.value;

      // Subscribe to exportType changes to trigger validation updates
      if (form.get('exportType') && !form.get('exportType')?.hasError('subscription-setup')) {
        form.get('exportType')?.valueChanges.subscribe(() => {
          setTimeout(() => form.updateValueAndValidity({ emitEvent: false }), 0);
        });
        form.get('exportType')?.setErrors({ 'subscription-setup': true });
        if (form.get('exportType')?.value) {
          form.get('exportType')?.setErrors(null);
        }
      }

      // Subscribe to noteType changes to trigger validation updates
      if (form.get('noteType') && !form.get('noteType')?.hasError('subscription-setup')) {
        form.get('noteType')?.valueChanges.subscribe(() => {
          setTimeout(() => form.updateValueAndValidity({ emitEvent: false }), 0);
        });
        form.get('noteType')?.setErrors({ 'subscription-setup': true });
        if (form.get('noteType')?.value) {
          form.get('noteType')?.setErrors(null);
        }
      }

      if (exportType && exportType === ExportedDocumentType.Record) {
        if (!recordType) {
          errors.recordTypeRequired = true;
          form.get('recordType')?.setErrors({ required: true });
        } else {
          form.get('recordType')?.setErrors(null);
        }
      } else {
        form.get('recordType')?.setErrors(null);
      }

      if (exportType && exportType === ExportedDocumentType.Note) {
        if (!noteType) {
          errors.noteTypeRequired = true;
          form.get('noteType')?.setErrors({ required: true });
          // Mark as touched to ensure error shows
          form.get('noteType')?.markAsTouched();
        } else {
          form.get('noteType')?.setErrors(null);
        }

        if (noteType && noteType === NoteType.Other && !otherNoteType) {
          errors.otherNoteTypeRequired = true;
          form.get('otherNoteType')?.setErrors({ required: true });
          // Mark as touched to ensure error shows
          form.get('otherNoteType')?.markAsTouched();
        } else if (noteType === NoteType.Other) {
          form.get('otherNoteType')?.setErrors(null);
        }
      } else {
        form.get('noteType')?.setErrors(null);
        form.get('otherNoteType')?.setErrors(null);
      }

      /* if (exportType && exportType === ExportedDocumentType.Letter) {
        if (!letterType) {
          errors.letterTypeRequired = true;
        }
      } */

      ////////////////////////////////////////////////////
      const committeeId = form.get('committeeId')?.value;
      const processTypeJustificationsIds = form.get('processTypeJustificationsIds')?.value;
      const recommendationType = form.get('recommendationType')?.value;
      const outcomeId = form.get('outcomeId')?.value;

      if (exportType && exportType === ExportedDocumentType.Record) {
        if (!committeeId) {
          errors.committeeRequired = true;
        }

        if (!outcomeId) {
          errors.outcomeRequired = true;
        }

        if (
          !processTypeJustificationsIds ||
          (processTypeJustificationsIds && processTypeJustificationsIds.length === 0)
        ) {
          errors.processTypeJustificationsRequired = true;
        }

        if (!recommendationType) {
          errors.recommendationTypeRequired = true;
        }
      }

      ////////////////////////

      const extendDays = form.get('extendDays')?.value;
      if (recommendationType && recommendationType === environment.extendInvestigationId) {
        if (!extendDays || extendDays < 0) {
          errors.extendDaysRequired = true;
        }
      }

      return Object.keys(errors).length === 0 ? null : errors;
    };
  }

  private validateAmountsTab(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const errors: ValidationErrors = {};
      const recommendationType = form.get('basicsTab')!.get('recommendationType')?.value;

      if (
        recommendationType &&
        form.get('basicsTab')?.get('exportType')?.value === ExportedDocumentType.Record &&
        recommendationType !== environment.extendInvestigationId
      ) {
        const creditsRequestedAmount = form.get('amountsTab')!.get('creditsRequestedAmount')?.value;
        if (
          !creditsRequestedAmount ||
          (typeof creditsRequestedAmount === 'string' && !creditsRequestedAmount.trim().length)
        ) {
          errors['creditsRequestedAmountRequired'] = true;
        }

        const creditsApprovedAmount = form.get('amountsTab')!.get('creditsApprovedAmount')?.value;
        if (
          !creditsApprovedAmount ||
          (typeof creditsApprovedAmount === 'string' && !creditsApprovedAmount.trim().length)
        ) {
          errors['creditsApprovedAmountRequired'] = true;
        }

        const costsRequestedAmount = form.get('amountsTab')!.get('costsRequestedAmount')?.value;
        if (
          !costsRequestedAmount ||
          (typeof costsRequestedAmount === 'string' && !costsRequestedAmount.trim().length)
        ) {
          errors['costsRequestedAmountRequired'] = true;
        }

        const costsApprovedAmount = form.get('amountsTab')!.get('costsApprovedAmount')?.value;
        if (
          !costsApprovedAmount ||
          (typeof costsApprovedAmount === 'string' && !costsApprovedAmount.trim().length)
        ) {
          errors['costsApprovedAmountRequired'] = true;
        }

        const creditsAmountMechanism = form.get('amountsTab')!.get('creditsAmountMechanism')?.value;
        if (creditsAmountMechanism == null || creditsAmountMechanism === '') {
          errors['creditsAmountMechanismRequired'] = true;
        }

        const costsAmountMechanism = form.get('amountsTab')!.get('costsAmountMechanism')?.value;
        if (costsAmountMechanism == null || costsAmountMechanism === '') {
          errors['costsAmountMechanismRequired'] = true;
        }
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  setEditorHasLoaded() {
    this.hasEditorLoaded = true;
  }

  patchForm(): void {
    const {
      committeeId,
      exportType,
      requestExportRecommendation,
      creditsRequestedAmount,
      creditsApprovedAmount,
      costsRequestedAmount,
      costsApprovedAmount,
    } = this.data.formFields;
    this.form.patchValue({
      basicsTab: {
        committeeId,
        exportType,
      },
      amountsTab: {
        // creditsRequestedAmount: this.currencyPipe.transform(
        //   (creditsRequestedAmount + '').replace(/[^0-9.]/g, ''),
        //   'SAR ',
        //   'symbol',
        //   '1.2-2'
        // ),
        // creditsApprovedAmount: this.currencyPipe.transform(
        //   (creditsApprovedAmount + '').replace(/[^0-9.]/g, ''),
        //   'SAR ',
        //   'symbol',
        //   '1.2-2'
        // ),
        // costsRequestedAmount: this.currencyPipe.transform(
        //   (costsRequestedAmount + '').replace(/[^0-9.]/g, ''),
        //   'SAR ',
        //   'symbol',
        //   '1.2-2'
        // ),
        // costsApprovedAmount: this.currencyPipe.transform(
        //   (costsApprovedAmount + '').replace(/[^0-9.]/g, ''),
        //   'SAR ',
        //   'symbol',
        //   '1.2-2'
        // ),
      },
    });

    if (requestExportRecommendation) {
      this.form.get('basicsTab')?.patchValue({
        processTypeJustificationsIds: requestExportRecommendation.processTypeJustifications.map(
          (ele) => ele.id
        ),
        committeeChangeReason: requestExportRecommendation.committeeChangeReason,
        recommendationType: requestExportRecommendation.recommendationType?.id,
        extendDays: requestExportRecommendation.extendDays,
        recommendationTypeComment: requestExportRecommendation.recommendationTypeComment,
        outcomeId: requestExportRecommendation.outcome?.id,
        recordType: requestExportRecommendation.recordType,
        noteType: requestExportRecommendation.noteType,
        otherNoteType: requestExportRecommendation.otherNoteType,
      });

      if (requestExportRecommendation.creditsAmountMechanism) {
        this.form.get('amountsTab')?.patchValue({
          creditsAmountMechanism: requestExportRecommendation.creditsAmountMechanism,
        });
      }

      if (requestExportRecommendation.costsAmountMechanism) {
        this.form.get('amountsTab')?.patchValue({
          costsAmountMechanism: requestExportRecommendation.costsAmountMechanism,
        });
      }

      if (requestExportRecommendation.attachments) {
        for (const x of requestExportRecommendation.attachments) {
          (this.form.get('attachmentsTab')?.get('oldAttachments') as FormArray).push(
            new FormControl(x, [])
          );
        }
      }

      this.form.get('basicsTab')?.patchValue({
        comment: requestExportRecommendation.comment,
      });

      // Ensure form validation is updated after patching
      this.updateFormValidation();

      this.manageSharedService.requestsService
        .getRequestSingleAttachment(requestExportRecommendation.recommendation.id)
        .subscribe({
          next: (res) => {
            const file: File = new File([res], requestExportRecommendation.recommendation.name);

            this.attachmentsTab.patchValue({
              originalUploadedFile: file,
            });
          },
        });
    }
  }

  private updateFormValidation(): void {
    // Force form validation update with a small delay
    setTimeout(() => {
      this.form.updateValueAndValidity();

      // Specifically trigger basicsTab validation
      const basicsTab = this.form.get('basicsTab');
      if (basicsTab) {
        basicsTab.updateValueAndValidity();

        // Force validation on individual fields that might need it
        const exportType = basicsTab.get('exportType')?.value;
        if (exportType === ExportedDocumentType.Note) {
          const noteTypeControl = basicsTab.get('noteType');
          if (noteTypeControl) {
            noteTypeControl.updateValueAndValidity();
            // Ensure field is marked as touched so validation errors show
            if (!noteTypeControl.value) {
              noteTypeControl.markAsTouched();
            }
          }
        }
      }

      this.cdr.detectChanges();
    }, 50);
  }

  initializeDropDownLists(): void {
    this.manageSharedService.organizationUnitsService
      .getOrganizationUnitsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
        }
      )
      .subscribe({
        next: (res) => {
          this.organizationUnitsList = res.data;
        },
      });

    this.manageSharedService.processTypeJustificationsService
      .getProcessTypeJustificationsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        this.dropDownProperties
      )
      .subscribe({
        next: (res) => {
          this.processTypeJustificationsList = res.data;
        },
      });

    this.recommendationTypesList$ =
      this.manageSharedService.recommendationTypesService.getRecommendationTypesList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        undefined,
        undefined,
        ['id', 'title']
      );

    this.manageSharedService.outcomesService
      .getOutcomesList({
        pageSize: 100,
        pageIndex: 0,
      })
      .subscribe((res) => {
        this.outComesList = res.data;
      });
  }

  searchOnRecommendationTypes(event: { term: string; items: any[] }): void {
    this.recommendationTypesList$ =
      this.manageSharedService.recommendationTypesService.getRecommendationTypesList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          searchKeyword: event.term,
        },
        undefined,
        ['id', 'title']
      );
  }

  get isExportTypeDisabled(): boolean {
    return this.data.actionType !== ActionType.ExportTypeRecommendation;
  }

  get basicsTab(): FormGroup {
    return this.form?.get('basicsTab') as FormGroup;
  }

  get amountsTab(): FormGroup {
    return this.form?.get('amountsTab') as FormGroup;
  }

  get oldAttachments(): FormArray {
    return this.form?.get('attachmentsTab')?.get('oldAttachments') as FormArray;
  }

  get attachments(): FormArray {
    return this.form?.get('attachmentsTab')?.get('attachments') as FormArray;
  }

  get attachmentsTab(): FormGroup {
    return this.form?.get('attachmentsTab') as FormGroup;
  }

  // Tab validation methods
  isBasicsTabValid(): boolean {
    const basicsTab = this.form.get('basicsTab');
    if (!basicsTab) return false;

    // Check if tab has valid values and no errors
    const hasExportType = basicsTab.get('exportType')?.value;
    const exportType = basicsTab.get('exportType')?.value;

    // Basic validation - must have export type
    if (!hasExportType) return false;

    // Additional validations based on export type
    if (exportType === ExportedDocumentType.Record) {
      const hasCommittee = basicsTab.get('committeeId')?.value;
      const hasProcessTypeJustifications =
        basicsTab.get('processTypeJustificationsIds')?.value?.length > 0;
      const hasOutcome = basicsTab.get('outcomeId')?.value;
      const hasRecommendationType = basicsTab.get('recommendationType')?.value;

      return !!(
        hasCommittee &&
        hasProcessTypeJustifications &&
        hasOutcome &&
        hasRecommendationType
      );
    }

    // For other export types, check specific fields based on type
    if (exportType === ExportedDocumentType.Note) {
      const hasNoteType = basicsTab.get('noteType')?.value;
      if (hasNoteType === NoteType.Other) {
        const hasOtherNoteType = basicsTab.get('otherNoteType')?.value?.trim();
        return !!hasOtherNoteType;
      }
      return !!hasNoteType;
    }

    if (exportType === ExportedDocumentType.Letter) {
      const hasLetterType = basicsTab.get('letterType')?.value;
      return !!hasLetterType;
    }

    return false; // Don't show green until form has meaningful content
  }

  isAmountsTabValid(): boolean {
    const amountsTab = this.form.get('amountsTab');
    const basicsTab = this.form.get('basicsTab');

    // Only validate if amounts tab should be visible
    const exportType = basicsTab?.get('exportType')?.value;
    const recommendationType = basicsTab?.get('recommendationType')?.value;

    if (
      exportType !== ExportedDocumentType.Record ||
      recommendationType === environment.extendInvestigationId
    ) {
      return false; // Tab not visible, so don't show green icon
    }

    if (!amountsTab) return false;

    // Check required amount fields - all must have values
    const hasCreditsRequested = !!amountsTab.get('creditsRequestedAmount')?.value;
    const hasCreditsApproved = !!amountsTab.get('creditsApprovedAmount')?.value;
    const hasCostsRequested = !!amountsTab.get('costsRequestedAmount')?.value;
    const hasCostsApproved = !!amountsTab.get('costsApprovedAmount')?.value;
    const hasCreditsAmountMechanism = !!amountsTab.get('creditsAmountMechanism')?.value;
    const hasCostsAmountMechanism = !!amountsTab.get('costsAmountMechanism')?.value;

    return (
      hasCreditsRequested &&
      hasCreditsApproved &&
      hasCostsRequested &&
      hasCostsApproved &&
      hasCreditsAmountMechanism &&
      hasCostsAmountMechanism
    );
  }

  isAttachmentsTabValid(): boolean {
    const attachmentsTab = this.form.get('attachmentsTab');
    if (!attachmentsTab) return false;

    // Check if there are any attachments (either old or new)
    const oldAttachments = attachmentsTab.get('oldAttachments')?.value;
    const newAttachments = attachmentsTab.get('attachments')?.value;

    // Only show green if there are actual attachments
    const hasOldAttachments = oldAttachments && oldAttachments.length > 0;
    const hasNewAttachments = newAttachments && newAttachments.some((att: any) => att && att.name);

    return hasOldAttachments || hasNewAttachments;
  }

  isStudyDocumentValid(): boolean {
    const attachmentsTab = this.form.get('attachmentsTab');
    if (!attachmentsTab) return false;

    // Check uploaded file and original uploaded file in attachments tab
    const uploadedFile = attachmentsTab.get('uploadedFile')?.value;
    const originalUploadedFile = attachmentsTab.get('originalUploadedFile')?.value;

    // Check if user has provided meaningful content
    const hasUploadedFile = !!uploadedFile;
    const hasOriginalFile = !!originalUploadedFile;

    return !!(hasUploadedFile || hasOriginalFile);
  }

  // isNoteTabValid(): boolean {
  //   const noteTab = this.form.get('noteTab');
  //   if (!noteTab) return false;

  //   // Check if note has meaningful content
  //   const hasNote = noteTab.get('comment')?.value?.trim();

  //   // Only show green icon if there's actual content
  //   return !!hasNote;
  // }

  // Used to get a strongly typed FormControl
  getFormControlByIndex(formArray: FormArray, index: number): FormControl {
    return formArray.controls[index] as FormControl;
  }

  x() {}

  /*  onSelectedMainTabChange(event: MatTabChangeEvent): void {
    if (event.tab.textLabel === 'مستند الدراسة') {
      this.hasUserVisitedRecommendationTab = true;
    }
  } */

  onSelectTab(tabIndex: number, tabTitle?: string) {
    this.selectedMainTabIndex = tabIndex;

    if (tabTitle === 'مستند الدراسة') {
      this.hasUserVisitedRecommendationTab = true;
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      autoFocus: false,
      minWidth: '31.25rem',
      maxWidth: '31.25rem',
      maxHeight: '44.3125rem',
      panelClass: 'action-modal',
      disableClose: true,
      data: {
        msg: 'هل انت متأكد من الاستكمال وتأكيد العملية ؟',
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((dialogResult: { statusCode: ModalStatusCode; status: string }) => {
        if (dialogResult.statusCode === ModalStatusCode.Success) {
          this.sendData();
        }
      });
  }

  private sendData(): void {
    try {
      this.disableSubmitBtn = true;
      const {
        basicsTab: {
          committeeChangeReason, //string
          committeeId, //string
          exportType, // 1,
          recordType,
          noteType,
          otherNoteType,
          outcomeId, //string,
          processTypeJustificationsIds, //string[],
          recommendationType,
          extendDays, //: {id: string, title: string}
          recommendationTypeComment, //string
          comment, //string
        },
        amountsTab: {
          costsAmountMechanism, //enum
          creditsAmountMechanism, //enum
          costsApprovedAmount, //number
          costsRequestedAmount, //number
          creditsApprovedAmount, //number
          creditsRequestedAmount, //number
        },
        attachmentsTab: {
          attachments, //File[]
          uploadedFile,
          originalUploadedFile,
        },
      } = this.form.getRawValue();

      if (!this.hasUserVisitedRecommendationTab && originalUploadedFile) {
        const dataToSend = {
          exportType,
          recordType,
          noteType,
          otherNoteType,
          recommendationTypeId: recommendationType || null,
          extendDays: null,
          recommendationTypeComment: recommendationTypeComment || null,
          creditsRequestedAmount: null,
          creditsApprovedAmount: null,
          creditsAmountMechanism: null,
          costsRequestedAmount: null,
          costsApprovedAmount: null,
          costsAmountMechanism: null,
          committeeId: exportType === ExportedDocumentType.Record ? committeeId : null,
          processTypeJustificationsIds,
          committeeChangeReason,
          outcomeId,
          comment,
          recommendation: originalUploadedFile,
          attachments: attachments.filter((ele: File | string) => ele != ''),
        };
        if (
          exportType === ExportedDocumentType.Record &&
          recommendationType &&
          recommendationType !== environment.extendInvestigationId
        ) {
          (dataToSend.creditsRequestedAmount as number | null) =
            typeof creditsRequestedAmount === 'string'
              ? parseFloat(creditsRequestedAmount.replace('SAR', '').replaceAll(',', ''))
              : creditsRequestedAmount;

          (dataToSend.creditsApprovedAmount as number | null) =
            typeof creditsApprovedAmount === 'string'
              ? parseFloat(creditsApprovedAmount.replace('SAR', '').replaceAll(',', ''))
              : creditsApprovedAmount;

          dataToSend.creditsAmountMechanism = creditsAmountMechanism;

          (dataToSend.costsRequestedAmount as number | null) =
            typeof costsRequestedAmount === 'string'
              ? parseFloat(costsRequestedAmount.replace('SAR', '').replaceAll(',', ''))
              : costsRequestedAmount;

          (dataToSend.costsApprovedAmount as number | null) =
            typeof costsApprovedAmount === 'string'
              ? parseFloat(costsApprovedAmount.replace('SAR', '').replaceAll(',', ''))
              : costsApprovedAmount;
          dataToSend.costsAmountMechanism = costsAmountMechanism;
        } else {
          dataToSend.extendDays = extendDays;
        }

        this.executeRequestAction(dataToSend);

        return;
      }

      // Handle study document upload
      if (!uploadedFile && !originalUploadedFile) {
        this.toastr.warning(this.translateService.instant('shared.uploadFileOrUseEditor'));
        this.disableSubmitBtn = false;
        return;
      }

      const dataToSend = {
        exportType,
        recordType,
        noteType,
        otherNoteType,
        recommendationTypeId: recommendationType || null,
        extendDays: null,
        recommendationTypeComment: recommendationTypeComment || null,
        creditsRequestedAmount: null,
        creditsApprovedAmount: null,
        creditsAmountMechanism: null,
        costsRequestedAmount: null,
        costsApprovedAmount: null,
        costsAmountMechanism: null,
        committeeId: exportType === ExportedDocumentType.Record ? committeeId : null,
        processTypeJustificationsIds,
        committeeChangeReason,
        outcomeId,
        comment,
        recommendation: this.isFileUploaded ? uploadedFile || originalUploadedFile : '',
        attachments: attachments.filter((ele: File | string) => ele != ''),
      };

      if (
        exportType === ExportedDocumentType.Record &&
        recommendationType &&
        recommendationType !== environment.extendInvestigationId
      ) {
        (dataToSend.creditsRequestedAmount as number | null) =
          typeof creditsRequestedAmount === 'string'
            ? parseFloat(creditsRequestedAmount.replace('SAR', '').replaceAll(',', ''))
            : creditsRequestedAmount;

        (dataToSend.creditsApprovedAmount as number | null) =
          typeof creditsApprovedAmount === 'string'
            ? parseFloat(creditsApprovedAmount.replace('SAR', '').replaceAll(',', ''))
            : creditsApprovedAmount;

        dataToSend.creditsAmountMechanism = creditsAmountMechanism;

        (dataToSend.costsRequestedAmount as number | null) =
          typeof costsRequestedAmount === 'string'
            ? parseFloat(costsRequestedAmount.replace('SAR', '').replaceAll(',', ''))
            : costsRequestedAmount;

        (dataToSend.costsApprovedAmount as number | null) =
          typeof costsApprovedAmount === 'string'
            ? parseFloat(costsApprovedAmount.replace('SAR', '').replaceAll(',', ''))
            : costsApprovedAmount;
        dataToSend.costsAmountMechanism = costsAmountMechanism;
      } else {
        dataToSend.extendDays = extendDays;
      }

      this.executeRequestAction(dataToSend);
    } catch (e) {
      this.disableSubmitBtn = false;
      this.toastr.warning(this.translateService.instant('shared.completeFillingFields'));
    }
  }

  private executeRequestAction(data: any) {
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data,
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  isTouched(groupName: string, controlName: string): boolean | undefined {
    return isTouched(this.form.get(groupName) as FormGroup, controlName);
  }

  ////////////////////////////////// انشاء مستند الدراسة (من خلال ال editor)  //////////////////////////////////////

  /* onAddDocumentFileToPatchInEditor(): void {
    let htmlElement: HTMLInputElement =
      this.hiddenStudyDocumentAttachment.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  onDocumentFileChangeToPatchInEditor(e: any): void {
    const filesArray = e.target.files;
    if (filesArray.length > 0) {
      this.uploadDocumentFileToPatchInEditor(filesArray[0]);
    }
  }

  async uploadDocumentFileToPatchInEditor(file: File): Promise<any> {
    if (!isWordFile(`.${file.name.split('.').pop()}`)) {
      this.toastr.error(
        this.translateService.instant('shared.fileShouldBeWord')
      );
      return;
    }

    let hiddenStudyDocumentAttachmentHtmlElement: HTMLInputElement =
      this.hiddenStudyDocumentAttachment.nativeElement;
    hiddenStudyDocumentAttachmentHtmlElement.disabled = true;

    const visibleStudyDocumentAttachmentHtmlElement: HTMLInputElement =
      this.visibleStudyDocumentAttachment.nativeElement;

    visibleStudyDocumentAttachmentHtmlElement.value = file.name;
    visibleStudyDocumentAttachmentHtmlElement.disabled = true;

    getWindow();

    setTimeout(function () {

      //@ts-ignore
      //@ts-ignore
      window['app'].map.insertFile(file);
    }, 100);
  } */

  //////////////////// رفع مستند الدراسة (ليس من خلال ال editor) /////////////////////////

  onDownloadUploadedStudyDocumentAttachment(): void {
    const fileToDownload: File = this.attachmentsTab.get('originalUploadedFile')?.value;

    downloadBlobOrFile(fileToDownload.name, undefined, fileToDownload);
  }

  onStudyDocumentFileDropped(e: DragEvent): void {
    const file = e.dataTransfer!.files[0];

    this.uploadDocumentFileToNotPatchInEditor(file);

    e.preventDefault();
  }

  onAddDocumentFileToNotPatchInEditor(): void {
    const htmlElement: HTMLInputElement = this.hiddenStudyDocumentUploadedAttachment.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  onDocumentFileChangeToNotPatchInEditor(e: any): void {
    const files: File[] = [];
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }
    if (files) {
      this.uploadDocumentFileToNotPatchInEditor(files[0]);
    }
  }

  uploadDocumentFileToNotPatchInEditor(file: File): void {
    if (!isWordFile(file.name)) {
      this.toastr.error(this.translateService.instant('shared.fileShouldBeWord'));
      return;
    }

    if (Array.isArray(file)) {
      file = file[file.length - 1];
    }
    this.attachmentsTab.patchValue({
      uploadedFile: file,
    });
    if (this.uploadAttachmentComponent2) {
      // Robust comparison for file name
      const uploadedFile = this.uploadAttachmentComponent2.uploadedFiles.find((f: any) => {
        const fName = f.file.name || f.file?.originalName;
        return fName && file.name && fName.toLowerCase().trim() === file.name.toLowerCase().trim();
      });
      if (uploadedFile) {
        this.uploadAttachmentComponent2.completeUpload(uploadedFile.id);
      }
    }
    this.isFileUploaded = true;

    this.cdr.detectChanges();
  }

  onDeleteDocumentFileToNotPatchInEditor(): void {
    const hiddenStudyDocumentUploadedAttachmentHtmlElement: HTMLInputElement =
      this.hiddenStudyDocumentUploadedAttachment.nativeElement;
    hiddenStudyDocumentUploadedAttachmentHtmlElement.disabled = false;

    const visibleStudyDocumentUploadedAttachmentHtmlElement: HTMLInputElement =
      this.visibleStudyDocumentUploadedAttachment.nativeElement;
    visibleStudyDocumentUploadedAttachmentHtmlElement.disabled = false;

    this.attachmentsTab.patchValue({
      uploadedFile: null,
    });
  }

  /////////////////////////////////////////////////////////

  onAttachmentFileDropped(e: DragEvent, index: number): void {
    e.preventDefault();
    const files = e.dataTransfer!.files;
    for (const file of Array.from(files)) {
      this.uploadFile(file, index);
      if (files.length > 1) {
        index++;
        this.onAddNewAttachment();
        this.cdr.detectChanges();
      }
    }
  }

  onAddFile(index: number): void {
    const hiddenInputHtmlElement: HTMLInputElement =
      this.hiddenInputSupportAttachmentfileToUploadsHTML.filter((ele, i) => i === index)[0]
        .nativeElement;
    hiddenInputHtmlElement.value = '';
    hiddenInputHtmlElement.click();
  }

  onFileChange(e: any, index: number): void {
    const filesArray = e.target.files;

    if (filesArray.length > 0) {
      this.uploadFile(filesArray[0], index);
    }
  }
  deleteFile() {
    this.attachmentsTab.patchValue({
      uploadedFile: null,
    });
    this.attachmentsTab.patchValue({ uploadedFile: null });
    this.showUpload = true;
    this.cdr.detectChanges();
  }
  onDeleteFile(index: number): void {
    this.attachments.controls[index]?.patchValue('');
  }

  onAddNewAttachment() {
    if (this.attachments.length === 0) {
      this.attachments.push(new FormControl('', []));
    } else {
      if (!this.attachments.controls[this.attachments.length - 1].value) {
        return;
      }
      this.attachments.push(new FormControl('', []));
    }
  }

  onFileDropped(files: FileList | File[]): void {
    // Convert FileList to array if needed
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      // Find the first empty attachment slot or create a new one
      let targetIndex = this.attachments.controls.findIndex((control) => !control.value);

      if (targetIndex === -1) {
        // No empty slots, add new attachment
        this.onAddNewAttachment();
        targetIndex = this.attachments.length - 1;
      }

      // Upload the file to the target index
      this.uploadFile(file, targetIndex);
    });

    this.cdr.detectChanges();
  }
  uploadFile(file: File, index: number): void {
    // Ensure file is a File object, not an array
    if (Array.isArray(file)) {
      file = file[file.length - 1];
    }
    this.attachments.controls[index]?.patchValue(file);
    if (this.uploadAttachmentComponent) {
      // Robust comparison for file name
      const uploadedFile = this.uploadAttachmentComponent.uploadedFiles.find((f: any) => {
        const fName = f.file.name || f.file?.originalName;
        return fName && file.name && fName.toLowerCase().trim() === file.name.toLowerCase().trim();
      });
      if (uploadedFile) {
        this.uploadAttachmentComponent.completeUpload(uploadedFile.id);
      }
    }
  }

  onViewFile(attachment: Attachment): void {
    window.open(
      `${window.location.origin}/imports-exports/attachments/${attachment.id}?name=${attachment.name}`,
      '_blank'
    );
  }

  compareFn(
    obj1: { id: string; name: string; title?: string; titleEn?: string },
    obj2: { id: string; name: string; title?: string; titleEn?: string }
  ): boolean {
    return obj1?.id === obj2?.id;
  }
}
