import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnInit,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import {
  AllAllowedUsers,
  AllImportRequests,
  AllRequests,
  Request,
  RequestItem,
  RequestsFiltersForm,
} from '@core/models/request.model';
import {
  forkJoin,
  Observable,
  Subscription,
  tap,
  Subject,
  catchError,
  finalize,
  takeUntil,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { Location } from '@angular/common';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { RequestStatus } from '@core/enums/request-status.enum';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { AbstractTable } from '@core/abstract-classes/abstract-table.abstract';
import { QueryUrlFiltersPaginationSort } from '@core/abstract-classes/query-url-filters.abstract';
import { SortDirection } from '@angular/material/sort';
import { Transaction } from '@core/models/transaction.model';
import { UpdateAccessibilityModalComponent } from '@pages/imports-exports/components/update-accessibility-modal/update-accessibility-modal.component';
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { UsersSearchService } from '@core/services/search-services/users-search.service';
import { FoundationsSearchService } from '@core/services/search-services/foundations-search.service';
import { RequestTypesSearchService } from '@core/services/search-services/request-types-search.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Entity } from '@core/models/entity.model';
import { RequestStatusArray } from '@core/enums/request-status.enum';
import { DocumentTypesSearchService } from '@core/services/search-services/document-types-search.service';
import { AuthorizationPopupComponent } from '@shared/new-components/authorization-popp/authorization-popup.component';
import { AuthService } from '@core/services/auth/auth.service';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-imports-list',
  templateUrl: './imports-list.component.html',
  styleUrls: ['./imports-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ImportsListComponent implements OnInit {
  requestsSource: RequestItem[] = [];
  expandedElement!: Request | null;
  filtersData: RequestsFiltersForm = {} as RequestsFiltersForm;
  resetTableFiltersFlag: boolean = false;

  RequestStatus = RequestStatus;
  PermissionsObj = PermissionsObj;
  selectedExportedDocumentsIds: string[] = [];
  ExportedDocumentType = ExportedDocumentType;
  @Input() prioritiesList: Entity[] = [];
  @Output() setSelectedPriority = new EventEmitter<any>();
  @Output() filterChanged = new EventEmitter<RequestsFiltersForm>();

  constructor(
    private dialog: MatDialog,
    private manageImportsExportsService: ManageImportsExportsService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private router: Router,
    private location: Location,
    private queryUrlFiltersPaginationSort: QueryUrlFiltersPaginationSort,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    injector: Injector,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnInit(): void {
    this.initializeColumnConfig();
    this.initializeColumns();
    this.initConfigsAndLoadData();
    this.initializeTable();

    // Listen to dialog filter changes from shared service
    this.manageSharedService.searchFormValue
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filters: any) => {
        if (filters && Object.keys(filters).length > 0) {
          this.filtersData = filters;
          this.pageIndex = 0;
          this.initializeTable();
        }
      });
  }
  @Input() filterData: any;
  readonly usersSearchService = inject(UsersSearchService);
  readonly foundationsSearchService = inject(FoundationsSearchService);
  readonly requestTypesSearchService = inject(RequestTypesSearchService);
  readonly documentTypesSearchService = inject(DocumentTypesSearchService);
  destroyRef = inject(DestroyRef);

  nextStepsList: string[] = [];
  foundationsList: any[] = [];
  usersList: any[] = [];
  requestTypesList: any[] = [];
  status: { id: number; title: string }[] = [];
  pageIndex: number = 0;
  pageSize: number = 20;
  initConfigsAndLoadData() {
    // Trigger the search so the streams emit values
    this.usersSearchService.searchOnUsers();
    this.foundationsSearchService.searchOnFoundations();
    this.requestTypesSearchService.searchOnRequestTypes();
    this.documentTypesSearchService.searchOnDocumentTypes();
    forkJoin({
      requestTypes: this.documentTypesSearchService.documentTypesList$,
      currentSteps: this.manageImportsExportsService.requestsService.getCurrentStepsList(),
      users: this.usersSearchService.usersList$,
      foundations: this.foundationsSearchService.foundationsList$,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.requestTypesList = results.requestTypes.data;
        this.nextStepsList = results.currentSteps;
        this.usersList = results.users.data;
        this.foundationsList = results.foundations.data;
        this.status = RequestStatusArray;
        this.initializeColumnConfig();
        this.initializeColumns();
      });
  }
  isLoading = false;
  totalElements: number = 0;
  isError: boolean = false;
  private pendingDataRequest$ = new Subject<void>();
  private currentRequestId = 0;
  initializeTable() {
    const payload = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      ...this.filtersData,
    };
    const { pageIndex, pageSize: size, ...filtersData } = payload;

    // Reset totalElements and items when starting a new data load to avoid showing stale data
    this.totalElements = 0;
    this.requestsSource = [];
    this.isLoading = true;

    // Increment request ID to track which response is current
    this.currentRequestId++;
    const requestId = this.currentRequestId;

    // Cancel any pending requests
    this.pendingDataRequest$.next();

    this.manageImportsExportsService.requestsService
      .getImportsRequestsList({ pageIndex, pageSize: size }, filtersData)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.pendingDataRequest$),
        tap((res) => {
          // Only update if this is still the current request
          if (requestId === this.currentRequestId) {
            this.requestsSource = res.data;
            this.totalElements = res.totalCount;
            console.log(
              'Import list totalCount:',
              res.totalCount,
              'Data length:',
              res.data?.length
            );
          }
        }),
        catchError((err) => {
          this.isError = true;
          console.error(err);
          return [];
        }),
        finalize(() => {
          // Only set loading to false if this is the current request
          if (requestId === this.currentRequestId) {
            this.isLoading = false;
          }
        })
      )
      .subscribe();
  }
  columnsConfig: any[] = [];
  columns: string[] = [];
  initializeColumns() {
    this.columns = [
      'status',
      'transactionNumber',
      'title',
      'autoNumber',
      'importNumber',
      'requestType',
      'foundation',
      'deliveryDate',
      'mainConsultant',
      'actions',
    ];
  }
  initializeColumnConfig() {
    this.columnsConfig = [
      {
        label: 'shared.status',
        type: 'statusIcon',
        hasFilter: true,
        menuData: this.status,
      },
      {
        label: 'shared.transactionNum',
        type: 'text',
      },

      {
        label: 'shared.title',
        type: 'text',
      },
      {
        label: 'shared.generalNumber',
        type: 'text',
      },
      {
        label: 'shared.privateNumber',
        type: 'text',
      },
      {
        label: 'shared.type',
        type: 'text',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.requestTypesList,
      },
      {
        label: 'shared.incomingFoundation',
        type: 'text',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.foundationsList,
      },
      {
        label: 'shared.date',
        type: 'dateOnly',
      },
      {
        label: 'shared.consultant',
        type: 'text',
        arKey: 'name',
        enKey: 'name',
        hasFilter: true,
        menuData: this.usersList,
        menuClass: 'lastItemPosition',
      },
      {
        label: 'shared.action',
        type: 'actions',
        actions: [
          {
            action: 'view',
            actionName: 'view',
            onClick: (element: any) => {
              this.onViewElement(element);
            },
          },
          {
            action: 'edit',
            actionName: 'edit',
            onClick: (element: any) => {
              this.onEditElement(element);
            },
          },
          {
            action: 'accessibility',
            actionName: 'accessibility',
            Permission: PermissionsObj.UpdateRequestContainerAccessibility,
            classificationLevel: ClassificationLevel.Restricted,
            onClick: (element: any) => {
              this.onOpenAccessibility(element);
            },
          },
          // {
          //   action: 'addAttachment',
          //   actionName: 'addAttachment',
          //   onClick: (element: any) => {
          //     this.onUploadAttachments(element);
          //   },
          // },
        ],
      },
    ];
  }

  setFiltersFromUrl(queryParams: any): void {
    this.filtersData = {};
    if (queryParams.searchKeyword) {
      this.filtersData.searchKeyword = queryParams.searchKeyword;
    }

    if (queryParams.foundation) {
      this.filtersData.foundation = {
        id: queryParams.foundation.split('#')[0],
        title: queryParams.foundation.split('#')[1],
      };
    }
    if (queryParams.requestType) {
      this.filtersData.requestType = {
        id: queryParams.requestType.split('#')[0],
        title: queryParams.requestType.split('#')[1],
      };
    }

    if (queryParams.documentType) {
      this.filtersData.documentType = parseInt(queryParams.documentType);
    }

    if (queryParams.priority) {
      this.filtersData.priority = {
        id: queryParams.priority.split('#')[0],
        title: queryParams.priority.split('#')[1],
      };
    }

    if (queryParams.committee) {
      delete this.filtersData.committee;
      // this.filtersData.committee = {
      //     id: queryParams.committee.split('#')[0],
      //     committeeSymbol: queryParams.committee.split('#')[1],
      // };
    }

    if (queryParams.consultant) {
      this.filtersData.consultant = {
        id: queryParams.consultant.split('#')[0],
        name: queryParams.consultant.split('#')[1],
      };
    }

    if (queryParams.status) {
      this.filtersData.status = {
        id: queryParams.status.split('#')[0],
        name: queryParams.status.split('#')[1],
      };
    }

    if (queryParams.isExportDocument) {
      delete this.filtersData.isExportDocument;
    }
    if (queryParams.gregorianRange) {
      this.filtersData.fromDate = queryParams.gregorianRange.split('#')[0];
      this.filtersData.toDate = queryParams.gregorianRange.split('#')[1];
    }

    if (queryParams.hijriRange) {
      this.filtersData.hijriFromDate = queryParams.hijriRange.split('#')[0];
      this.filtersData.hijriToDate = queryParams.hijriRange.split('#')[1];
    }
  }

  onFiltersChange(filtersData: RequestsFiltersForm): void {
    console.log('filtersData in imports', filtersData);
    delete filtersData?.isExportDocument;
    // Merge with existing filters to preserve searchKeyword and other fields
    this.filtersData = { ...this.filtersData, ...filtersData };
    this.pageIndex = 0;
    this.totalElements = 0; // Reset total elements while loading new filtered data
    // Emit filter change to parent
    this.filterChanged.emit(this.filtersData);
    // Don't update URL on filter changes - only on pagination/sort/tab
    this.initializeTable();
  }

  onPaginationChange(pageInformation: { pageSize: number; pageIndex: number }): void {
    if (
      this.pageSize === pageInformation.pageSize &&
      this.pageIndex === pageInformation.pageIndex
    ) {
      return;
    }
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'pageSize', propertyValue: pageInformation.pageSize },
      { propertyName: 'pageIndex', propertyValue: pageInformation.pageIndex },
    ]);
    this.selectedExportedDocumentsIds = [];
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;
    this.initializeTable();
  }

  onSortColumn(sortInformation: { active: string; direction: SortDirection }): void {
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'sortBy', propertyValue: sortInformation.active },
      { propertyName: 'sortType', propertyValue: sortInformation.direction },
    ]);
  }

  onOpenAccessibility(element: Transaction): void {
    this.dialog.open(UpdateAccessibilityModalComponent, {
      minWidth: '62.5rem',
      maxWidth: '62.5rem',
      // height: '95vh',
      // maxHeight: '95vh',
      panelClass: ['action-modal'],
      autoFocus: false,
      disableClose: false,
      data: {
        requestId: element.id,
        users: element.users,
      },
    });
  }

  onViewElement(element: Request): void {
    if (!element.isRestricted) {
      this.router.navigate([`${element.id}`, 'request-details'], {
        relativeTo: this.activatedRoute,
        queryParams: { from: 'imports' },
      });
      // if (element.isExported) {
      //   this.router.navigate([`${element.id}`, 'exportable-document-details'], {
      //     relativeTo: this.activatedRoute,
      //   });
      // } else {
      //   this.router.navigate([`${element.id}`, 'request-details'], {
      //     relativeTo: this.activatedRoute,
      //     queryParams: { from: 'imports' },
      //   });
      // }
      return;
    }
  }

  onEditElement(element: Request): void {
    if (!this.authService.userPermissions.includes(PermissionsObj.UpdateRequest)) {
      this.noPermission();
      return;
    }
    this.router.navigate([`${element.id}/import`], {
      relativeTo: this.activatedRoute,
    });
  }
  noPermission() {
    console.log(document);
    const filtersDialogRef = this.dialog.open(AuthorizationPopupComponent, {
      minWidth: '36.25rem',
      maxWidth: '36.25rem',
      maxHeight: '44.3125rem',
      panelClass: 'action-modal',
      autoFocus: false,
      disableClose: false,
      data: {
        title: this.translateService.instant('unauthorized.accessDenied'),
        message: `${this.translateService.instant('unauthorized.youDoNotHavePermission')} `,
        authorizationInside: false,
      },
    });
  }

  onUploadAttachments(element: Request): void {
    this.router.navigate([`${element.id}/add-attachments`], {
      relativeTo: this.activatedRoute,
    });
  }

  onDeleteElement(element: Request): void {
    if (element.isExported) {
      this.dialog.open(ConfirmationModalComponent, {
        minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
        autoFocus: false,
        disableClose: false,
        data: {
          headerTranslationRef: this.translateService.instant(
            'ImportsExportsModule.ImportsExportsListComponent.confirmExportDeletion'
          ),
          headerIconSrc: 'assets/icons/trash-solid.svg',
          hasActionButtons: true,
          hasDeleteBtn: true,
          content: `${this.translateService.instant(
            'ImportsExportsModule.ImportsExportsListComponent.deleteExportWarning'
          )}  '${element.title}' ${this.translateService.instant('shared.questionMark')}`,
          confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
          confirmationAction: () => {
            this.dialog.closeAll();
            this.manageImportsExportsService.exportableDocumentService
              .deleteExportableDocumentById(element.id)
              .subscribe((res) => {
                this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
                this.initConfigsAndLoadData();
              });
          },
        },
      });

      return;
    }

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        headerTranslationRef: this.translateService.instant(
          'ImportsExportsModule.ImportsExportsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'ImportsExportsModule.ImportsExportsListComponent.deleteImportWarning'
        )}  '${element.title}' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageImportsExportsService.requestsService
            .deleteRequest(element.id)
            .subscribe((res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.initConfigsAndLoadData();
            });
        },
      },
    });
  }

  onNavigateBack(): void {
    this.location.back();
  }

  onSelect(checkedMetaData: { checked: boolean }, exportedDocument: Request): void {
    //Incase user checks box next to each exported document row in table
    exportedDocument.checked = checkedMetaData.checked;
    if (!checkedMetaData.checked) {
      this.selectedExportedDocumentsIds = this.selectedExportedDocumentsIds.filter(
        (id) => id != exportedDocument.id
      );
    } else {
      this.selectedExportedDocumentsIds.push(exportedDocument.id);
    }
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['icon', 'autoNumber', 'actions'];
    } else if (this.filtersData.isExportDocument) {
      return [
        'checked',
        'icon',
        'autoNumber',
        'requestType.title',
        'importNumber',
        'transactionNumber',
        'priority.title',
        'title',
        'foundation.title',
        'date',
        'mainConsultant.name',
        'actions',
      ];
    } else {
      return [
        'icon',
        'autoNumber',
        'requestType.title',
        'importNumber',
        'nextStep.title',
        'transactionNumber',
        'priority.title',
        'title',
        'foundation.title',
        'date',
        'mainConsultant.name',
        'status',
        'actions',
      ];
    }
  }

  formatConsultants(consultants: { id: string; name: string; isMain: boolean }[]): string {
    if (!consultants || (consultants && consultants.length === 1)) {
      return '';
    }

    return consultants
      .filter((ele) => !ele.isMain)
      .map((ele) => {
        return ele.name;
      })
      .join(' ,');
  }

  formatExportFoundations(exportFoundations: { id: string; title: string }[]): string {
    if (!exportFoundations || (exportFoundations && exportFoundations.length === 1)) {
      return '';
    }

    return exportFoundations
      .filter((ele, index) => {
        return index !== 0;
      })
      .map((ele) => {
        return ele.title;
      })
      .join(' ,');
  }

  onExportExcel(): void {
    this.toastr.success('جاري التحميل....قد يستغرق عدة دقائق');
    this.manageImportsExportsService.requestsService
      .getImportsRequestsListExcel(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData
      )
      .subscribe(
        (res) => {},
        (error) => {}
      );
  }

  resetFilters(): void {
    this.filtersData = {};
    this.pageIndex = 0;
    this.pageSize = 20;
    this.resetTableFiltersFlag = true;
    // Reset the flag after a short delay to allow change detection
    setTimeout(() => {
      this.resetTableFiltersFlag = false;
    }, 100);
    this.initializeTable();
  }

  protected readonly ClassificationLevel = ClassificationLevel;
}
