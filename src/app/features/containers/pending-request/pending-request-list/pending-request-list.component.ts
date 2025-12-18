import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestStatusArray } from '@core/enums/request-status.enum';
import { RouteConstants } from '@core/enums/routes.enum';
import { Entity } from '@core/models/entity.model';
import { PendingRequest, PendingRequestsFiltersForm } from '@core/models/pending-request.model';
import { FoundationsSearchService } from '@core/services/search-services/foundations-search.service';
import { FromDateToDateSearchService } from '@core/services/search-services/from-date-to-date-search.service';
import { RequestTypesSearchService } from '@core/services/search-services/request-types-search.service';
import { UsersSearchService } from '@core/services/search-services/users-search.service';
import { FiltersComponent } from '@features/components/pending-request/pending-request-list/filters/filters.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ManagePendingTransactionsService } from '@pages/pending-transactions/services/manage-pending-transactions.service';
import { TableListComponent } from '@shared/new-components/table-list/table-list.component';
import { catchError, debounceTime, finalize, forkJoin, Subject, tap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-pending-request-list',
  templateUrl: './pending-request-list.component.html',
  styleUrls: ['./pending-request-list.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, FiltersComponent, TableListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PendingRequestListComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private managePendingTransactionsService = inject(ManagePendingTransactionsService);
  readonly usersSearchService = inject(UsersSearchService);
  readonly foundationsSearchService = inject(FoundationsSearchService);
  readonly requestTypesSearchService = inject(RequestTypesSearchService);
  readonly fromDateToDateSearchService = inject(FromDateToDateSearchService);
  readonly router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  prioritiesList: Entity[] = [];
  nextStepsList: string[] = [];
  foundationsList: any[] = [];
  usersList: any[] = [];
  requestTypesList: any[] = [];

  //Table
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly DEFAULT_PAGE_NUMBER = 0;
  pageNumber: number = this.DEFAULT_PAGE_NUMBER;
  pageSize: number = this.DEFAULT_PAGE_SIZE;
  totalElements: number = 0;
  filterText = '';
  columns: string[] = [];
  columnsConfig: any[] = [];
  items: PendingRequest[] = [];
  requestsSource!: PendingRequest[];
  filtersData: PendingRequestsFiltersForm = {} as PendingRequestsFiltersForm;
  isLoading: boolean = false;
  isError: boolean = false;
  status: { id: number; title: string }[] = [];
  selectedFilters: { [key: string]: any } = {};
  allFilters: PendingRequestsFiltersForm = {};
  isTableFiltered: boolean = false;
  private loadDataSubject = new Subject<{ filters: any; pageNumber: number; pageSize: number }>();
  private pendingDataRequest$ = new Subject<void>();
  private currentRequestId = 0;
  private isResetting = false;
  constructor() {}

  ngOnInit() {
    this.isLoading = true;
    this.initConfigsAndLoadData();
    this.loadDataSubject
      .pipe(
        debounceTime(300), // Wait 300ms after last emission
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data) => {
        this.performLoadData(data.filters, data.pageNumber, data.pageSize);
      });
  }

  initConfigsAndLoadData() {
    // Trigger the search so the streams emit values
    this.usersSearchService.searchOnUsers();
    this.foundationsSearchService.searchOnFoundations();
    this.requestTypesSearchService.searchOnRequestTypes();

    forkJoin({
      priorities: this.managePendingTransactionsService.prioritiesService.getPrioritiesList(
        { pageSize: 50, pageIndex: 0 },
        undefined,
        undefined,
        ['id', 'title', 'titleEn']
      ),
      requestTypes: this.requestTypesSearchService.requestTypesList$,
      currentSteps: this.managePendingTransactionsService.requestsService.getCurrentStepsList(),
      users: this.usersSearchService.usersList$,
      foundations: this.foundationsSearchService.foundationsList$,
      pendingRequests: this.managePendingTransactionsService.requestsService.getPendingRequestsList(
        { pageIndex: this.pageNumber, pageSize: this.pageSize },
        {}
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.prioritiesList = results.priorities.data;
        this.requestTypesList = results.requestTypes.data;
        this.nextStepsList = results.currentSteps;
        this.usersList = results.users.data;
        this.foundationsList = results.foundations.data;
        this.status = RequestStatusArray;
        this.initializeColumnConfig();
        this.initializeColumns();

        // Set items and totalElements from the combined request
        this.items = results.pendingRequests.data;
        this.totalElements = results.pendingRequests.totalCount;
        this.isLoading = false;
      });
  }

  initializeColumns() {
    this.columns = [
      'status',
      'importNumber',
      'title',
      'requestType',
      'priority',
      'nextStep',
      'foundation',
      'exportType',
      // 'deliveryDate',
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
        label: 'ManageDocumentsModule.AddDocumentPage.incomingNumber',
        type: 'text',
      },
      {
        label: 'shared.title',
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
        label: 'shared.priority',
        type: 'priorityColors',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.prioritiesList,
      },
      {
        label: 'shared.nextStep',
        type: 'text',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.nextStepsList,
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
        label: 'shared.studyProposal',
        type: 'proposalEnum',
      },
      // {
      //   label: 'shared.date',
      //   type: 'dateOnly',
      // },
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
              this.View(element);
            },
          },
          {
            action: 'edit',
            actionName: 'edit',
            onClick: (element: any) => {
              this.Edit(element);
            },
          },
        ],
      },
    ];
  }
  onResetFilters() {
    if (this.isResetting) return;
    this.isTableFiltered = false;
    this.allFilters = {};
    this.pageNumber = this.DEFAULT_PAGE_NUMBER;
    this.loadData();
  }
  private lastTableFilters: PendingRequestsFiltersForm = {};

  onTableFilterChanged(filters: PendingRequestsFiltersForm) {
    if (this.isResetting) return;

    // Extract current table filters from allFilters (everything except component filters)
    const { searchKeyword, fromDate, toDate, exportTypeId, ...currentTableFilters } = this
      .allFilters as any;
    const componentOnlyFilters = { searchKeyword, fromDate, toDate, exportTypeId };

    const isTableReset = Object.keys(filters).length === 0;

    // Detect if filters were REMOVED by comparing current table filters with incoming filters
    const previousTableFilterKeys = Object.keys(currentTableFilters);
    const currentIncomingFilterKeys = Object.keys(filters);
    const filtersWereRemoved = previousTableFilterKeys.length > currentIncomingFilterKeys.length;

    if (isTableReset || filtersWereRemoved) {
      // When Select All is clicked or filters are removed
      // Remove any properties that are undefined or null from component filters
      Object.keys(componentOnlyFilters).forEach((key) => {
        if (componentOnlyFilters[key] === undefined || componentOnlyFilters[key] === null) {
          delete componentOnlyFilters[key];
        }
      });

      // Merge component filters with the remaining table filters
      this.allFilters = { ...componentOnlyFilters, ...filters } as PendingRequestsFiltersForm;
      this.isTableFiltered = Object.keys(filters).length > 0;
    } else {
      // New filters are being added
      this.isTableFiltered = true;
      this.allFilters = { ...this.allFilters, ...filters };
    }

    this.pageNumber = this.DEFAULT_PAGE_NUMBER; // Reset to first page when filters change
    this.loadData();
  }
  appFiltersModel;
  onFiltersComponentChanged(filters: PendingRequestsFiltersForm) {
    this.appFiltersModel = { ...this.allFilters, ...filters };
    const isReset = Object.keys(filters).length === 0;

    if (isReset) {
      this.isResetting = true;
      this.isTableFiltered = false;
      this.allFilters = {};
      this.pageNumber = this.DEFAULT_PAGE_NUMBER; // Reset to first page
    } else {
      // Normal filter update
      this.isTableFiltered = true;
      const { searchKeyword, fromDate, toDate, exportTypeId, ...tableFilters } = this.allFilters;

      this.allFilters = {
        ...tableFilters,
        ...filters,
      };
    }
    this.loadData();
    if (isReset) {
      setTimeout(() => {
        this.isResetting = false;
      }, 500);
    }
  }

  preparePayload() {
    return {
      pageIndex: this.pageNumber,
      pageSize: this.pageSize,
      ...this.allFilters,
    };
  }
  mapFiltersToApiKeys(filters: any): PendingRequestsFiltersForm {
    const mapped: any = {};

    // Only include properties that have truthy values
    if (filters.foundation || filters.foundationId)
      mapped.foundationId = filters.foundation?.id || filters.foundation || filters.foundationId;
    if (filters.status) mapped.statusId = filters.status;
    if (filters.priority || filters.priorityId)
      mapped.priorityId = filters.priority?.id || filters.priority || filters.priorityId;
    if (filters.requestType || filters.requestTypeId)
      mapped.requestTypeId =
        filters.requestType?.id || filters.requestType || filters.requestTypeId;
    if (filters.consultantId || filters.consultant)
      mapped.consultantId = filters.consultantId || filters.consultant?.id || filters.consultant;
    if (filters.nextStep) mapped.nextStepTitle = filters.nextStep;
    if (filters.searchKeyword) mapped.searchKeyword = filters.searchKeyword;
    if (filters.proposal) mapped.exportTypeId = filters.proposal;
    if (filters.from) mapped.fromDate = filters.from;
    if (filters.to) mapped.toDate = filters.to;

    return mapped;
  }
  loadData() {
    // Capture current state at the time of call, not after debounce delay
    const currentFilters = { ...this.allFilters };
    const currentPageNumber = this.pageNumber;
    const currentPageSize = this.pageSize;

    this.loadDataSubject.next({
      filters: currentFilters,
      pageNumber: currentPageNumber,
      pageSize: currentPageSize,
    });
  }
  private performLoadData(filters: any, pageNumber: number, pageSize: number) {
    const payload = {
      pageIndex: pageNumber,
      pageSize: pageSize,
      ...filters,
    };
    const { pageIndex, pageSize: size, ...filtersData } = payload;
    const mappedFilters = this.mapFiltersToApiKeys(filtersData);

    // Reset totalElements and items when starting a new data load to avoid showing stale data
    this.totalElements = 0;
    this.items = [];
    this.isLoading = true;

    // Increment request ID to track which response is current
    this.currentRequestId++;
    const requestId = this.currentRequestId;

    // Cancel any pending requests
    this.pendingDataRequest$.next();

    this.managePendingTransactionsService.requestsService
      .getPendingRequestsList({ pageIndex, pageSize: size }, mappedFilters)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.pendingDataRequest$),
        tap((res) => {
          // Only update if this is still the current request
          if (requestId === this.currentRequestId) {
            this.items = res.data;
            this.totalElements = res.totalCount;
          }
        }),
        catchError((err) => {
          this.isError = true;
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

  pageChanged(event: any) {
    // Only reload if page index or size actually changed
    if (this.pageNumber !== event.pageIndex || this.pageSize !== event.pageSize) {
      this.pageNumber = event.pageIndex;
      this.pageSize = event.pageSize;
      this.loadData();
    }
  }
  // onSortChange(e: { key: string; direction: 'asc' | 'desc' }) {
  //   this.sortKey = e.key;
  //   this.sortDirection = e.direction;
  //   this.loadData();
  // }

  onFilter(text: string) {
    this.filterText = text;
    this.pageNumber = 0;
    this.loadData();
  }
  Edit(data: PendingRequest) {
    if (data.isExportDocument) {
      //It is exported document
      this.router.navigate(['imports-exports', data.id, 'export']);
      return;
    }

    //It is imported document
    /*  if (element.status !== RequestStatus.Initiated) {
      this.toastr.error(
        this.translateService.instant(
          'ImportsExportsModule.ImportsExportsListComponent.canotEditImportedDocument'
        )
      );
      return;
    } */

    this.router.navigate(['imports-exports', data.id, 'import']);
  }
  View(data: PendingRequest) {
    let url = `/${RouteConstants.PendingRequest}/${data.id}`;
    this.router.navigate([`/${RouteConstants.PendingRequest}/${data.id}`]);
    // window.location.href = `/${RouteConstants.PendingRequest}/${data.id}`;
  }
}
