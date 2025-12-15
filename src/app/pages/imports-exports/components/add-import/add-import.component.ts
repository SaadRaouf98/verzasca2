import { RequestStatus } from './../../../../core/enums/request-status.enum';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
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
import { Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import * as moment from 'moment';
import { Location } from '@angular/common';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { Classification } from '@core/models/classification.model';
import { Observable, mergeMap, of, switchMap, forkJoin } from 'rxjs';
import { Priority } from '@core/models/priority.model';
import { DatePipe } from '@angular/common';

import { AddRequestCommand, Attachment } from '@core/models/request.model';

import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { SuccessModalComponent } from '@shared/components/success-modal/success-modal.component';
import { NewHijriCalendarComponent } from '@shared/components/new-hijri-calendar/new-hijri-calendar.component';
import { OrganizationUnit } from '@core/models/organization-unit.model';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { SingleGregorianCalendarComponent } from '@shared/components/calendar/single-gregorian-calendar/single-gregorian-calendar.component';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { UsersService } from '@core/services/backend-services/users.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-import',
  templateUrl: './add-import.component.html',
  styleUrls: ['./add-import.component.scss'],
  // Import the standalone component here

  /*   providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ], */
})
export class AddImportComponent implements OnInit {
  // Returns a JS Date object for today (from gregorianToday NgbDateStruct)
  get gregorianTodayDate(): Date {
    return new Date(
      this.gregorianToday.year,
      this.gregorianToday.month - 1,
      this.gregorianToday.day
    );
  }
  lang: string = 'ar';
  form!: FormGroup;
  physicalHijriDateCalendarInput!: string;
  deliveryHijriDateCalendarInput!: string;
  availabilityHijriDateCalendarInput!: string;

  classificationsList: Classification[] = [];

  prioritiesList: Priority[] = [];
  usersList$: Observable<{
    data: { id: string; name: string }[];
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
  existingAttachmentFiles: any[] = [];
  organizationUnitsList: OrganizationUnit[] = [];

  compareFn = compareFn;

  readonly dropDownProperties = ['id', 'title', 'titleEn'];
  readonly dropDownPropertiesClass = ['id', 'title', 'titleEn', 'classificationLevel'];

  requestContainerIdFromUrl: string = '';

  showAccessUsers: boolean = false;

  @Input() requestContainerId!: string;

  @Input() requestContainerData!: {
    foundation: {
      id: string;
      title: string;
      titleEn: string;
    } | null;
    subFoundation: {
      id: string;
      title: string;
      titleEn: string;
    } | null;
    concernedFoundations: {
      id: string;
      title: string;
      titleEn: string;
    }[];
    classificationId: string;
    users: { id: string; name: string }[];
  };

  @Input() didUserChooseDocument!: boolean;
  @Input() cardData!: any;

  gregorianToday: NgbDateStruct = {
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };

  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;

  hijriToday!: NgbDateStruct;

  @Output() nextStep: EventEmitter<{
    requestId: string;
  }> = new EventEmitter();
  @Output() previousStep: EventEmitter<void> = new EventEmitter();

  constructor(
    private languageService: LanguageService,
    private dialog: MatDialog,
    private router: Router,
    private location: Location,
    private translateService: TranslateService,
    private manageImportsExportsService: ManageImportsExportsService,
    private toastr: CustomToastrService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.lang = this.languageService.language;
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
    ).subscribe((res) => {
      this.hijriToday = {
        day: parseInt(res.split('/')[2]),
        month: parseInt(res.split('/')[1]),
        year: parseInt(res.split('/')[0]),
      };

      if (this.requestContainerData) {
        if (this.requestContainerData.foundation) {
          //Initialize foundations
          this.foundationsList$ = of({
            data: [this.requestContainerData.foundation],
            totalCount: 1,
          });

          this.form.patchValue({
            foundation: this.requestContainerData.foundation.id,
          });
        }

        if (this.requestContainerData.subFoundation) {
          this.subFoundationsList$ = of({
            data: this.requestContainerData.subFoundation
              ? [this.requestContainerData.subFoundation]
              : [],
            totalCount: this.requestContainerData.subFoundation ? 1 : 0,
          });

          this.form.patchValue({
            subFoundation: this.requestContainerData.subFoundation.id,
          });
        }

        if (this.requestContainerData.concernedFoundations.length) {
          (this.concernedFoundationsList = this.requestContainerData.concernedFoundations),
            setTimeout(() => {
              this.form.patchValue({
                concernedFoundations: Array.isArray(this.requestContainerData.concernedFoundations)
                  ? this.requestContainerData.concernedFoundations.map((f) =>
                      typeof f === 'object' && f !== null ? f.id : f
                    )
                  : [],
              });
            });
        }

        if (this.requestContainerData.classificationId) {
          this.getRequestTypes();
          this.form.patchValue({
            classificationId: this.requestContainerData.classificationId,
          });
        }
        if (this.requestContainerData?.users?.length) {
          this.showAccessUsers = true;
          this.form.patchValue({
            users: Array.isArray(this.requestContainerData.users)
              ? this.requestContainerData.users.map((f) =>
                  typeof f === 'object' && f !== null ? f.id : f
                )
              : [],
          });
        }
      }
    });
  }

