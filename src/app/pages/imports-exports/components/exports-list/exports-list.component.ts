import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import {
  AllExportRequestModel,
  AllRequests,
  ExportRequestModel,
  Request,
  RequestsFiltersForm,
} from '@core/models/request.model';
import { forkJoin, Observable, Subscription, tap } from 'rxjs';
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
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { Transaction } from '@core/models/transaction.model';
import { UpdateAccessibilityModalComponent } from '@pages/imports-exports/components/update-accessibility-modal/update-accessibility-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersSearchService } from '@core/services/search-services/users-search.service';
import { FoundationsSearchService } from '@core/services/search-services/foundations-search.service';
import { RequestTypesSearchService } from '@core/services/search-services/request-types-search.service';
import { DocumentTypesSearchService } from '@core/services/search-services/document-types-search.service';
import { RequestStatusArray } from '@core/enums/request-status.enum';
import { Entity } from '@core/models/entity.model';
import { AuthorizationPopupComponent } from '@shared/new-components/authorization-popp/authorization-popup.component';
import { AuthService } from '@core/services/auth/auth.service';
import { ManageSharedService } from '@shared/services/manage-shared.service';
@Component({
  selector: 'app-exports-list',
  templateUrl: './exports-list.component.html',
  styleUrls: ['./exports-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ExportsListComponent implements OnInit {
  requestsSource: ExportRequestModel[] = [];
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
    injector: Injector,
    private authService: AuthService,
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

  readonly usersSearchService = inject(UsersSearchService);
  readonly foundationsSearchService = inject(FoundationsSearchService);
  readonly requestTypesSearchService = inject(RequestTypesSearchService);
  readonly documentTypesSearchService = inject(DocumentTypesSearchService);
  destroyRef = inject(DestroyRef);

  nextStepsList: string[] = [];
  foundationsList: any[] = [];
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

      foundations: this.foundationsSearchService.foundationsList$,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.requestTypesList = results.requestTypes.data;
        this.nextStepsList = results.currentSteps;

        this.foundationsList = results.foundations.data;
        this.status = RequestStatusArray;
        this.initializeColumnConfig();
        this.initializeColumns();
      });
  }
  isLoading = false;
  totalElements: number = 0;
  isError: boolean = false;
  initializeTable() {
    this.isLoading = true;

    this.manageImportsExportsService.requestsService
      .getExportsRequestsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData
      )
      .subscribe({
        next: (res: any) => {
          this.requestsSource = res.data;
          this.totalElements = res.totalCount;
        },
        error: (err) => {
          this.isError = true;
          console.error(err);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
  columnsConfig: any[] = [];
  columns: string[] = [];
  ExportedDocumentTypeArr = [
    {
      id: ExportedDocumentType.Letter,
      title: 'TransactionsModule.ExportDocumentComponent.letter',
    },
    {
      id: ExportedDocumentType.Note,
      title: 'TransactionsModule.ExportDocumentComponent.note',
    },
    {
      id: ExportedDocumentType.Record,
      title: 'TransactionsModule.ExportDocumentComponent.record',
    },
    { id: ExportedDocumentType.Other, title: 'shared.other' },
  ];
  initializeColumns() {
    this.columns = [
      'status',
      'transactionNumber',
      'documentType',
      'title',
      'autoNumber',
      'exportNumber',
      'priority',
      'foundations',
      'exportedDate',

      'actions',
    ];
  }
  initializeColumnConfig() {
    this.columnsConfig = [
      {
        label: 'shared.status',
        type: 'checkbox',
        disabled: false,
        checked: false,
      },
      {
        label: 'shared.transactionNum',
        type: 'text',
      },
      {
        label: 'shared.type',
        type: 'ExportedDocumentTypeEnum',
        arKey: 'name',
        enKey: 'name',
        hasFilter: true,
        menuData: this.ExportedDocumentTypeArr,
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
        label: 'shared.priority',
        type: 'priorityColors',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.prioritiesList,
      },
      {
        label: 'shared.incomingFoundation',
        type: 'arrOfItems',
        subTitle: 'title',
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
      delete this.filtersData.foundation;
      // delete this.filtersData.foundationId;
    }
    if (queryParams.foundationId) {
      this.filtersData.foundationId = queryParams.foundationId;
    }
    if (queryParams.requestType) {
      delete this.filtersData.requestType;
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
      this.filtersData.committee = {
        id: queryParams.committee.split('#')[0],
        committeeSymbol: queryParams.committee.split('#')[1],
      };
    }

    if (queryParams.consultant) {
      this.filtersData.consultant = {
        id: queryParams.consultant.split('#')[0],
        name: queryParams.consultant.split('#')[1],
      };
    }

    if (queryParams.status) {
      delete this.filtersData.status;
    }

    if (queryParams.isExportDocument) {
      this.filtersData.isExportDocument = queryParams.isExportDocument === 'true';
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
    console.log('filtersData in exports', filtersData);
    // Serialize previous and incoming filters to detect real change before reloading table

    this.filtersData = filtersData;
    this.pageIndex = 0; // reset pagination on filter change

    // Emit filter change to parent
    this.filterChanged.emit(filtersData);

    //  console.log("hasChanged",hasChanged);
    //  console.log("this.filtersData",this.filtersData);
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
    console.log('pageInformation');
    this.initializeTable();
  }

  onSortColumn(sortInformation: { active: string; direction: SortDirection }): void {
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'sortBy', propertyValue: sortInformation.active },
      { propertyName: 'sortType', propertyValue: sortInformation.direction },
    ]);
  }

  get activeTab() {
    if (this.filtersData.isExportDocument === undefined) {
      return 0;
    }

    if (this.filtersData.isExportDocument === true) {
      return 1;
    }

    return 2;
  }

  onRightClick(element: Request): void {
    if (element.isExportDocument) {
      window.open('/imports-exports/' + element.id + '/exportable-document-details', '_blank');
    } else {
      window.open('/imports-exports/' + element.id + '/request-details', '_blank');
    }
  }
  noPermission() {
    console.log(document);
    const filtersDialogRef = this.dialog.open(AuthorizationPopupComponent, {
      data: {
        title: this.translateService.instant('unauthorized.accessDenied'),
        message: `${this.translateService.instant('unauthorized.youDoNotHavePermission')} `,
        authorizationInside: false,
      },
      disableClose: true,
    });
  }
  onViewElement(element: Request): void {
    this.router.navigate([`${element.id}`, 'exportable-document-details'], {
      relativeTo: this.activatedRoute,
    });
  }

  onEditElement(element: Request): void {
    //It is exported document
    if (!this.authService.userPermissions.includes(PermissionsObj.UpdateRequest)) {
      this.noPermission();
      return;
    }
    this.router.navigate([`${element.id}/export`], {
      relativeTo: this.activatedRoute,
    });
  }

  onUploadAttachments(element: Request): void {
    this.router.navigate([`${element.id}/add-attachments`], {
      relativeTo: this.activatedRoute,
    });
  }
  onOpenAccessibility(element: Transaction): void {
    this.dialog.open(UpdateAccessibilityModalComponent, {
      minWidth: '62.5rem',
      maxWidth: '62.5rem',
      height: '95vh',
      maxHeight: '95vh',
      panelClass: ['action-modal', 'float-footer'],
      autoFocus: false,
      disableClose: true,
      data: {
        requestId: element.id,
        users: element.users,
        isExportDocument: true,
      },
    });
  }

  onDeleteElement(element: Request): void {
    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
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
              this.initializeTable();
            });
        },
      },
    });

    return;
  }

  onSelect(expArr): void {
    //Incase user checks box next to each exported document row in table
    this.selectedExportedDocumentsIds = expArr;
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['icon', 'autoNumber', 'actions'];
    } else {
      return [
        'checked',
        'icon',
        'autoNumber',
        'requestType.title',
        'number',
        'transactionNumber',
        'priority.title',
        'title',
        'foundation.title',
        'date',
        'actions',
      ];
    }
  }

  onExportExcel(): void {
    this.toastr.success('جاري التحميل....قد يستغرق عدة دقائق');
    this.manageImportsExportsService.requestsService
      .getExportsRequestsListExcel(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData
      )
      .subscribe();
  }

  // Helper: produce stable string representation of filters for comparison
  private serializeFilters(f: RequestsFiltersForm): string {
    if (!f) return '';
    // Pick only relevant keys (exclude volatile / undefined ordering issues)
    const normalized: any = {
      searchKeyword: f.searchKeyword || null,
      foundationId: f.foundationId || null,
      documentType: f.documentType ?? null,
      priority: f.priority ? { id: f.priority.id } : null,
      committee: f.committee ? { id: f.committee.id } : null,
      consultant: f.consultant ? { id: f.consultant.id } : null,
      isExportDocument: f.isExportDocument ?? null,
      fromDate: f.fromDate || null,
      toDate: f.toDate || null,
      hijriFromDate: f.hijriFromDate || null,
      hijriToDate: f.hijriToDate || null,
      status: f.status || null,
      requestType: f.requestType || null,
      foundation: f.foundation || null,
    };
    return JSON.stringify(normalized);
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
