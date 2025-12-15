import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentExportTo } from '@core/enums/document-export-to.enum';
import { DocumentExportWay } from '@core/enums/document-export-way.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { AllEntities, Entity } from '@core/models/entity.model';
import {
  AddExportDocumentCommand,
  ExportableDocument,
} from '@core/models/exportable-document.model';
import { Transaction } from '@core/models/transaction.model';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { SuccessModalComponent } from '@shared/components/success-modal/success-modal.component';
import { CustomItemMustHaveValueValidator } from '@shared/custom-validators/custom-item-must-have-value.validator';
import { shouldInsertBothOrNoneValidator } from '@shared/custom-validators/should-insert-both-or-none.validator';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isPdfFile, isTouched } from '@shared/helpers/helpers';

import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { LanguageService } from '@core/services/language.service';
import { AddBarcodeExportableDocumentComponent } from '../add-barcode-exportable-document/add-barcode-exportable-document.component';
import { PlaceHolder } from '@core/models/placeHolder.model';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Classification } from '@core/models/classification.model';
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { FoundationsService } from '@core/services/backend-services/foundations.service';
import { Foundation } from '@core/models/foundation.model';
import { UsersService } from '@core/services/backend-services/users.service';
import { User } from '@core/models/user.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-export-document',
  templateUrl: './add-export-document.component.html',
  styleUrls: ['./add-export-document.component.scss'],
})
export class AddExportDocumentComponent implements OnInit {
  private viewedAttachmentIds = new Set<string>();
  lang: string = 'ar';
  form!: FormGroup;
  DocumentExportWay = DocumentExportWay;
  DocumentExportTo = DocumentExportTo;
  physicalHijriDateCalendarInput!: string;
  disableSubmitBtn: boolean = false;
  containerDetails!: Transaction;
  RequestContainerStatus = RequestContainerStatus;
  DocumentType = ExportedDocumentType;
  documentTypes: { id: string; title: string }[] = [];
  containersList$: Observable<{
    data: { id: string; title: string; transactionNumber: number }[];
    totalCount: number;
  }> = new Observable();

  mappedContainersList: { displayText: string; value: any }[] = [];
  mappedRequestsList: { displayText: string; value: any }[] = [];

  requestsList$: Observable<{
    data: {
      id: string;
      title: string;
      number?: number;
      autoNumber?: number;
      importNumber?: number;
    }[];
    totalCount: number;
  }> = new Observable();

  exportId: string = '';

  compareFn = compareFn;
  readonly dropDownProperties = ['id', 'title', 'titleEn'];

  classificationsList: Classification[] = [];
  ClassificationLevel = ClassificationLevel;
  foundationsList: Foundation[] = [];
  usersList: User[] = [];

  // Pagination tracking for containers
  containersPageIndex: number = 0;
  containersPageSize: number = 20;
  totalContainers: number = 0;

  exportingMethodOptions: { value: any; displayText: string }[] = [];
  documentTypeOptions: { value: any; displayText: string }[] = [];
  exportToOptions: { value: any; displayText: string }[] = [];

  // Track uploaded files and their IDs
  attachmentIds: string[] = [];
  uploadedFilesMeta: { name: string; id: string }[] = [];
  exportDocumentId: string = '';
  edit: boolean = false;
  @ViewChild('visibleFileToUpload') visibleFileToUpload!: ElementRef;
  @ViewChild('hiddenFileToUpload') hiddenFileToUpload!: ElementRef;
  existingExportFiles: any[] = [];
  existingAttachmentFiles: any[] = [];
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  @ViewChild('uploadAttachment2') uploadAttachmentComponent2: any;
  constructor(
    private manageImportsExportsService: ManageImportsExportsService,
    private languageService: LanguageService,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private toastr: CustomToastrService,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private foundationsService: FoundationsService,
    private usersService: UsersService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.initializeExportingMethodOptions();
    this.initializeDocumentTypeOptions();
    this.initializeExportToOptions();
    this.initializeDropDownLists();
    this.initializeForm();

    this.exportId = this.activatedRoute.snapshot.params['exportId'];
    if (this.exportId) {
      this.edit = true;
      this.manageImportsExportsService.exportableDocumentService
        .getExportableDocumentById(this.exportId)
        .subscribe({
          next: (res) => {
            this.patchForm(res);
          },
        });
    }
  }