  intializeDropDownLists(): void {
    //if (this.didUserChooseDocument) {
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
    // }

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
      // When patching subFoundation, always patch the full object, not just the id
      this.subFoundationsList$.subscribe((res) => {
        if (res && Array.isArray(res.data)) {
          // If requestContainerData.subFoundation is an id, find the object
          let subFoundationId = this.requestContainerData?.subFoundation;
          if (subFoundationId && typeof subFoundationId === 'string') {
            const found = res.data.find((f: any) => f.id === subFoundationId);
            if (found) {
              this.form.patchValue({ subFoundation: found });
            }
          }
        }
      });
      this.subFoundationsList$ = of({ data: [], totalCount: 0 });
    }
  }

  onFoundationCleared(): void {
    //Reset subFoundation field
    this.form.patchValue({
      subFoundation: '',
    });

    this.subFoundationsList$ = of({ data: [], totalCount: 0, groupCount: -1 });
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        id: new FormControl(null, []),
        autoNumber: new FormControl(null, []),
        importNumber: new FormControl(null, []),
        classificationId: new FormControl(null, [Validators.required]),
        users: new FormControl(null, []),
        requestType: new FormControl(null, [Validators.required]),
        title: new FormControl(null, [Validators.required]),

        physicalHijriDate: new FormControl(null, [Validators.required]),
        physicalGregorianDate: new FormControl(null, [Validators.required]),

        deliveryHijriDate: new FormControl({ value: this.gregorianTodayDate, disabled: true }, [
          Validators.required,
        ]),
        deliveryGregorianDate: new FormControl({ value: this.gregorianTodayDate, disabled: true }, [
          Validators.required,
        ]),

        availabilityHijriDate: new FormControl(null, []),
        availabilityGregorianDate: new FormControl(null, []),

        priorityId: new FormControl(null, [Validators.required]),
        physicalNumber: new FormControl(null, [Validators.required]),
        deliveryNumber: new FormControl(null, [Validators.required]),

        foundation: new FormControl(null, [Validators.required]),
        subFoundation: new FormControl(null, []),
        concernedFoundations: new FormControl(null, [Validators.required]),
        committeeId: new FormControl(null, []),

        creditsRequestedAmount: new FormControl(0, [Validators.min(0)]),
        creditsApprovedAmount: new FormControl(0, [Validators.min(0)]),
        costsRequestedAmount: new FormControl(0, [Validators.min(0)]),
        costsApprovedAmount: new FormControl(0, [Validators.min(0)]),

        note: new FormControl(null, []),
        description: new FormControl(null, []),
        attachmentDescription: new FormControl(null, []),
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

  onPatchFormAvailabilityHijriDate(date: { hijriDate: NgbDateStruct }): void {
    if (date.hijriDate) {
      this.manageImportsExportsService.UmAlQuraCalendarService.getGregorianDate(
        `${date.hijriDate.year}/${date.hijriDate.month}/${date.hijriDate.day}`
      ).subscribe({
        next: (res) => {
          this.form.patchValue(
            {
              availabilityHijriDate: `${date.hijriDate.year}-${date.hijriDate.month}-${date.hijriDate.day}`,
              availabilityGregorianDate: `${res.split('/')[0]}-${res.split('/')[1]}-${
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
          availabilityHijriDate: null,
          availabilityGregorianDate: null,
        },
        { emitEvent: false }
      );
    }

    this.form.get('availabilityHijriDate')?.markAsTouched();
    this.form.get('availabilityGregorianDate')?.markAsTouched();
  }

  onPatchFormAvailabilityGregorianDate(date: { gregorianDate: NgbDateStruct }): void {
    if (date.gregorianDate) {
      this.manageImportsExportsService.UmAlQuraCalendarService.getHijriDate(
        `${date.gregorianDate.year}/${date.gregorianDate.month}/${date.gregorianDate.day}`
      ).subscribe({
        next: (res) => {
          this.form.patchValue(
            {
              availabilityHijriDate: `${res.split('/')[0]}-${res.split('/')[1]}-${
                res.split('/')[2]
              }`,
              availabilityGregorianDate: `${date.gregorianDate.year}-${date.gregorianDate.month}-${date.gregorianDate.day}`,
            },
            { emitEvent: false }
          );
        },
      });
    } else {
      this.form.patchValue(
        {
          availabilityHijriDate: null,
          availabilityGregorianDate: null,
        },
        { emitEvent: false }
      );
    }

    this.form.get('availabilityHijriDate')?.markAsTouched();
    this.form.get('availabilityGregorianDate')?.markAsTouched();
  }

  onPatchFormDeliveryHijriDate(date: { hijriDate: NgbDateStruct }): void {
    if (date.hijriDate) {
      this.manageImportsExportsService.UmAlQuraCalendarService.getGregorianDate(
        `${date.hijriDate.year}/${date.hijriDate.month}/${date.hijriDate.day}`
      ).subscribe({
        next: (res) => {
          this.form.patchValue(
            {
              deliveryHijriDate: `${date.hijriDate.year}-${date.hijriDate.month}-${date.hijriDate.day}`,
              deliveryGregorianDate: `${res.split('/')[0]}-${res.split('/')[1]}-${
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
          deliveryHijriDate: null,
          deliveryGregorianDate: null,
        },
        { emitEvent: false }
      );
    }

    this.form.get('deliveryHijriDate')?.markAsTouched();
    this.form.get('deliveryGregorianDate')?.markAsTouched();
  }

  onPatchFormDeliveryGregorianDate(date: { gregorianDate: NgbDateStruct }): void {
    this.manageImportsExportsService.UmAlQuraCalendarService.getHijriDate(
      `${date.gregorianDate.year}/${date.gregorianDate.month}/${date.gregorianDate.day}`
    ).subscribe({
      next: (res) => {
        this.form.patchValue(
          {
            deliveryHijriDate: `${res.split('/')[0]}-${res.split('/')[1]}-${res.split('/')[2]}`,
            deliveryGregorianDate: `${date.gregorianDate.year}-${date.gregorianDate.month}-${date.gregorianDate.day}`,
          },
          { emitEvent: false }
        );
        this.form.get('deliveryHijriDate')?.markAsTouched();
        this.form.get('deliveryGregorianDate')?.markAsTouched();
      },
    });
  }

  onClassificationChanges(): void {
    const classificationId = this.form.get('classificationId')!.value;

    // If classification is cleared, don't make any requests
    if (!classificationId) {
      this.showAccessUsers = false;
      this.form.patchValue({
        users: null,
        requestType: null,
      });
      return;
    }

    this.getRequestTypes();
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    // Instead of using res.classificationLevel, get the classification object from the list
    const classificationObj = this.classificationsList.find((c) => c.id === classificationId);
    this.manageImportsExportsService.classificationsService
      .getClassificationUsersById(classificationId)
      .subscribe((res) => {
        this.showAccessUsers =
          classificationObj?.classificationLevel === ClassificationLevel.Restricted ? true : false;
        this.form.patchValue({
          users: res.map((u) => u.id),
        });
      });
  }

  getRequestTypes(): void {
    this.form.patchValue({
      requestType: null,
    });

    //Based on chosen classification, we get a filtered list of request types
    this.requestTypesList$ =
      this.manageImportsExportsService.requestTypesService.getRequestTypesList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          classificationId: this.form?.get('classificationId')?.value,
          isTransaction: this.didUserChooseDocument ? false : true,
        },
        undefined,
        this.dropDownProperties
      );
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
            isTransaction: this.didUserChooseDocument ? false : true,
          },
          undefined,
          this.dropDownProperties
        );
    }
  }

  onSubmit(): void {
    // if (this.form.invalid) {
    //   return;
    // }

    this.disableSubmitFormDetailsBtn = true;
    this.mapAddRequestDataToBeSend();

    // Add import
    this.manageImportsExportsService.requestsService
      .addImport(this.mapAddRequestDataToBeSend())
      .subscribe({
        next: (res) => {
          this.openSuccessDialog({
            requestId: res.id,
            requestAutoNumber: res.autoNumber,
            requestImportNumber: res.importNumber,
            requestStatus: res.status,
          });
        },
        error: (err) => this.handleErrorResponse(err),
      });
  }

  handleErrorResponse(err?: any): void {
    this.disableSubmitFormDetailsBtn = false;
    this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
  }

  openSuccessDialog(res: {
    requestId: string;
    requestAutoNumber: number;
    requestImportNumber: number;
    requestStatus: RequestStatus;
  }): void {
    const dialogRef = this.dialog.open(SuccessModalComponent, {
      minWidth: '31.25rem',
      maxWidth: '31.25rem',
      panelClass: 'action-modal',
      autoFocus: false,
      disableClose: true,
      data: {
        title: 'shared.processDone',
        content: this.translateService.instant('shared.importSerialNumberIs'),
        specialContent: ` (${res.requestAutoNumber})`,
        requestId: res.requestId,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((dialogResult: { statusCode: ModalStatusCode; status: string }) => {
        this.router.navigate(['imports-exports']);
      });
  }

  private mapAddRequestDataToBeSend(): AddRequestCommand {
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
      requestType,
      classificationId,
      foundation,
      subFoundation,
      concernedFoundations,
      committeeId,
      attachmentDescription,
      users,
    } = this.form.getRawValue();

    // Helper function to format date using DatePipe
    const formatDate = (date: any): string => {
      if (!date) return '';

      // If it's a Date object, use DatePipe to format
      if (date instanceof Date) {
        return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
      }

      // If it's a string, parse and reformat it to ensure consistent format
      if (typeof date === 'string') {
        try {
          const dateParts = date.split('-');
          if (dateParts.length === 3) {
            const year = dateParts[0];
            const month = String(dateParts[1]).padStart(2, '0');
            const day = String(dateParts[2]).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }
        } catch (e) {
          // If parsing fails, return as-is
          return date;
        }
      }

      // If it's an object with year, month, day properties (NgbDateStruct)
      if (typeof date === 'object' && date.year) {
        const year = String(date.year);
        const month = String(date.month).padStart(2, '0');
        const day = String(date.day).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      return '';
    };

    // Fix: Build deliveryDate - remove strict checks and use formatDate

    const dataToSend: AddRequestCommand = {
      title,
      description,
      physicalDate: physicalGregorianDate ? formatDate(physicalGregorianDate) : null,
      deliveryDate: deliveryGregorianDate ? formatDate(deliveryGregorianDate) : null,
      availabilityDate: availabilityGregorianDate ? formatDate(availabilityGregorianDate) : null,
      creditsRequestedAmount,
      creditsApprovedAmount,
      costsRequestedAmount,
      costsApprovedAmount,
      physicalNumber,
      deliveryNumber,
      note,
      priorityId,
      requestContainerId: this.requestContainerId ? this.requestContainerId : null,
      requestTypeId: requestType,
      classificationId,
      foundationId: foundation,
      subFoundationId: subFoundation ? subFoundation : null,
      concernedFoundationsIds: concernedFoundations,
      committeeId: committeeId ? committeeId : null,
      attachmentDescription,
      usersIds:
        this.showAccessUsers && users && users.length
          ? users.map((ele) => (typeof ele === 'object' ? ele.id : ele))
          : [],
      attachmentIds: this.attachmentIds,
    };

    return dataToSend;
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
  attachmentIds: string[] = [];
  uploadedFilesMeta: { name: string; id: string }[] = [];
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
          // Complete upload when API response is received - pass file ID for per-file progress
          if (this.uploadAttachmentComponent) {
            // Find the uploaded file object by name and pass its ID to completeUpload
            const uploadedFile = this.uploadAttachmentComponent.uploadedFiles.find(
              (f: any) => (f.file.name || f.file?.originalName) === file.name
            );
            if (uploadedFile) {
              this.uploadAttachmentComponent.completeUpload(uploadedFile.id);
            }
          }
        }
      });
    });
  }

  onAttachmentRemoved(file: any): void {
    // file is a native File object with name property
    const fileName = file?.name;

    if (!fileName) {
      return;
    }

    // Find and remove from uploadedFilesMeta by file name
    const fileIndex = this.uploadedFilesMeta.findIndex((f) => f.name === fileName);
    if (fileIndex > -1) {
      const meta = this.uploadedFilesMeta[fileIndex];
      // Remove the associated ID from attachmentIds
      this.attachmentIds = this.attachmentIds.filter((id) => id !== meta.id);
      // Remove from uploadedFilesMeta
      this.uploadedFilesMeta.splice(fileIndex, 1);
    }

    // Also remove from existingAttachmentFiles if it exists there
    this.existingAttachmentFiles = this.existingAttachmentFiles.filter((f) => {
      if (typeof f === 'object' && f.name) {
        return f.name !== fileName;
      }
      return f !== fileName;
    });

    this.cdr.detectChanges();
  }
}
