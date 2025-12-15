import { RequestStatus } from '@core/enums/request-status.enum';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
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
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import * as moment from 'moment';
import { DatePipe, Location } from '@angular/common';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { Classification } from '@core/models/classification.model';
import { Observable, of, tap } from 'rxjs';
import { Priority } from '@core/models/priority.model';

import { Attachment, RequestDetails, UpdateRequestCommand } from '@core/models/request.model';
import { EditFileWithBarcodeModalComponent } from '@pages/imports-exports/modals/edit-file-with-barcode-modal/edit-file-with-barcode-modal.component';
import { OrganizationUnit } from '@core/models/organization-unit.model';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { UsersService } from '@core/services/backend-services/users.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-edit-import',
  templateUrl: './edit-import.component.html',
  styleUrls: ['./edit-import.component.scss'],
})
export class EditImportComponent implements OnInit {
  get gregorianTodayDate(): Date {
    return new Date(
      this.gregorianToday.year,
      this.gregorianToday.month - 1,
      this.gregorianToday.day
    );
  }
  lang: string = 'ar';
  form!: FormGroup;
  requestId: string = '';
  allowEditContainer: boolean = true;
  deliveryHijriDateCalendarInput!: string;
  classificationsList: Classification[] = [];
  prioritiesList: Priority[] = [];
  containersList$: Observable<{
    data: any[];
    totalCount: number;
  }> = new Observable();
  foundationsList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();
  subFoundationsList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();
  concernedFoundationsList: { id: string; title: string; titleEn: string }[] = [];
  requestTypesList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
    groupCount: number;
  }> = new Observable();
  disableSubmitFormDetailsBtn: boolean = false;

  RequestStatus = RequestStatus;
  existingRequestAttachments!: Attachment[];

  organizationUnitsList: OrganizationUnit[] = [];
  compareFn = compareFn;
  showAccessUsers: boolean = false;
  mappedContainersList: { displayText: string; value: any }[] = [];
  readonly dropDownProperties = ['id', 'title', 'titleEn'];
  readonly dropDownPropertiesClass = ['id', 'title', 'titleEn', 'classificationLevel'];

  gregorianToday: NgbDateStruct = {
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };

  hijriToday!: NgbDateStruct;
  @Output() nextStep: EventEmitter<{
    requestId: string;
  }> = new EventEmitter();
  @Output() previousStep: EventEmitter<void> = new EventEmitter();

  @ViewChild('visibleFileToUpload') visibleFileToUpload!: ElementRef;
  @ViewChild('hiddenFileToUpload') hiddenFileToUpload!: ElementRef;
  usersList$: Observable<{
    data: { id: string; name: string }[];
    totalCount: number;
  }> = new Observable();
  constructor(
    private languageService: LanguageService,
    private dialog: MatDialog,
    private router: Router,
    private location: Location,
    private translateService: TranslateService,
    private manageImportsExportsService: ManageImportsExportsService,
    private toastr: CustomToastrService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.requestId = this.activatedRoute.snapshot.params['requestId'];
    this.initializeForm();
    this.intializeDropDownLists();
    this.usersList$ = this.usersService.getUsersList(
      {
        pageSize: 1000,
        pageIndex: 0,
      },
      undefined,
      undefined,
      ['id', 'name']
    );
    this.manageImportsExportsService.UmAlQuraCalendarService.getHijriDate(
      `${this.gregorianToday.year}/${this.gregorianToday.month}/${this.gregorianToday.day}`
    ).subscribe({
      next: (res) => {
        this.hijriToday = {
          day: parseInt(res.split('/')[2]),
          month: parseInt(res.split('/')[1]),
          year: parseInt(res.split('/')[0]),
        };
      },
    });

    if (this.requestId) {
      this.manageImportsExportsService.requestsService.getRequestById(this.requestId).subscribe({
        next: (res) => {
          this.existingRequestAttachments = res.attachments;
          this.patchForm(res);
          // After patching, reload all dropdown lists so selects show all options
          this.intializeDropDownLists();
          this.form.get('requestType')?.disable();
          this.allowEditContainer = !res.isTransaction;
        },
      });
    }
  }

  intializeDropDownLists(): void {
    this.containersList$ = this.manageImportsExportsService.requestContainersService
      .getTransactionsListLookup(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined
      )
      .pipe(
        tap((response) => {
          this.mappedContainersList = response.data.map((container) => ({
            displayText: `(${container?.transactionNumber})-${container.title}`,
            value: container.id,
          }));
        })
      );

    this.foundationsList$ = this.manageImportsExportsService.foundationsService.getFoundationsList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      {
        parentId: null,
      },
      undefined,
      this.dropDownProperties
    );

    this.manageImportsExportsService.foundationsService
      .getFoundationsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          parentId: null,
        },
        undefined,
        this.dropDownProperties
      )
      .subscribe({
        next: (res) => {
          this.concernedFoundationsList = res.data;
        },
      });

    this.manageImportsExportsService.organizationUnitsService
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
        this.dropDownPropertiesClass
      )
      .subscribe({
        next: (res) => {
          this.classificationsList = res.data;
        },
      });

    this.manageImportsExportsService.prioritiesService
      .getPrioritiesList(
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
          this.prioritiesList = res.data;
        },
      });
    const classificationId = this.form?.get('classificationId')?.value;
    this.requestTypesList$ =
      this.manageImportsExportsService.requestTypesService.getRequestTypesList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          classificationId,
          isTransaction: true,
        },
        undefined,
        this.dropDownProperties
      );

    this.containersList$.subscribe();
    this.foundationsList$.subscribe();
    this.subFoundationsList$.subscribe();
    this.requestTypesList$.subscribe();
    this.usersList$.subscribe();
  }

  onSelectedFoundationChanged(): void {
    const { foundation } = this.form.value;

    //Reset subFoundation field
    this.form.patchValue({
      subFoundation: null,
    });

    if (foundation) {
      this.subFoundationsList$ =
        this.manageImportsExportsService.foundationsService.getFoundationsList(
          {
            pageSize: 20,
            pageIndex: 0,
          },
          {
            parentId: foundation,
          },
          undefined,
          this.dropDownProperties
        );
    } else {
      this.subFoundationsList$ = of({ data: [], totalCount: 0 });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        id: new FormControl('', []),
        autoNumber: new FormControl('', []),
        importNumber: new FormControl('', []),
        classificationId: new FormControl('', [Validators.required]),
        users: new FormControl(null, []),
        requestType: new FormControl(null, [Validators.required]),
        title: new FormControl('', [Validators.required]),

        physicalHijriDate: new FormControl('', [Validators.required]),
        physicalGregorianDate: new FormControl('', [Validators.required]),

        deliveryHijriDate: new FormControl({ value: this.gregorianTodayDate, disabled: true }, [
          Validators.required,
        ]),
        deliveryGregorianDate: new FormControl({ value: this.gregorianTodayDate, disabled: true }, [
          Validators.required,
        ]),

        availabilityHijriDate: new FormControl('', []),
        availabilityGregorianDate: new FormControl('', []),

        priorityId: new FormControl('', [Validators.required]),
        physicalNumber: new FormControl('', [Validators.required]),
        deliveryNumber: new FormControl('', [Validators.required]),

        requestContainer: new FormControl(null, []),
        foundation: new FormControl('', [Validators.required]),
        subFoundation: new FormControl('', []),
        concernedFoundations: new FormControl('', [Validators.required]),
        committeeId: new FormControl('', []),

        creditsRequestedAmount: new FormControl('', [Validators.min(0)]),
        creditsApprovedAmount: new FormControl('', [Validators.min(0)]),
        costsRequestedAmount: new FormControl('', [Validators.min(0)]),
        costsApprovedAmount: new FormControl('', [Validators.min(0)]),

        note: new FormControl('', []),
        description: new FormControl('', []),

        attachmentInput: new FormControl('', []),
        attachments: new FormArray([], []),
        attachmentDescription: new FormControl('', []),
      },
      {
        validators: this.validateUsersBasedOnClassification(),
      }
    );

    this.deliveryHijriDateCalendarInput = moment(new Date()).locale('en').format('yyyy-MM-DD');
  }

  private validateUsersBasedOnClassification(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const usersVal = form.get('users')?.value;
      if (this.showAccessUsers && (!usersVal || usersVal.length === 0)) {
        return {
          usersRequired: true,
        };
      }

      return null;
    };
  }

  private formatHijriFromDate(date: string): string {
    const formatted = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).format(new Date(date));

    const parts = formatted.replace(' AH', '').split('/'); // [MM, DD, YYYY]
    return `${parts[2]}/${parts[0]}/${parts[1]}`; // YYYY/MM/DD
  }

  private extractYMD(date: string): { y: number; m: number; d: number } {
    const [y, m, d] = date.split('T')[0].split('-').map(Number);
    return { y, m, d };
  }

  private patchHijriGregorianPair(
    hijriKey: string,
    gregKey: string,
    hijriDate: NgbDateStruct | null,
    serviceMethod: 'getGregorianDate' | 'getHijriDate'
  ) {
    if (!hijriDate) {
      this.form.patchValue(
        {
          [hijriKey]: null,
          [gregKey]: null,
        },
        { emitEvent: false }
      );
      this.form.get(hijriKey)?.markAsTouched();
      this.form.get(gregKey)?.markAsTouched();
      return;
    }

    const dateString = `${hijriDate.year}/${hijriDate.month}/${hijriDate.day}`;

    this.manageImportsExportsService.UmAlQuraCalendarService[serviceMethod](dateString).subscribe({
      next: (res: string) => {
        const [y, m, d] = res.split('/');
        this.form.patchValue(
          {
            [hijriKey]: `${hijriDate.year}-${hijriDate.month}-${hijriDate.day}`,
            [gregKey]: `${y}-${m}-${d}`,
          },
          { emitEvent: false }
        );
        this.form.get(hijriKey)?.markAsTouched();
        this.form.get(gregKey)?.markAsTouched();
      },
    });
  }

  private patchGregorianHijriPair(hijriKey: string, gregKey: string, date: NgbDateStruct | null) {
    if (!date) {
      this.form.patchValue(
        {
          [hijriKey]: null,
          [gregKey]: null,
        },
        { emitEvent: false }
      );
      this.form.get(hijriKey)?.markAsTouched();
      this.form.get(gregKey)?.markAsTouched();
      return;
    }

    const dateString = `${date.year}/${date.month}/${date.day}`;

    this.manageImportsExportsService.UmAlQuraCalendarService.getHijriDate(dateString).subscribe({
      next: (res: string) => {
        const [hy, hm, hd] = res.split('/');
        this.form.patchValue(
          {
            [hijriKey]: `${hy}-${hm}-${hd}`,
            [gregKey]: `${date.year}-${date.month}-${date.day}`,
          },
          { emitEvent: false }
        );
        this.form.get(hijriKey)?.markAsTouched();
        this.form.get(gregKey)?.markAsTouched();
      },
    });
  }

  patchForm(data: RequestDetails): void {
    const physicalHijriDate = this.formatHijriFromDate(data.physicalDate);
    const deliveryHijriDate = this.formatHijriFromDate(data.deliveryDate);

    const availabilityHijriDate = data.availabilityDate
      ? this.formatHijriFromDate(data.availabilityDate)
      : null;

    this.form.patchValue({
      id: data.id,
      classificationId: data.classification.id,
      requestType: data.requestType.id,
      title: data.title,

      physicalHijriDate,
      physicalGregorianDate: data.physicalDate,

      deliveryHijriDate,
      deliveryGregorianDate: data.deliveryDate,

      availabilityHijriDate,
      availabilityGregorianDate: data.availabilityDate,

      priorityId: data.priority?.id,
      autoNumber: data.autoNumber,
      physicalNumber: data.physicalNumber,
      deliveryNumber: data.deliveryNumber,

      requestContainer: data.requestContainer?.id,
      foundation: data.foundation.id,
      subFoundation: data.subFoundation?.id,
      concernedFoundations: data.concernedFoundations.map((c) => c.id),
      committeeId: data.committee?.id,

      creditsRequestedAmount: data.creditsRequestedAmount,
      creditsApprovedAmount: data.creditsApprovedAmount,
      costsRequestedAmount: data.costsRequestedAmount,
      costsApprovedAmount: data.costsApprovedAmount,

      note: data.note,
      description: data.description,
      status: data.status,
      attachmentDescription: data.attachmentDescription,
      ...(data.users?.length
        ? ((this.showAccessUsers = true),
          {
            users: data.users.map((u) => u?.id ?? u),
          })
        : { users: [] }),
    });

    this.patchHijriDates(data);

    data.attachments.forEach((a) => this.attachments.push(new FormControl(a)));

    this.cdr.detectChanges();
  }

  patchHijriDates(data: { physicalDate: string; deliveryDate: string; availabilityDate: string }) {
    if (data.physicalDate) {
      const { y, m, d } = this.extractYMD(data.physicalDate);
      this.onPatchFormPhysicalGregorianDate({ gregorianDate: { year: y, month: m, day: d } });
    }

    if (data.deliveryDate) {
      const { y, m, d } = this.extractYMD(data.deliveryDate);
      this.onPatchFormDeliveryGregorianDate({ gregorianDate: { year: y, month: m, day: d } });
    }

    if (data.availabilityDate) {
      const { y, m, d } = this.extractYMD(data.availabilityDate);
      this.onPatchFormAvailabilityGregorianDate({ gregorianDate: { year: y, month: m, day: d } });
    }
  }

  onPatchFormPhysicalHijriDate(date: { hijriDate: NgbDateStruct }) {
    this.patchHijriGregorianPair(
      'physicalHijriDate',
      'physicalGregorianDate',
      date.hijriDate,
      'getGregorianDate'
    );
  }

  onPatchFormPhysicalGregorianDate(date: { gregorianDate: NgbDateStruct }) {
    this.patchGregorianHijriPair('physicalHijriDate', 'physicalGregorianDate', date.gregorianDate);
  }

  onPatchFormAvailabilityHijriDate(date: { hijriDate: NgbDateStruct }) {
    this.patchHijriGregorianPair(
      'availabilityHijriDate',
      'availabilityGregorianDate',
      date.hijriDate,
      'getGregorianDate'
    );
  }

  onPatchFormAvailabilityGregorianDate(date: { gregorianDate: NgbDateStruct }) {
    this.patchGregorianHijriPair(
      'availabilityHijriDate',
      'availabilityGregorianDate',
      date.gregorianDate
    );
  }

  onPatchFormDeliveryHijriDate(date: { hijriDate: NgbDateStruct }) {
    this.patchHijriGregorianPair(
      'deliveryHijriDate',
      'deliveryGregorianDate',
      date.hijriDate,
      'getGregorianDate'
    );
  }

  onPatchFormDeliveryGregorianDate(date: { gregorianDate: NgbDateStruct }) {
    this.patchGregorianHijriPair('deliveryHijriDate', 'deliveryGregorianDate', date.gregorianDate);
  }

  onClassificationChanges(): void {
    const classificationId = this.form.get('classificationId')!.value;
    const classificationObj = this.classificationsList.find((c) => c.id === classificationId);

    this.manageImportsExportsService.classificationsService
      .getClassificationUsersById(classificationId)
      .subscribe((res) => {
        this.showAccessUsers =
          classificationObj?.classificationLevel === ClassificationLevel.Restricted;
        this.form.patchValue({
          users: res.map((u) => u.id),
        });
      });
  }

  searchOnContainers(event: { term: string; items: any[] }) {
    this.containersList$ = this.manageImportsExportsService.requestContainersService
      .getTransactionsListLookup(
        {
          pageSize: 10,
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
          this.mappedContainersList = response.data.map((container) => ({
            displayText: `(${container.transactionNumber})-${container.title}`,
            value: container.id,
          }));
        })
      );
    this.containersList$.subscribe();
  }

  searchOnFoundations(event: { term: string; items: any[] }) {
    this.foundationsList$ = this.manageImportsExportsService.foundationsService.getFoundationsList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        parentId: null,
        searchKeyword: event.term,
      },
      undefined,
      this.dropDownProperties
    );
    this.foundationsList$.subscribe();
  }

  searchOnSubFoundations(event: { term: string; items: any[] }) {
    const { foundation } = this.form.value;

    if (foundation) {
      this.subFoundationsList$ =
        this.manageImportsExportsService.foundationsService.getFoundationsList(
          {
            pageSize: 10,
            pageIndex: 0,
          },
          {
            parentId: foundation,
            searchKeyword: event.term,
          },
          undefined,
          this.dropDownProperties
        );
    }
  }

  searchOnConcernedFoundations(event: { term: string; items: any[] }) {
    this.manageImportsExportsService.foundationsService
      .getFoundationsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          parentId: null,
          searchKeyword: event.term,
        },
        undefined,
        this.dropDownProperties
      )
      .subscribe({
        next: (res) => {
          this.concernedFoundationsList = res.data;
        },
      });
  }

  searchOnRequestTypes(event: { term: string; items: any[] }): void {
    const classificationId = this.form?.get('classificationId')?.value;

    if (classificationId) {
      this.requestTypesList$ =
        this.manageImportsExportsService.requestTypesService.getRequestTypesList(
          {
            pageSize: 10,
            pageIndex: 0,
          },
          {
            searchKeyword: event.term,
            classificationId,
            isTransaction: true,
          },
          undefined,
          this.dropDownProperties
        );
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.disableSubmitFormDetailsBtn = true;

    const dataToSend = this.mapUpdateRequestDataToBeSend();

    //Update import
    this.manageImportsExportsService.requestsService
      .updateImport(this.requestId, dataToSend)
      .subscribe({
        next: (res) => {
          this.disableSubmitFormDetailsBtn = false;
          this.toastr.success(
            this.translateService.instant(
              `ImportsExportsModule.AddImportComponent.editedImportSuccessfully`
            )
          );
          this.router.navigate(['imports-exports']);
        },
        error: (err) => this.handleErrorResponse(err),
      });
  }

  handleErrorResponse(err?: any): void {
    this.disableSubmitFormDetailsBtn = false;
    this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
  }

  mapDate(date: string): any {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  private mapUpdateRequestDataToBeSend(): UpdateRequestCommand {
    const {
      title,
      description,
      physicalGregorianDate,
      deliveryGregorianDate,
      availabilityGregorianDate,
      creditsRequestedAmount,
      creditsApprovedAmount,
      costsRequestedAmount,
      costsApprovedAmount,
      physicalNumber,
      deliveryNumber,
      note,
      priorityId,
      requestContainer,
      foundation,
      subFoundation,
      concernedFoundations,
      committeeId,
      attachments,
      attachmentDescription,
      users,
      classificationId,
    } = this.form.getRawValue();

    return {
      title,
      description,
      physicalDate: this.mapDate(physicalGregorianDate),
      deliveryDate: this.mapDate(deliveryGregorianDate),
      availabilityDate: availabilityGregorianDate ? this.mapDate(availabilityGregorianDate) : null,
      creditsRequestedAmount,
      creditsApprovedAmount,
      costsRequestedAmount,
      costsApprovedAmount,
      physicalNumber,
      deliveryNumber,
      note,
      priorityId,
      classificationId,
      requestContainerId: requestContainer,
      foundationId: foundation,
      subFoundationId: subFoundation ? subFoundation : null,
      concernedFoundationsIds: Array.isArray(concernedFoundations)
        ? concernedFoundations.map((ele) => (typeof ele === 'object' ? ele.id : ele))
        : [],
      committeeId: committeeId ? committeeId : null,
      attachmentsIds: Array.isArray(attachments)
        ? attachments.map((att) => (typeof att === 'object' ? att.id : att))
        : [],
      attachmentDescription,
      usersIds:
        this.showAccessUsers && users && users.length
          ? users.map((ele) => (typeof ele === 'object' ? ele.id : ele))
          : [],
    };
  }

  get attachmentInput(): FormControl {
    return this.form?.get('attachmentInput') as FormControl;
  }

  get attachments(): FormArray {
    return this.form?.get('attachments') as FormArray;
  }

  onInsertFileToList(): void {
    if (this.attachmentInput.value) {
      this.manageImportsExportsService.wopiFilesService
        .createFile(this.attachmentInput.value.fileBlob)
        .subscribe({
          next: (res) => {
            this.attachments.push(new FormControl('', []));

            const attachmentsLength = this.attachments.length;

            this.attachments.controls[
              attachmentsLength > 0 ? attachmentsLength - 1 : 0
            ]?.patchValue({ ...this.attachmentInput.value, fileId: res });

            this.attachmentInput.setValue(null);

            const hiddenFileToUploadHtmlElement: HTMLInputElement =
              this.hiddenFileToUpload.nativeElement;
            hiddenFileToUploadHtmlElement.disabled = false;

            const visibleFileToUploadHtmlElement: HTMLInputElement =
              this.visibleFileToUpload.nativeElement;

            visibleFileToUploadHtmlElement.value = '';
            visibleFileToUploadHtmlElement.disabled = false;
            if (this.uploadAttachmentComponent) {
              this.uploadAttachmentComponent.completeUpload();
            }
          },
          error: (err) => {},
        });
    }
  }

  onAddFile(): void {
    const hiddenFileToUploadHtmlElement: HTMLInputElement = this.hiddenFileToUpload.nativeElement;
    hiddenFileToUploadHtmlElement.value = '';
    hiddenFileToUploadHtmlElement.click();
  }

  onFileChange(e: any): void {
    const filesArray = e.target.files;

    if (filesArray.length > 0) {
      this.uploadFile(filesArray[0]);
    }
  }

  uploadFile(file: File): void {
    this.attachmentInput.patchValue({
      fileBlob: file,
      fileType: '.' + file.name.split('.').pop(), //.pdf
      fileName: file.name,
      fileId: '',
      filePath: '',
    });
    const hiddenFileToUploadHtmlElement: HTMLInputElement = this.hiddenFileToUpload.nativeElement;
    hiddenFileToUploadHtmlElement.disabled = true;

    const visibleFileToUploadHtmlElement: HTMLInputElement = this.visibleFileToUpload.nativeElement;

    visibleFileToUploadHtmlElement.value = file.name;
    visibleFileToUploadHtmlElement.disabled = true;
  }

  onDeleteFile(index: number): void {
    this.attachments.removeAt(index);
  }

  onViewAttachment(file: any): void {
    // const raw = this.attachments.controls[index]?.value;
    if (!file) return;

    // Normalize attachment object to support both legacy and new structures
    const attachment = {
      fileBlob: file.fileBlob || file.file || null,
      fileType: file.fileType || file.contentType || '',
      fileName: file.fileName || file.name || '',
      fileId: file.fileId || file.id || '',
      filePath: file.filePath || file.path || '',
    };

    if (attachment.fileType === '.pdf') {
      //We need to fetch pdf file from server
      this.manageImportsExportsService.wopiFilesService
        .getTemporaryFile(attachment.fileId)
        .subscribe({
          next: (res) => {
            this.dialog
              .open(EditFileWithBarcodeModalComponent, {
                minWidth: '62.5rem',
                maxWidth: '62.5rem',
                maxHeight: '95vh',
                height: '95vh',
                panelClass: ['action-modal', 'float-footer'],
                autoFocus: false,
                disableClose: true,
                data: {
                  fileBlob: res,
                  fileType: attachment.fileType, //.pdf
                  fileName: attachment.fileName,
                  fileId: attachment.fileId,
                  filePath: attachment.filePath,
                  requestId: this.requestId,
                },
              })
              .afterClosed()
              .subscribe((res) => {});
          },
        });
    } else {
      //The file is not pdf,Just open the dialog
      this.dialog
        .open(EditFileWithBarcodeModalComponent, {
          minWidth: '95vw',
          autoFocus: false,
          disableClose: true,
          data: {
            fileBlob: attachment.fileBlob,
            fileType: attachment.fileType, //.doc
            fileName: attachment.fileName,
            fileId: attachment.fileId,
            filePath: attachment.filePath,
            requestId: this.requestId,
          },
        })
        .afterClosed()
        .subscribe((res) => {});
    }
  }

  // Used to get a strongly typed FormControl
  getFormControlByIndex(formArray: FormArray, index: number): FormControl {
    return formArray.controls[index] as FormControl;
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  goToLastPage(): void {
    this.location.back();
  }

  onGoToPreviousStep(): void {
    this.previousStep.emit();
  }

  onSetIfUserIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('users')?.markAsTouched();
    } else {
      this.form.get('users')?.markAsUntouched();
    }
  }
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  // Handle files dropped/uploaded from app-upload-attachment
  uploadedFileNames: string[] = [];
  attachmentIds: string[] = [];
  onFileDropped(e: any): void {
    for (const [key, value] of e.entries()) {
      if (value instanceof File && !this.uploadedFileNames.includes(value.name)) {
        this.uploadedFileNames.push(value.name);
        this.manageImportsExportsService.wopiFilesService.createFile(value).subscribe((res) => {
          if (res) {
            const attachmentObj = {
              contentType: '.' + value.name.split('.').pop(),
              fileType: '.' + value.name.split('.').pop(),
              name: value.name,
              id: res,
              path: '',
            };
            this.attachments.push(new FormControl(attachmentObj));
            this.attachmentIds.push(res);
            this.cdr.detectChanges();
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
  onFileDroppedd(e: any): void {
    for (const [key, value] of e.entries()) {
      if (value instanceof File && !this.uploadedFileNames.includes(value.name)) {
        this.uploadedFileNames.push(value.name);
        this.manageImportsExportsService.wopiFilesService.createFile(value).subscribe((res) => {
          if (res) {
            // Create attachment object and push to FormArray
            const attachmentObj = {
              fileBlob: value,
              fileType: '.' + value.name.split('.').pop(),
              fileName: value.name,
              fileId: res,
              filePath: '',
            };
            this.attachments.push(new FormControl(attachmentObj));
            this.attachmentIds.push(res);
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  // Handle file removal from app-upload-attachment
  onAttachmentRemoved(file: any): void {
    if (!file) return;

    if (file.id) {
      // Remove existing file by ID
      this.attachmentIds = this.attachmentIds.filter((id) => id !== file.id);
      const index = this.attachments.controls.findIndex((ctrl: FormControl) => {
        const ctrlValue = ctrl.value;
        if (!ctrlValue) return false;
        // Handle both object and primitive ID formats
        if (typeof ctrlValue === 'object' && ctrlValue.id) {
          return ctrlValue.id === file.id;
        }
        return ctrlValue === file.id;
      });
      if (index > -1) {
        this.attachments.removeAt(index);
      }
    } else if (file.name) {
      // Remove newly uploaded file by name
      const meta = this.uploadedFileNames.find((fname) => fname === file.name);
      if (meta) {
        // Find and remove from attachments FormArray
        const index = this.attachments.controls.findIndex((ctrl: FormControl) => {
          const ctrlValue = ctrl.value;
          if (!ctrlValue) return false;
          // Handle both object and primitive name formats
          if (typeof ctrlValue === 'object' && ctrlValue.fileName) {
            return ctrlValue.fileName === file.name;
          }
          if (typeof ctrlValue === 'object' && ctrlValue.name) {
            return ctrlValue.name === file.name;
          }
          return ctrlValue === file.name;
        });
        if (index > -1) {
          this.attachments.removeAt(index);
          this.uploadedFileNames = this.uploadedFileNames.filter((fname) => fname !== file.name);
          this.attachmentIds = this.attachmentIds.filter((id) => id !== meta);
        }
      }
    }

    this.cdr.detectChanges();
  }
  get attachmentFiles() {
    return this.attachments.controls.map((c) => c.value);
  }
}