  initializeExportingMethodOptions(): void {
    this.exportingMethodOptions = [
      {
        value: this.DocumentExportWay.None,
        displayText: this.translateService.instant(
          'TransactionsModule.ExportDocumentComponent.none'
        ),
      },
      {
        value: this.DocumentExportWay.Mail,
        displayText: this.translateService.instant(
          'TransactionsModule.ExportDocumentComponent.mail'
        ),
      },
      {
        value: this.DocumentExportWay.Email,
        displayText: this.translateService.instant(
          'TransactionsModule.ExportDocumentComponent.email'
        ),
      },
      {
        value: this.DocumentExportWay.Fax,
        displayText: this.translateService.instant(
          'TransactionsModule.ExportDocumentComponent.fax'
        ),
      },
      {
        value: this.DocumentExportWay.Handover,
        displayText: this.translateService.instant(
          'TransactionsModule.ExportDocumentComponent.handover'
        ),
      },
      {
        value: this.DocumentExportWay.Other,
        displayText: this.translateService.instant(
          'TransactionsModule.ExportDocumentComponent.other'
        ),
      },
    ];
  }

  initializeDocumentTypeOptions(): void {
    this.documentTypeOptions = [
      {
        value: this.DocumentType.Letter,
        displayText: this.translateService.instant(
          'TransactionsModule.ExportDocumentComponent.letter'
        ),
      },
      {
        value: this.DocumentType.Note,
        displayText: this.translateService.instant(
          'TransactionsModule.ExportDocumentComponent.note'
        ),
      },
      {
        value: this.DocumentType.Record,
        displayText: this.translateService.instant(
          'TransactionsModule.ExportDocumentComponent.record'
        ),
      },
      {
        value: this.DocumentType.Other,
        displayText: 'أخرى',
      },
    ];
  }

