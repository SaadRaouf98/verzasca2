import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  DestroyRef,
  inject,
  HostListener,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { compareFn, isTouched, removeSpecialCharacters } from '@shared/helpers/helpers';

import { DatePipe, Location } from '@angular/common';
import { catchError, debounceTime, finalize, map, Observable, of, tap } from 'rxjs';
import { LanguageService } from '@core/services/language.service';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { AllEntities, Entity } from '@core/models/entity.model';
import { AllTransactions, SearchedTransaction } from '@core/models/transaction.model';
import { Priority } from '@core/models/priority.model';
import { Classification } from '@core/models/classification.model';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { OrganizationUnit } from '@core/models/organization-unit.model';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { SuccessModalComponent } from '@shared/components/success-modal/success-modal.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { AddTransactionOptions } from '@core/enums/add-transaction-options.enum';
import { User } from '@core/models/request.model';
import { MatTabChangeEvent } from '@angular/material/tabs';

export interface Sector {
  id: string;
  title: string;
}

export interface SubSector {
  id: string;
  title: string;
}

export interface SectorPayload {
  sector: Sector;
  subSector: SubSector;
}

import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { Actions } from '@core/enums/actions.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomToastrService } from '@core/services/custom-toastr.service';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'D/M/YYYY',
  },
  display: {
    dateInput: 'D/M/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'D/M/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-add-transaction',
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ar-EG' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    DatePipe,
  ],
})
export class AddTransactionComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  foundationsList$: Observable<AllEntities> = new Observable();
  subFoundationsList$: Observable<AllEntities> = new Observable();
  concernedFoundationsList$: Observable<AllEntities> = new Observable();
  benefitTypesList$: Observable<AllEntities> = new Observable();
  sectorsList$: Observable<AllEntities> = new Observable();
  subSectorsList$: Observable<AllEntities> = new Observable();
  // usersList$: Observable<{
  //   data: User[];
  //   totalCount: number;
  // }> = new Observable();
  usersList$: any;
  sectorId = '';
  lang: string = 'ar';
  prioritiesList: Priority[] = [];
  classificationsList: Classification[] = [];
  referralJustificationsList: Entity[] = [];
  requestContainerId: string = '';
  readonly dropDownProperties = ['id', 'title', 'titleEn'];
  readonly dropDownPropertiesClass = ['id', 'title', 'titleEn', 'classificationLevel'];

  selectedContainerControl = new FormControl();
  containersList$: Observable<AllTransactions> = new Observable();

  RequestContainerStatus = RequestContainerStatus;
  organizationUnitsList: OrganizationUnit[] = [];
  showAccessUsers: boolean = false;

  searchKeywordControl = new FormControl();
  fromDateControl = new FormControl<Date | null>(null);
  toDateControl = new FormControl<Date | null>(null);
  isLoadingResults: boolean = false;
  searchedTransactionsResults: SearchedTransaction[] = [];
  destroyRef = inject(DestroyRef);
  AddTransactionOptions = AddTransactionOptions;
  selectedTabIndex = 0;
  compareFn = compareFn;
  allowedUsers: User[] = [];
  searchNameValue = '';
  @Input() showNextButton!: boolean;
  @Input() showImport!: boolean;
  @Output() nextStep: EventEmitter<{
    showImport?: boolean;
    requestContainerId?: string;
    requestContainerData?: {
      foundation: { id: string; title: string; titleEn: string } | null;
      subFoundation: { id: string; title: string; titleEn: string } | null;
      concernedFoundations: { id: string; title: string; titleEn: string }[];
      classificationId: string;
      users: { id: string; name: string }[] | User[];
    };
    didUserChooseDocument?: boolean;
    cardData?: {
      title: string;
      transactionNumber: string;
      sector: any;
      classification: any;
    };
  }> = new EventEmitter();
  columns: string[] = [];
  columnsConfig: any[] = [];
  isTableLoading: boolean = false;
  isTableError: boolean = false;
  allSectors: Sector[] = [];
  rowSelected: boolean = false;
  foundationsListArray: any[] = [];
  subFoundationsListArray: any[] = [];
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly DEFAULT_PAGE_NUMBER = 0;
  pageNumber: number = this.DEFAULT_PAGE_NUMBER;
  pageSize: number = this.DEFAULT_PAGE_SIZE;
  totalElements: number = 0;
  constructor(
    private location: Location,
    private manageTransactionsService: ManageTransactionsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private manageActionsService: ManageSystemSettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.initializeForm();
    this.initializeDropDownLists();
    this.detectPageBehaviourChanges();
    this.initializeColumns();
    this.initializeColumnConfig();
    this.getAllSectors();
    // Subscribe to both date controls
    this.fromDateControl.valueChanges.subscribe(() => this.onDateChanged());
    this.toDateControl.valueChanges.subscribe(() => this.onDateChanged());
  }

  @HostListener('window:beforeunload', ['$event'])
  onPageRefresh(event: BeforeUnloadEvent): string | void {
    if (this.form && this.form.dirty) {
      // Return a string to show the browser's confirmation dialog
      event.preventDefault();
      event.returnValue = true;
      return this.translateService.instant('shared.unsavedChanges');
    }
  }

  onDateChanged(): void {
    const fromDate = this.fromDateControl.value
      ? this.datePipe.transform(this.fromDateControl.value, 'yyyy-MM-dd')
      : '';
    const toDate = this.toDateControl.value
      ? this.datePipe.transform(this.toDateControl.value, 'yyyy-MM-dd')
      : '';

    this.pageNumber = 0; // Reset to first page when date filter changes
    if (fromDate || toDate) {
      this.getSearchResults(this.searchNameValue, fromDate || '', toDate || '');
    } else {
      // Both dates cleared: remove filter
      this.getSearchResults(this.searchNameValue, '', '');
    }
  }

  clearDateRange(): void {
    this.fromDateControl.patchValue(null);
    this.toDateControl.patchValue(null);
  }
  getUsersAccessibility(requestContainerId: string): void {
    this.manageTransactionsService.requestContainersService
      .getUsersAccessibilityList({ hasAccess: true }, requestContainerId, true)
      .subscribe((accessibleUsers) => {
        this.form.patchValue({
          users: accessibleUsers.data,
        });
        this.allowedUsers = accessibleUsers.data;
      });
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        newTransaction: new FormControl(AddTransactionOptions.NewRequest, [Validators.required]),
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', []),
        foundation: new FormControl(null, [Validators.required]),
        subFoundation: new FormControl(null, []),
        concernedFoundations: new FormControl(null, [Validators.required]),
        benefitType: new FormControl(null, []),
        sector: new FormControl('', []),
        subSector: new FormControl('', []),
        priorityId: new FormControl(null, [Validators.required]),
        classificationId: new FormControl(null, [Validators.required]),
        users: new FormControl(null, []),
        referralJustificationId: new FormControl(null, []),
      },
      {
        validators: this.validateUsersBasedOnClassification(),
      }
    );
  }
  initializeColumns() {
    this.columns = ['title', 'transactionNumber', 'sector', 'classification', 'actions'];
  }
  initializeColumnConfig() {
    this.columnsConfig = [
      {
        label: 'shared.title',
        type: 'text',
      },
      {
        label: 'shared.container',
        type: 'text',
      },
      {
        label: 'shared.sector',
        type: 'text',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.allSectors,
      },
      {
        label: 'shared.classification',
        type: 'text',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.classificationsList,
      },
      {
        label: 'shared.action',
        type: 'actions',
        actions: [
          {
            action: Actions.OPENLINK,
            actionName: Actions.OPENLINK,
            hideRestrictedIcon: true,
            onClick: (element: any) => {
              // this.View(element);
              this.onSubmitChoosingTransaction(element);
            },
          },
        ],
      },
    ];
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

  detectPageBehaviourChanges(): void {}

  detectUserSearching(): void {
    this.searchKeywordControl.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          const sanitizedValue = removeSpecialCharacters(value);

          this.getSearchResults(sanitizedValue);
        })
      )
      .subscribe();
  }
  searchName(e: any) {
    this.searchNameValue = e;
    this.pageNumber = 0; // Reset to first page when searching
    this.getSearchResults(this.searchNameValue);
  }
  onTableFilterChanged(filters: any) {
    // Extract sector and classification from filters and pass to getSearchResults
    // Find the full sector object if an id is provided
    let sectorObj = undefined;
    if (filters.sector) {
      const s = this.allSectors.find(
        (s) => s.id === (typeof filters.sector === 'string' ? filters.sector : filters.sector.id)
      );
      if (s) sectorObj = { id: s.id, title: s.title };
    }
    let classificationObj = undefined;
    if (filters.classification) {
      const c = this.classificationsList.find(
        (c) =>
          c.id ===
          (typeof filters.classification === 'string'
            ? filters.classification
            : filters.classification.id)
      );
      if (c) classificationObj = { id: c.id, title: c.title };
    }
    this.pageNumber = 0; // Reset to first page when table filter changes
    const searchedValue = this.searchNameValue || '';
    let fromDate = '';
    let toDate = '';
    if (this.fromDateControl.value && this.toDateControl.value) {
      fromDate = this.datePipe.transform(this.fromDateControl.value, 'yyyy-MM-dd') || '';
      toDate = this.datePipe.transform(this.toDateControl.value, 'yyyy-MM-dd') || '';
    }
    this.getSearchResults(searchedValue, fromDate, toDate, classificationObj, sectorObj);
  }
  getSearchResults(
    searchedValue: string,
    fromDate: string = '',
    toDate: string = '',
    classification?: { id: string; title: string },
    sector?: { id: string; title: string }
  ): void {
    this.isTableLoading = true; // Use isTableLoading instead of isLoadingResults
    // Clear previous results immediately to prevent showing stale data
    this.searchedTransactionsResults = [];
    this.totalElements = 0;
    this.cdr.markForCheck();

    this.manageTransactionsService.requestContainersService
      .getTransactionsListInImport(
        {
          pageSize: this.pageSize,
          pageIndex: this.pageNumber,
        },
        {
          searchKeyword: searchedValue,
          fromDate,
          toDate,
          classification: classification,
          sector: sector,
        },
        {
          sortBy: '',
          sortType: 'desc',
        },
        []
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.totalElements = res.totalCount;
          this.searchedTransactionsResults = [...res.data]; // Create new array reference
          this.cdr.markForCheck(); // Force change detection
        }),
        catchError((err) => {
          this.searchedTransactionsResults = [];
          this.totalElements = 0;
          this.cdr.markForCheck();
          return [];
        }),
        finalize(() => {
          this.isTableLoading = false; // Use isTableLoading instead of isLoadingResults
          this.cdr.markForCheck();
        })
      )
      .subscribe();
  }
  pageChanged(event: any) {
    this.pageNumber = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getSearchResults(this.searchNameValue);
  }
  getSectorsByFoundation(): void {
    this.manageTransactionsService.foundationsService
      .getSectorsByFoundationsId(this.form.get('foundation')?.value, true)
      .subscribe((res) => {
        this.setSector(res);
      });
  }

  setSector(sectorPayload: SectorPayload): void {
    const timestamp = new Date().getTime();
    this.form.get('sector')?.setValue(sectorPayload.sector.title);
    this.form.get('subSector')?.setValue(sectorPayload.sector.title);
    this.sectorId = sectorPayload.subSector?.id
      ? sectorPayload.subSector.id
      : sectorPayload.sector?.id;
  }

  clearSectors() {
    this.form.controls['sector'].setValue(null);
    this.form.controls['subSector'].setValue(null);
  }

  onSelectedContainerChanged(): void {
    this.requestContainerId = this.selectedContainerControl.value?.id;
  }

  getAllSectors() {
    this.manageActionsService.sectorsService
      .getSectorsList(
        { pageIndex: 0, pageSize: 1000 },
        { parentId: null },
        undefined,
        undefined,
        true
      )
      .subscribe((res) => {
        this.allSectors = res.data;
        this.initializeColumnConfig();
      });
  }
  initializeDropDownLists(): void {
    this.foundationsList$ = this.manageTransactionsService.foundationsService.getFoundationsList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      {
        parentId: null,
      },
      undefined,
      this.dropDownProperties,
      true
    );
    this.foundationsList$.subscribe((res) => {
      if (res && Array.isArray(res.data)) {
        this.foundationsListArray = res.data;
      }
    });

    this.concernedFoundationsList$ =
      this.manageTransactionsService.foundationsService.getFoundationsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          parentId: null,
        },
        undefined,
        this.dropDownProperties,
        true
      );

    this.benefitTypesList$ = this.manageTransactionsService.benefitTypesService.getBenefitTypesList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      undefined,
      undefined,
      this.dropDownProperties,
      true
    );

    this.sectorsList$ = this.manageTransactionsService.sectorsService.getSectorsList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      {
        parentId: null,
      },
      undefined,
      this.dropDownProperties,
      true
    );

    this.manageTransactionsService.classificationsService
      .getClassificationsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        this.dropDownPropertiesClass,
        true
      )
      .subscribe((res) => {
        this.classificationsList = res.data;
        this.initializeColumnConfig(); // <-- add this
      });

    this.manageTransactionsService.prioritiesService
      .getPrioritiesList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        this.dropDownProperties,
        true
      )
      .subscribe((res) => {
        this.prioritiesList = res.data;
      });

    this.manageTransactionsService.organizationUnitsService
      .getOrganizationUnitsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
        },
        undefined,
        undefined,
        true
      )
      .subscribe((res) => {
        this.organizationUnitsList = res.data;
      });

    this.containersList$ =
      this.manageTransactionsService.requestContainersService.getTransactionsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        undefined,
        undefined,
        undefined,
        true
      );

    this.manageTransactionsService.referralJustificationsService
      .getReferralJustificationsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        this.dropDownProperties,
        true
      )
      .subscribe((res) => {
        this.referralJustificationsList = res.data;
      });

    this.usersList$ = this.manageTransactionsService.usersService.getUsersList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      undefined,
      undefined,
      ['id', 'name'],
      true
    );
  }

  onSelectedFoundationChanged(): void {
    const foundation = this.form.value.foundation;
    if (!foundation) {
      // Handle clear: reset dependent fields, lists, etc.
      this.onFoundationCleared();
      return;
    }
    if (foundation) {
      this.getSectorsByFoundation();
      //Reset subFoundation field
      this.form.patchValue({
        subFoundation: null,
      });

      this.subFoundationsList$ =
        this.manageTransactionsService.foundationsService.getFoundationsList(
          {
            pageSize: 20,
            pageIndex: 0,
          },
          {
            parentId: foundation,
          },
          undefined,
          this.dropDownProperties,
          true
        );

      this.subFoundationsList$.subscribe((res) => {
        if (res && Array.isArray(res.data)) {
          this.subFoundationsListArray = res.data;
        }
      });
    }
  }

  onFoundationCleared(): void {
    //Reset subFoundation field
    this.form.patchValue({
      subFoundation: '',
    });
    this.clearSectors();
    this.subFoundationsList$ = of({ data: [], totalCount: 0, groupCount: -1 });
  }

  onSelectedSectorChanged(): void {
    const { sector } = this.form.value;

    if (sector) {
      //Reset subSector field
      this.form.patchValue({
        subSector: '',
      });

      this.subSectorsList$ = this.manageTransactionsService.sectorsService.getSectorsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          parentId: sector.id,
        },
        undefined,
        this.dropDownProperties,
        true
      );
    }
  }

  onSectorCleared(): void {
    //Reset subFoundation field
    this.form.patchValue({
      subFoundation: '',
    });

    this.subFoundationsList$ = of({ data: [], totalCount: 0, groupCount: -1 });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;

    let {
      title,
      description,
      descriptionEn,
      foundation,
      subFoundation,
      concernedFoundations,
      benefitType,
      sector,
      priorityId,
      classificationId,
      referralJustificationId,
      users,
    } = this.form.value;
    // // Always produce an array of string ids for concernedFoundationsIds
    // let concernedFoundationsIds: string[] = [];
    // if (Array.isArray(concernedFoundations)) {
    //   concernedFoundationsIds = concernedFoundations
    //     .filter((f) => f && typeof f.id === 'string')
    //     .map((f) => f.id);
    // } else if (
    //   concernedFoundations &&
    //   typeof concernedFoundations.id === 'string'
    // ) {
    //   concernedFoundationsIds = [concernedFoundations.id];
    // }
    // // Always produce an array of valid user ids (strings)
    // let usersIds: string[] = [];
    // if (Array.isArray(users)) {
    //   usersIds = users
    //     .filter((u) => u && typeof u.id === 'string')
    //     .map((u) => u.id);
    // } else if (users && typeof users.id === 'string') {
    //   usersIds = [users.id];
    // }
    this.manageTransactionsService.requestContainersService
      .addTransaction({
        title,
        description,
        descriptionEn,
        foundationId: foundation,
        subFoundationId: subFoundation,
        concernedFoundationsIds: concernedFoundations,
        benefitTypeId: benefitType,
        sectorId: this.sectorId,
        priorityId,
        classificationId,
        usersIds: users,
        referralJustificationId,
      })
      .subscribe({
        next: (res) => {
          this.requestContainerId = res.id;

          const sectorObj = this.allSectors.find((s) => s.id === this.sectorId);
          const cardData = {
            title: title,
            transactionNumber: res.autoNumber,
            sector: sectorObj || { id: this.sectorId, title: '', titleEn: '' },
            classification: this.classificationsList.find((c) => c.id === classificationId),
          };

          this.toastr.success(
            `${this.translateService.instant('shared.serialNumberIs')} (${res.autoNumber})`,
            this.translateService.instant('shared.processDone')
          );

          this.onGoToNextStep({
            showImport: true,
            requestContainerId: res.id,
            requestContainerData: {
              foundation: foundation,
              subFoundation: subFoundation,
              concernedFoundations: concernedFoundations,
              classificationId,
              users,
            },
            cardData: cardData,
          });
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 400) {
            this.disableSubmitBtn = false;
          }
        },
      });
  }

  hasUserChosenTransaction(): boolean {
    return this.searchedTransactionsResults.find((ele) => ele.checked) ? true : false;
  }

  onSubmitChoosingTransaction(data: any): void {
    const checkedTransaction = data;
    if (!checkedTransaction) {
      return;
    }
    if (checkedTransaction) this.rowSelected = true;
    const buildRequestContainerData = (transaction: any) => ({
      foundation: transaction.foundation,
      subFoundation: transaction.subFoundation,
      concernedFoundations: transaction.concernedFoundations,
      classificationId: transaction.classification.id,
      users: this.allowedUsers.length > 0 ? this.allowedUsers : transaction.users,
    });
    const proceedToNextStep = (transaction: any) => {
      const cardData = {
        title: transaction.title,
        transactionNumber: transaction.transactionNumber,
        sector: transaction.sector,
        classification: transaction.classification,
      };
      console.log(transaction);
      this.onGoToNextStep({
        showImport: true,
        requestContainerId: transaction.id,
        requestContainerData: buildRequestContainerData(transaction),
        cardData: cardData,
      });
    };

    if (checkedTransaction.classification.classificationLevel === ClassificationLevel.Restricted) {
      this.getUsersAccessibility(checkedTransaction.id);
      this.manageTransactionsService.requestContainersService
        .getUsersAccessibilityList({ hasAccess: true }, checkedTransaction.id, true)
        .subscribe(() => proceedToNextStep(checkedTransaction));
    } else {
      proceedToNextStep(checkedTransaction);
    }
  }

  onSubmitChoosingDocument(): void {
    this.onGoToNextStep({
      didUserChooseDocument: true,
      showImport: false,
      cardData: null,
    });
  }

  navigateToTablePage(): void {
    this.location.back();
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  searchOnFoundations(event: { term: string; items: any[] }) {
    this.foundationsList$ = this.manageTransactionsService.foundationsService.getFoundationsList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        parentId: null,
        searchKeyword: event.term,
      },
      undefined,
      this.dropDownProperties,
      true
    );
  }

  searchOnSubFoundations(event: { term: string; items: any[] }) {
    const { foundation } = this.form.value;

    if (foundation) {
      this.subFoundationsList$ =
        this.manageTransactionsService.foundationsService.getFoundationsList(
          {
            pageSize: 10,
            pageIndex: 0,
          },
          {
            parentId: foundation.id,
            searchKeyword: event.term,
          },
          undefined,
          this.dropDownProperties,
          true
        );
    }
  }

  searchOnConcernedFoundations(event: { term: string; items: any[] }) {
    this.concernedFoundationsList$ =
      this.manageTransactionsService.foundationsService.getFoundationsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          parentId: null,
          searchKeyword: event.term,
        },
        undefined,
        this.dropDownProperties,
        true
      );
  }

  searchOnBenefitTypes(event: { term: string; items: any[] }) {
    this.benefitTypesList$ = this.manageTransactionsService.benefitTypesService.getBenefitTypesList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: event.term,
      },
      undefined,
      this.dropDownProperties,
      true
    );
  }

  searchOnSectors(event: { term: string; items: any[] }) {
    this.sectorsList$ = this.manageTransactionsService.sectorsService.getSectorsList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        parentId: null,
        searchKeyword: event.term,
      },
      undefined,
      this.dropDownProperties,
      true
    );
  }

  searchOnSubSectors(event: { term: string; items: any[] }) {
    const { sector } = this.form.value;

    if (sector) {
      this.subSectorsList$ = this.manageTransactionsService.sectorsService.getSectorsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          parentId: sector.id,
          searchKeyword: event.term,
        },
        undefined,
        this.dropDownProperties,
        true
      );
    }
  }

  searchOnContainers(event: { term: string; items: any[] }) {
    this.containersList$ =
      this.manageTransactionsService.requestContainersService.getTransactionsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          searchKeyword: event.term,
        },
        undefined,
        undefined,
        true
      );
  }

  searchOnUsers(event: { term: string; items: any[] }) {
    this.usersList$ = this.manageTransactionsService.usersService.getUsersList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: event.term,
      },
      undefined,
      undefined,
      true
    );
  }

  onClassificationChanges(): void {
    const classificationId = this.form.get('classificationId')!.value;
    if (!classificationId) {
      this.showAccessUsers = null;
      return;
    }
    // Instead of using res.classificationLevel, get the classification object from the list
    const classificationObj = this.classificationsList.find((c) => c.id === classificationId);
    this.manageTransactionsService.classificationsService
      .getClassificationUsersById(classificationId, true)
      .subscribe((res) => {
        this.showAccessUsers =
          classificationObj?.classificationLevel === ClassificationLevel.Restricted ? true : false;

        this.usersList$ = of({
          data: res,
          totalCount: res.length,
        });

        this.form.patchValue({
          users: res.map((u) => u.id),
        });
      });
  }

  onCheckTransaction(transaction: SearchedTransaction, check: boolean): void {
    transaction.checked = check;

    this.searchedTransactionsResults.map((ele) => {
      if (check && ele.id !== transaction.id) {
        ele.checked = false;
      }
    });
  }

  formatConcernedFoundations(
    concernedFoundations: { id: string; title: string; titleEn: string }[]
  ): string {
    return concernedFoundations
      .map((ele) => {
        return this.lang === 'ar' ? ele.title : ele.titleEn;
      })
      .join(' ,');
  }

  onGoToNextStep(data?: {
    showImport?: boolean;
    requestContainerId?: string;
    requestContainerData?: {
      foundation: { id: string; title: string; titleEn: string } | null;
      subFoundation: { id: string; title: string; titleEn: string } | null;
      concernedFoundations: { id: string; title: string; titleEn: string }[];
      classificationId: string;
      users: { id: string; name: string }[] | User[];
    };
    didUserChooseDocument?: boolean;
    cardData?;
  }): void {
    let requestContainerData = data?.requestContainerData;
    if (requestContainerData) {
      // Normalize foundation
      if (requestContainerData.foundation && typeof requestContainerData.foundation === 'string') {
        const found = this.foundationsListArray.find(
          (f) => f.id === requestContainerData.foundation
        );
        requestContainerData.foundation = found || {
          id: requestContainerData.foundation,
          title: requestContainerData.foundation,
          titleEn: requestContainerData.foundation,
        };
      }
      // Normalize subFoundation
      if (
        requestContainerData.subFoundation &&
        (typeof requestContainerData.subFoundation === 'string' ||
          typeof requestContainerData.subFoundation.id === 'string')
      ) {
        let subFoundationId =
          typeof requestContainerData.subFoundation === 'string'
            ? requestContainerData.subFoundation
            : requestContainerData.subFoundation.id;
        const found = this.subFoundationsListArray.find((f) => f.id === subFoundationId);
        requestContainerData.subFoundation = found || {
          id: subFoundationId,
          title: found ? found.title : requestContainerData.subFoundation.title,
          titleEn: found ? found.titleEn : requestContainerData.subFoundation.titleEn,
        };
      }
    }
    this.nextStep.emit({
      showImport: data?.showImport,
      requestContainerId: data?.requestContainerId,
      requestContainerData: requestContainerData,
      //requestContainerCommitteeId: data?.requestContainerCommitteeId,
      didUserChooseDocument: data?.didUserChooseDocument,
      cardData: data?.cardData,
    });
  }

  onTabClicked(event: MatTabChangeEvent): void {
    this.initializeForm();
    if (event.index === 0) {
      // AddTransactionOptions.NewRequest
      this.rowSelected = false;
      this.nextStep.emit({
        showImport: false,
        didUserChooseDocument: false,
        cardData: undefined,
      });
    }
    if (event.index === 1) {
      this.getAllSectors();
      this.getSearchResults('');
      this.nextStep.emit({
        showImport: false,
        didUserChooseDocument: false,
        cardData: undefined,
      });
      // AddTransactionOptions.AddToRequest
    }

    if (event.index === 2) {
      // AddTransactionOptions.Document
      this.rowSelected = false;
      this.onSubmitChoosingDocument();
      // Force change detection to hide info container if cardData is set to null
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    }
  }
  goToLastPage(): void {
    this.location.back();
  }
}