  initializeExportToOptions(): void {
    this.exportToOptions = [
      {
        value: this.DocumentExportTo.RC,
        displayText: this.translateService.instant('shared.RC'),
      },
      {
        value: this.DocumentExportTo.EE,
        displayText: this.translateService.instant('shared.EE'),
      },
    ];
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        id: new FormControl(null, []),
        autoNumber: new FormControl(null, []),
        exportNumber: new FormControl(null, [Validators.required, Validators.pattern(/^\d+$/)]),
        requestContainerId: new FormControl(null, []),
        request: new FormControl(null, []),
        exportingMethod: new FormControl(null, [Validators.required]),
        documentType: new FormControl(null, [Validators.required]),
        otherDocumentTypeId: new FormControl(null, []),
        exportTo: new FormControl(null, [Validators.required]),
        foundations: new FormControl(null, []),
        title: new FormControl(null, [Validators.required]),
        description: new FormControl(null, []),
        physicalHijriDate: new FormControl(null, [Validators.required]),
        physicalGregorianDate: new FormControl(null, [Validators.required]),
        document: new FormControl(null, [Validators.required]),
        attachments: new FormControl(null, []),
        barcode: new FormControl(null, []),
        isInitiated: new FormControl(false, []),
        isSigned: new FormControl(false, []),
        classification: new FormControl(null, [Validators.required]),
        users: new FormControl(null, []),
      },
      {
        validators: [
          CustomItemMustHaveValueValidator('foundations', 'exportTo', DocumentExportTo.EE),
          CustomItemMustHaveValueValidator(
            'otherDocumentTypeId',
            'documentType',
            ExportedDocumentType.Other
          ),

          shouldInsertBothOrNoneValidator('requestContainerId', 'request'),
          this.validateUsersBasedOnClassification(),
        ],
      }
    );
  }

  private validateUsersBasedOnClassification(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const usersVal = form.get('users')?.value;
      if (
        form.get('classification')?.value?.classificationLevel === ClassificationLevel.Restricted &&
        (!usersVal || usersVal.length === 0)
      ) {
        return {
          usersRequired: true,
        };
      }

      return null;
    };
  }

  initializeDropDownLists(): void {
    this.manageImportsExportsService.documentTypesService
      .getDocumentTypesList({ pageIndex: 0, pageSize: 100 }, undefined, undefined)
      .subscribe({
        next: (res) => {
          this.documentTypes = res.data;
        },
      });

    this.containersList$ = this.manageImportsExportsService.requestContainersService
      .getTransactionsListLookup(
        {
          pageSize: this.containersPageSize,
          pageIndex: this.containersPageIndex,
        },
        undefined,
        undefined
      )
      .pipe(
        tap((response) => {
          this.totalContainers = response.totalCount;
          this.mappedContainersList = response.data.map((container) => ({
            displayText: `(${container.transactionNumber})-${container.title}`,
            value: container,
          }));
        })
      );

    // Subscribe to ensure the mappedContainersList is populated
    this.containersList$.subscribe();

    this.manageImportsExportsService.classificationsService
      .getClassificationsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        {
          isActive: true,
        },
        undefined,
        ['id', 'title', 'titleEn', 'classificationLevel']
      )
      .subscribe({
        next: (res) => {
          this.classificationsList = res.data;
        },
      });

    // Load foundations list
    this.foundationsService
      .getFoundationsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        {
          parentId: null, // Get top-level foundations
        },
        undefined,
        ['id', 'title', 'titleEn']
      )
      .subscribe({
        next: (res) => {
          this.foundationsList = res.data;
        },
      });

    // Load users list
    this.usersService
      .getUsersList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        ['id', 'name', 'userName', 'email']
      )
      .subscribe({
        next: (res) => {
          this.usersList = res.data;
        },
      });
  }

  patchForm(data: ExportableDocument): void {
    // ...existing code for patching form fields...
    if (data.requestContainer) {
      this.containersList$ = of({
        data: [data.requestContainer],
        totalCount: 1,
      });
      this.mappedContainersList = [
        {
          displayText: `(${data.requestContainer.transactionNumber})-${data.requestContainer.title}`,
          value: data.requestContainer.id,
        },
      ];
    }
    if (data.request) {
      this.requestsList$ = of({ data: [data.request], totalCount: 1 });
      this.mappedRequestsList = [
        {
          displayText: `(${data.request.autoNumber})-${data.request.title}`,
          value: data.request.id,
        },
      ];
    }

    // Push foundations from data to foundationsList array
    if (data.foundations && data.foundations.length > 0) {
      const existingFoundationIds = new Set(this.foundationsList.map((f) => f.id));
      const foundationObjects = data.foundations.filter(
        (f) => typeof f === 'object' && f !== null
      ) as Foundation[];
      const newFoundations = foundationObjects.filter((f) => !existingFoundationIds.has(f.id));
      if (newFoundations.length > 0) {
        this.foundationsList = [...this.foundationsList, ...newFoundations];
      }
    }

    const physicalHijriDateString = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(new Date(data.physicalDate));
    const physicalHijriDateParts = physicalHijriDateString.replace(' AH', '').split('/');
    const physicalHijriReorderedDate = `${physicalHijriDateParts[2]}/${physicalHijriDateParts[0]}/${physicalHijriDateParts[1]}`;
    this.exportDocumentId = data.document.id;
    this.form.patchValue({
      id: data.id,
      autoNumber: data.autoNumber,
      exportNumber: data.exportNumber,
      requestContainerId: data.requestContainer?.id,
      request: data.request?.id,
      exportingMethod: data.exportingMethod,
      documentType: data.documentType,
      otherDocumentTypeId: data.otherDocumentType?.id,
      exportTo: data.exportedToRC ? DocumentExportTo.RC : DocumentExportTo.EE,
      foundations: data.foundations
        ? data.foundations.map((f) => (typeof f === 'object' && f !== null ? f.id : f))
        : [],
      title: data.title,
      description: data.description,
      physicalHijriDate: physicalHijriReorderedDate,
      physicalGregorianDate: data.physicalDate,
      document: data.document,
      exportedDate: data.exportedDate,
      isInitiated: data.isInitiated,
      isSigned: data.isSigned,
      classification: data.classification.id,
      users: data.users
        ? data.users.map((f) => (typeof f === 'object' && f !== null ? f.id : f))
        : [],
    });
    this.patchHijriDate(data.physicalDate);
    // Set files for edit mode
    this.existingExportFiles = data.document ? [data.document] : [];
    this.existingAttachmentFiles = data.attachments || [];
    // For edit mode, set attachmentIds from existingAttachmentFiles only if not already set
    if (!this.attachmentIds || this.attachmentIds.length === 0) {
      this.attachmentIds = (data.attachments || [])
        .map((att: any) => (typeof att === 'object' && att.id ? att.id : att))
        .filter((id: any) => !!id);
    }
    this.cdRef.detectChanges();
  }

  showAccessUsers: boolean = false;
  onClassificationChanges(): void {
    const classificationId = this.form.get('classification')!.value;

    // If classification is cleared, don't make any requests
    if (!classificationId) {
      this.showAccessUsers = false;
      this.form.patchValue({
        users: null,
        requestType: null,
      });
      return;
    }
    const classificationObj = this.classificationsList.find((c) => c.id === classificationId);
    this.manageImportsExportsService.classificationsService
      .getClassificationUsersById(classificationId)
      .subscribe((res) => {
        this.showAccessUsers =
          classificationObj?.classificationLevel === ClassificationLevel.Restricted ? true : false;
        this.form.patchValue({
          users: res.map((u) => u.id),
        });

        // Push classification users directly to the usersList array
        const existingUserIds = new Set(this.usersList.map((u) => u.id));
        const newUsers = res.filter((u) => !existingUserIds.has(u.id));
        if (newUsers.length > 0) {
          this.usersList = [...this.usersList, ...newUsers];
        }
      });
  }
  // Handle export file removal
  onExportFileRemoved(file: any): void {
    this.existingExportFiles = [];
    // Clear exportDocumentId so documentId is not sent in payload
    this.exportDocumentId = '';
  }
  // Handle attachment removal
  onAttachmentRemoved(file: any): void {
    if (file.id) {
      this.attachmentIds = this.attachmentIds.filter((id) => id !== file.id);
      this.uploadedFilesMeta = this.uploadedFilesMeta.filter((f) => f.id !== file.id);
      this.existingAttachmentFiles = this.existingAttachmentFiles.filter((f) => {
        if (typeof f === 'object' && f.id) {
          return f.id !== file.id;
        }
        return f !== file.id;
      });
    } else {
      const meta = this.uploadedFilesMeta.find((f) => f.name === file.name);
      if (meta) {
        this.attachmentIds = this.attachmentIds.filter((id) => id !== meta.id);
        this.uploadedFilesMeta = this.uploadedFilesMeta.filter((f) => f.id !== meta.id);
        // this.existingAttachmentFiles = this.existingAttachmentFiles.filter(
        //   (f) => {
        //     if (typeof f === 'object' && f.id) {
        //       return f.id !== meta.id;
        //     }
        //     return f !== meta.id;
        //   }
        // );
      }
    }
  }

  patchHijriDate(physicalDateDateTime: string) {
    const physicalDate = physicalDateDateTime.split('T')[0];
    this.onPatchFormPhysicalGregorianDate({
      gregorianDate: {
        day: parseInt(physicalDate.split('-')[2]),
        month: parseInt(physicalDate.split('-')[1]),
        year: parseInt(physicalDate.split('-')[0]),
      },
    });
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.disableSubmitBtn = true;

    if (!this.exportId) {
      this.manageImportsExportsService.exportableDocumentService
        .addExportableDocument(this.mapDataToBeSend())
        .subscribe({
          next: (res) => {
            this.disableSubmitBtn = false;
            this.toastr.success(
              this.translateService.instant(
                'TransactionsModule.ExportDocumentComponent.exportedSuccessfully'
              )
            );

            const dialogRef = this.dialog.open(SuccessModalComponent, {
              minWidth: '31.25rem',
              maxWidth: '31.25rem',
              panelClass: 'action-modal',
              autoFocus: false,
              disableClose: true,
              data: {
                title: 'shared.processDone',
                content: this.translateService.instant('shared.exportSerialNumberIs'),
                specialContent: ` (${res.exportNumber})`,
              },
            });

            dialogRef
              .afterClosed()
              .subscribe((dialogResult: { statusCode: ModalStatusCode; status: string }) => {
                if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
                  this.router.navigate(['imports-exports']);
                }
              });
          },
          error: (err) => {
            this.disableSubmitBtn = false;
            this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
          },
        });
    } else {
      this.manageImportsExportsService.exportableDocumentService
        .updateExportableDocument({
          ...this.mapDataToBeSend(),
          id: this.exportId,
        })
        .subscribe({
          next: (res) => {
            this.disableSubmitBtn = false;
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
            this.router.navigate(['imports-exports']);
          },
          error: (err) => {
            this.disableSubmitBtn = false;
            this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
          },
        });
    }
  }

  private mapDataToBeSend(): AddExportDocumentCommand {
    const {
      id,
      request,
      exportNumber,
      documentId,
      description,
      exportTo,
      exportingMethod,
      documentType,
      otherDocumentTypeId,
      foundations,
      physicalGregorianDate,
      physicalHijriDate,

      title,
      barcode,
      isInitiated,
      isSigned,
      classification,
      users,
    } = this.form.getRawValue();

    // Merge IDs from uploadedFilesMeta and existingAttachmentFiles
    const existingIds = (this.existingAttachmentFiles || [])
      .map((att: any) => (typeof att === 'object' && att.id ? att.id : att))
      .filter((id: any) => !!id);
    const newIds = (this.uploadedFilesMeta || []).map((meta) => meta.id).filter((id: any) => !!id);
    // Combine and deduplicate
    const filteredAttachmentIds = Array.from(
      new Set([...existingIds, ...this.attachmentIds, ...newIds])
    );
    const dataToSend = {
      physicalDate: physicalGregorianDate,
      exportingMethod,
      documentType,
      otherDocumentTypeId: otherDocumentTypeId ? otherDocumentTypeId : null,
      exportedToRC: exportTo === DocumentExportTo.RC,
      exportNumber,
      foundationsIds:
        foundations && foundations.length
          ? foundations // foundations is already an array of IDs due to bindValue="'id'"
          : [],
      requestId: request?.id ? request.id : request,
      // document: this.exportDocumentId,
      title,
      description,
      barcode,
      isInitiated:
        this.form.get('documentType')?.value === ExportedDocumentType.Record ? false : isInitiated,
      isSigned:
        this.form.get('documentType')?.value === ExportedDocumentType.Record ? false : isSigned,
      classificationId: classification, // classification is already an ID due to bindValue="'id'"
      usersIds:
        this.getSelectedClassification()?.classificationLevel === ClassificationLevel.Restricted &&
        users &&
        users.length
          ? users.map((ele) => (typeof ele === 'object' ? ele.id : ele))
          : [],
      documentId: this.exportDocumentId,
      attachmentIds: filteredAttachmentIds,
    };
    return dataToSend;
  }

  onSelectedContainerChanged(): void {
    const requestContainerId = this.form.get('requestContainerId')?.value;

    if (requestContainerId) {
      // this.requestsList$ = this.manageImportsExportsService.requestsService
      //   .getImportsAndExportsRequestsList(
      //     {
      //       pageSize: 10,
      //       pageIndex: 0,
      //     },
      //     {
      //       requestContainer: { id: requestContainerId.id, title: '' },
      //       isExportDocument: false,
      //     },
      //     undefined,
      //     ['id', 'title', 'number']
      //   )
      //   .pipe(
      //     tap((response) => {
      //       this.mappedRequestsList = response.data.map((request) => ({
      //         displayText: `(${request.number})-${request.title}`,
      //         value: request,
      //       }));
      //     })
      //   );

      this.requestsList$ = this.manageImportsExportsService.requestsService
        .getImportsAndExportsRequestsListNew(requestContainerId.id)
        .pipe(
          tap((response) => {
            this.mappedRequestsList = response.data.map((request) => ({
              displayText: `(${request.importNumber})-${request.title}`,
              value: request,
            }));
          })
        );

      // Subscribe to ensure the mappedRequestsList is populated
      this.requestsList$.subscribe();
    }
    //Clear the request
    this.form.patchValue({
      request: null,
    });
  }

  onDocumentTypeSelectionChange(): void {
    const documentType = this.form.get('documentType')?.value;
    const request = this.form.get('request')?.value;

    this.manageImportsExportsService.exportableDocumentService
      .getExportNumber(documentType, request?.id)
      .subscribe({
        next: (res) => {
          this.form.patchValue({
            exportNumber: res,
          });
        },
      });
  }

  onResetRequestsList(): void {
    this.requestsList$ = of({ data: [], totalCount: 0 });
    this.mappedRequestsList = [];
  }

  onResetContainersList(): void {
    this.containersList$ = of({ data: [], totalCount: 0 });
    this.mappedContainersList = [];
  }

  searchOnContainers(event: { term: string; items: any[] }) {
    // Reset pagination when searching
    this.containersPageIndex = 0;

    this.containersList$ = this.manageImportsExportsService.requestContainersService
      .getTransactionsListLookup(
        {
          pageSize: this.containersPageSize,
          pageIndex: 0,
        },
        {
          searchKeyword: event.term,
        },
        undefined,
        undefined
      )
      .pipe(
        tap((response) => {
          this.totalContainers = response.totalCount;
          this.mappedContainersList = response.data.map((container) => ({
            displayText: `(${container.transactionNumber})-${container.title}`,
            value: container,
          }));
        })
      );
  }

  loadMoreContainers(): void {
    // Check if there are more containers to load
    if (this.mappedContainersList.length >= this.totalContainers) {
      return;
    }

    this.containersPageIndex++;
    this.manageImportsExportsService.requestContainersService
      .getTransactionsListLookup(
        {
          pageSize: this.containersPageSize,
          pageIndex: this.containersPageIndex,
        },
        undefined,
        undefined
      )
      .subscribe({
        next: (response) => {
          const newContainers = response.data.map((container) => ({
            displayText: `(${container.transactionNumber})-${container.title}`,
            value: container,
          }));
          this.mappedContainersList = [...this.mappedContainersList, ...newContainers];
        },
      });
  }

  searchOnRequests(event: { term: string; items: any[] }): void {
    this.requestsList$ = this.manageImportsExportsService.requestsService
      .getImportsAndExportsRequestsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          requestContainer: {
            id: this.form.get('requestContainerId')?.value?.id,
            title: '',
          },
          isExportDocument: false,
          searchKeyword: event.term,
        },
        undefined,
        ['id', 'title']
      )
      .pipe(
        tap((response) => {
          this.mappedRequestsList = response.data.map((request) => ({
            displayText: `(${request.number})-${request.title}`,
            value: request,
          }));
        })
      );
  }

  onAddDocumentFile(): void {
    let htmlElement: HTMLInputElement = this.hiddenFileToUpload.nativeElement;
    htmlElement.value = '';
    htmlElement.click();
  }

  onDocumentFileChange(e: any): void {
    const filesArray = e.target.files;
    if (filesArray.length > 0) {
      this.uploadDocumentFile(filesArray[0]);
    }
  }

  // Upload main document file and get its ID
  uploadDocumentFile(file: File): void {
    if (!isPdfFile(file.name)) {
      this.toastr.error(this.translateService.instant('shared.fileShouldBePdf'));
      return;
    }

    // Upload file and get ID
    this.manageImportsExportsService.wopiFilesService.createFile(file).subscribe((res) => {
      if (res) {
        this.exportDocumentId = res;
        // Update form with the file for display purposes
        this.form.patchValue({
          document: file,
        });
      }
    });
  }
  onFileDropped(e: any): void {
    const files: File[] = [];
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    files.forEach((file) => {
      this.manageImportsExportsService.wopiFilesService.createFile(file).subscribe((res) => {
        if (res) {
          this.uploadedFilesMeta = this.uploadedFilesMeta.filter((f) => f.name !== file.name);
          this.uploadedFilesMeta.push({ name: file.name, id: res });
          if (!this.attachmentIds.includes(res)) {
            this.attachmentIds = [...this.attachmentIds, res];
          }
          if (this.uploadAttachmentComponent2) {
            // Find the uploaded file object by name and pass its ID to completeUpload
            const uploadedFile = this.uploadAttachmentComponent2.uploadedFiles.find(
              (f: any) => (f.file.name || f.file?.originalName) === file.name
            );
            if (uploadedFile) {
              this.uploadAttachmentComponent2.completeUpload(uploadedFile.id);
            }
          }
        }
      });
    });
  }

  // Handle attachment removal
  // onAttachmentRemoved(): void {
  //   // Clear all attachments when files are removed
  //   this.attachmentIds = [];
  //   this.uploadedFileNames = [];
  // }
  onExportFileDropped(e: any): void {
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        this.manageImportsExportsService.wopiFilesService.createFile(value).subscribe((res) => {
          if (res) {
            this.exportDocumentId = res;
            // Update form with the file for display purposes
            this.form.patchValue({
              document: value,
            });
            if (this.uploadAttachmentComponent) {
              // Find the uploaded file object by name and pass its ID to completeUpload
              const uploadedFile = this.uploadAttachmentComponent.uploadedFiles.find(
                (f: any) => (f.file.name || f.file?.originalName) === value.name
              );
              if (uploadedFile) {
                this.uploadAttachmentComponent.completeUpload(uploadedFile.id);
              }
            }
          }
        });
      }
    }
  }
  uploadExportDocumentFile(file: File): void {
    if (!isPdfFile(file.name)) {
      this.toastr.error(this.translateService.instant('shared.fileShouldBePdf'));
      return;
    }

    this.form.patchValue({
      document: file,
    });
  }
  // This method is for attachments, not the main document
  uploadAttachmentFile(file: File): void {
    this.form.patchValue({
      attachments: file,
    });
  }
  onDeleteDocumentFile(): void {
    const hiddenInputHtmlElement: HTMLInputElement = this.hiddenFileToUpload.nativeElement;
    hiddenInputHtmlElement.disabled = false;

    const visibleInputHtmlElement: HTMLInputElement = this.visibleFileToUpload.nativeElement;
    visibleInputHtmlElement.disabled = false;

    // Clear the document ID when file is removed
    this.exportDocumentId = '';

    this.form.patchValue({
      document: null,
    });
  }

  onViewAttachment(e?: any): void {
    // If a file is passed as parameter (from upload component), use it
    // Otherwise, get the main document file from form (for backward compatibility)
    const file: File & {
      id: string;
      name: string;
      path: string;
      contentType: string;
    } = e || this.form.get('document')?.value;

    if (!file) {
      this.toastr.error('No file selected to view');
      return;
    }

    // If file.id is missing, try to get it from uploadedFilesMeta
    let fileId = file.id;
    if (!fileId && file.name) {
      const meta = this.uploadedFilesMeta.find((f) => f.name === file.name);
      if (meta) {
        fileId = meta.id;
      }
    }

    if (fileId) {
      if (this.exportId) {
        // Determine if this is the first view or not
        const firstView = !this.viewedAttachmentIds.has(fileId);
        this.manageImportsExportsService.wopiFilesService
          .getTemporaryFile(fileId, firstView)
          .subscribe({
            next: (res) => {
              const newFile = new File([res], file.name);
              const dialogRef = this.dialog.open(AddBarcodeExportableDocumentComponent, {
                minWidth: '62.5rem',
                maxWidth: '62.5rem',
                maxHeight: '95vh',
                height: '95vh',
                panelClass: ['action-modal', 'float-footer'],
                autoFocus: false,
                disableClose: true,
                data: {
                  fileId: fileId,
                  file: newFile,
                  attachmentId: fileId,
                  mode: 'edit',
                  exportId: this.exportId,
                },
              });

              dialogRef.afterClosed().subscribe(
                (dialogResult: {
                  statusCode: ModalStatusCode;
                  status: string;
                  data: {
                    barcode: PlaceHolder | null;
                  };
                }) => {
                  if (
                    dialogResult &&
                    dialogResult.statusCode === ModalStatusCode.Success &&
                    dialogResult.data
                  ) {
                    this.form.patchValue({
                      barcode: dialogResult.data.barcode,
                    });
                  }
                }
              );
              // Mark as viewed
              this.viewedAttachmentIds.add(fileId);
            },
          });
      } else {
        this.manageImportsExportsService.requestsService
          .getRequestSingleAttachment(fileId)
          .subscribe({
            next: (res) => {
              const newFile = new File([res], file.name);
              const dialogRef = this.dialog.open(AddBarcodeExportableDocumentComponent, {
                minWidth: '62.5rem',
                maxWidth: '62.5rem',
                maxHeight: '95vh',
                height: '95vh',
                panelClass: ['action-modal', 'float-footer'],
                autoFocus: false,
                disableClose: true,
                data: {
                  fileId: fileId,
                  file: newFile,
                  attachmentId: fileId,
                  mode: '',
                  exportId: '',
                },
              });

              dialogRef.afterClosed().subscribe(
                (dialogResult: {
                  statusCode: ModalStatusCode;
                  status: string;
                  data: {
                    barcode: PlaceHolder | null;
                  };
                }) => {
                  if (
                    dialogResult &&
                    dialogResult.statusCode === ModalStatusCode.Success &&
                    dialogResult.data
                  ) {
                    this.form.patchValue({
                      barcode: dialogResult.data.barcode,
                    });
                  }
                }
              );
            },
          });
      }
    } else {
      const dialogRef = this.dialog.open(AddBarcodeExportableDocumentComponent, {
        minWidth: '62.5rem',
        maxWidth: '62.5rem',
        maxHeight: '95vh',
        height: '95vh',
        panelClass: ['action-modal', 'float-footer'],
        autoFocus: false,
        disableClose: true,
        data: {
          file: file,
          fileId: file.id,
          attachmentId: this.getAttachmentIdForFile(file),
          mode: this.exportId ? 'edit' : '',
          exportId: this.exportId ? this.exportId : '',
        },
      });

      dialogRef.afterClosed().subscribe(
        (dialogResult: {
          statusCode: ModalStatusCode;
          status: string;
          data: {
            barcode: PlaceHolder | null;
          };
        }) => {
          if (
            dialogResult &&
            dialogResult.statusCode === ModalStatusCode.Success &&
            dialogResult.data
          ) {
            this.form.patchValue({
              barcode: dialogResult.data.barcode,
            });
          }
        }
      );
    }
  }

  goToLastPage(): void {
    this.location.back();
  }

  onPatchFormPhysicalHijriDate(date: { hijriDate: NgbDateStruct }): void {
    if (date.hijriDate) {
      this.manageImportsExportsService.UmAlQuraCalendarService.getGregorianDate(
        `${date.hijriDate.year}/${date.hijriDate.month}/${date.hijriDate.day}`
      ).subscribe({
        next: (res) => {
          this.form.patchValue(
            {
              physicalHijriDate: `${date.hijriDate.year}-${date.hijriDate.month}-${date.hijriDate.day}`,
              physicalGregorianDate: `${res.split('/')[0]}-${res.split('/')[1]}-${
                res.split('/')[2]
              }`,
            },
            { emitEvent: false }
          );
        },
      });
    } else {
      this.form.patchValue(
        {
          physicalHijriDate: null,
          physicalGregorianDate: null,
        },
        { emitEvent: false }
      );
    }

    this.form.get('physicalHijriDate')?.markAsTouched();
    this.form.get('physicalGregorianDate')?.markAsTouched();
  }

  onPatchFormPhysicalGregorianDate(date: { gregorianDate: NgbDateStruct }): void {
    if (date.gregorianDate) {
      this.manageImportsExportsService.UmAlQuraCalendarService.getHijriDate(
        `${date.gregorianDate.year}/${date.gregorianDate.month}/${date.gregorianDate.day}`
      ).subscribe({
        next: (res) => {
          this.form.patchValue(
            {
              physicalHijriDate: `${res.split('/')[0]}-${res.split('/')[1]}-${res.split('/')[2]}`,
              physicalGregorianDate: `${date.gregorianDate.year}-${date.gregorianDate.month}-${date.gregorianDate.day}`,
            },
            { emitEvent: false }
          );
        },
      });
    } else {
      this.form.patchValue(
        {
          physicalHijriDate: null,
          physicalGregorianDate: null,
        },
        { emitEvent: false }
      );
    }

    this.form.get('physicalHijriDate')?.markAsTouched();
    this.form.get('physicalGregorianDate')?.markAsTouched();
  }

  onSetIfFoundationIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('foundations')?.markAsTouched();
    } else {
      this.form.get('foundations')?.markAsUntouched();
    }
  }

  onSetIfUserIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('users')?.markAsTouched();
    } else {
      this.form.get('users')?.markAsUntouched();
    }
  }
  getSelectedClassification() {
    const selectedId = this.form.get('classification')?.value;
    return this.classificationsList.find((c) => c.id === selectedId);
  }

  // Helper method to get the correct attachment ID for a file
  private getAttachmentIdForFile(file: File): string {
    // Check if this is the main document file
    const mainDocumentFile = this.form.get('document')?.value;
    if (mainDocumentFile && file.name === mainDocumentFile.name) {
      return this.exportDocumentId;
    }

    // For attachment files, we need to find the corresponding ID
    const meta = this.uploadedFilesMeta.find((f) => f.name === file.name);
    if (meta) {
      return meta.id;
    }

    // Fallback: return the export document ID
    return this.exportDocumentId;
  }
}
