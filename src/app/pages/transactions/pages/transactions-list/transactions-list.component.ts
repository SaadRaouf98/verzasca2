// (Removed duplicate class/component definition and moved hideTargetedElement into the correct class below)
import { ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import {
  forkJoin,
  Observable,
  Subscription,
  tap,
  debounceTime,
  takeUntil,
  Subject,
  catchError,
  finalize,
} from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

import {
  AllTransactions,
  RequestContainersFiltersForm,
  RequestContainersFiltersForm2,
  Transaction,
} from '@core/models/transaction.model';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { Location } from '@angular/common';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { UpdateAccessibilityModalComponent } from '@pages/transactions/components/update-accessibility-modal/update-accessibility-modal.component';
import { AdvancedSearchModalComponent } from '@pages/transactions/components/advanced-search-modal/advanced-search-modal.component';
import { AdvanedSearchOperator } from '@shared/enums/advanced-search-operator.enum';
import {
  RequestContainerAdvancedSearchResult,
  RequestContainerAdvancedSearchQueryParams,
} from '@core/models/request-container-advance-search.model';
import { AbstractTable } from '@core/abstract-classes/abstract-table.abstract';
import { SortDirection } from '@angular/material/sort';
import { QueryUrlFiltersPaginationSort } from '@core/abstract-classes/query-url-filters.abstract';
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { Entity } from '@core/models/entity.model';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { RouteConstants } from '@core/enums/routes.enum';
import { TableListComponent } from '@shared/new-components/table-list/table-list.component';
import { TransactionsFiltersComponent } from '@pages/transactions/components/transactions-filters/transactions-filters.component';
import { FiltersComponent } from '@features/components/pending-request/pending-request-list/filters/filters.component';
import { FoundationsSearchService } from '@core/services/search-services/foundations-search.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { color } from 'html2canvas/dist/types/css/types/color';
import { AuthService } from '@core/services/auth/auth.service';
import { AuthorizationPopupComponent } from '@shared/new-components/authorization-popp/authorization-popup.component';
import { ManageSharedService } from '@shared/services/manage-shared.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('500ms cubic-bezier(0.4, 0.0, 0.4, 0.0)')),
    ]),
  ],
})
export class TransactionsListComponent
  extends AbstractTable
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('transactionPopup') transactionPopupRef: ElementRef | undefined;
  @ViewChild(FiltersComponent) filtersComponent: FiltersComponent | undefined;
  private intendedPopupPosition: { top: number; left: number } | null = null;
  private popupAdjustmentTimeout: any = null;
  ngAfterViewInit() {
    // If a popup position is pending, adjust it after view init
    if (this.intendedPopupPosition && this.transactionPopupRef) {
      this.adjustPopupPosition();
    }
  }

  private adjustPopupPosition() {
    if (!this.transactionPopupRef || !this.intendedPopupPosition) return;
    // Debounce adjustment
    if (this.popupAdjustmentTimeout) {
      clearTimeout(this.popupAdjustmentTimeout);
    }
    this.popupAdjustmentTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        const popupEl = this.transactionPopupRef!.nativeElement as HTMLElement;
        const popupWidth = popupEl.offsetWidth;
        const popupHeight = popupEl.offsetHeight;
        const padding = 8;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let { top, left } = this.intendedPopupPosition!;
        // Add a small right offset to always show the icon
        left += 20;
        // Prefer showing below, but if not enough space, show above
        let showAbove = false;
        if (top + popupHeight + padding > viewportHeight) {
          // Not enough space below, try above
          if (top - popupHeight - padding > 0) {
            top = top - popupHeight - 40; // 40px extra offset for icon height
            showAbove = true;
          } else {
            // Clamp to bottom
            top = viewportHeight - popupHeight - padding;
          }
        }
        // If popup would be cut off at the top, clamp to top
        if (top < padding) {
          top = padding;
        }
        // Adjust left if overflow right
        if (left + popupWidth + padding > viewportWidth) {
          left = viewportWidth - popupWidth - padding;
        }
        if (left < padding) {
          left = padding;
        }
        // Update the position in the data object
        if (this.transactionTargetedElement && this.transactionTargetedElement.position) {
          this.transactionTargetedElement.position.top = top + 'px';
          this.transactionTargetedElement.position.left = left + 'px';
        }
        this.intendedPopupPosition = null;
      });
    }, 10);
  }
  transactionsSource: Transaction[] = [];
  prioritiesList: Entity[] = [];

  advancedSearchSource: MatTableDataSource<RequestContainerAdvancedSearchResult> =
    new MatTableDataSource<RequestContainerAdvancedSearchResult>([]);
  showAdvancedSearchTable: boolean = false;

  override expandedElement!: Transaction | null;
  RequestContainerStatus = RequestContainerStatus;

  filtersData: RequestContainersFiltersForm2 = {} as RequestContainersFiltersForm2;

  allFilters: RequestContainersFiltersForm2 = {};
  tableFilters: RequestContainersFiltersForm2 = {};
  private isResetting = false;

  PermissionsObj = PermissionsObj;

  override queryParamsMap: any;
  urlChangeObservable = new Subscription();

  ClassificationLevel = ClassificationLevel;
  private filtersDialogRef: MatDialogRef<TransactionsFiltersComponent> | null = null;
  private readonly DEFAULT_PAGE_SIZE = 10;
  private readonly DEFAULT_PAGE_NUMBER = 0;
  isTableFiltered: boolean = false;
  destroyRef = inject(DestroyRef);
  private loadDataSubject = new Subject<{ filters: any; pageNumber: number; pageSize: number }>();
  private pendingDataRequest$ = new Subject<void>();
  private currentRequestId = 0;

  columnsConfig: any[] = [];
  columns: string[] = [];
  isError: boolean = false;
  items: Transaction[] = [];
  nextStepsList: any[] = [];
  pageNumber: number = this.DEFAULT_PAGE_NUMBER;
  totalElements: number = 0;
  RequestContainerStatusArr = [
    {
      id: RequestContainerStatus.Open,
      title: 'TransactionsModule.TransactionsListComponent.open',
    },
    { id: RequestContainerStatus.Held, title: 'shared.held' },
    {
      id: RequestContainerStatus.Scheduled,
      title: 'TransactionsModule.TransactionsListComponent.scheduled',
    },
    {
      id: RequestContainerStatus.Reset,
      title: 'TransactionsModule.TransactionsListComponent.reset',
    },
    {
      id: RequestContainerStatus.Close,
      title: 'TransactionsModule.TransactionsListComponent.close',
    },
    {
      id: RequestContainerStatus.ForceClose,
      title: 'TransactionsModule.TransactionsListComponent.forceClose',
    },
  ];
  private globalClickUnlisten: (() => void) | null = null;
  constructor(
    private dialog: MatDialog,
    private renderer: Renderer2,
    private manageTransactionsService: ManageTransactionsService,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private location: Location,
    private queryUrlFiltersPaginationSort: QueryUrlFiltersPaginationSort,
    injector: Injector,
    private manageImportsExportsService: ManageImportsExportsService,
    private changeDetectorRef: ChangeDetectorRef,
    private manageSharedService: ManageSharedService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // this.urlChangeObservable =
    //   this.queryUrlFiltersPaginationSort.initializeFiltersObservable(this);
    this.initializeTable().subscribe();

    this.getPriorities();

    // Setup debounced load data subject
    this.loadDataSubject
      .pipe(
        debounceTime(300), // Wait 300ms after last emission
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data) => {
        this.performLoadData(data.filters, data.pageNumber, data.pageSize);
      });
  }

  ngOnDestroy() {
    this.urlChangeObservable.unsubscribe();
  }

  override setFiltersFromUrl(queryParams: any): void {
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

    if (queryParams.sector) {
      this.filtersData.sector = {
        id: queryParams.sector.split('#')[0],
        title: queryParams.sector.split('#')[1],
      };
    }

    if (queryParams.priority) {
      this.filtersData.priority = {
        id: queryParams.priority.split('#')[0],
        title: queryParams.priority.split('#')[1],
      };
    }
    if (queryParams.nextStep) {
      //  this.filtersData.nextStep = queryParams.nextStep;
      this.filtersData.nextStep = {
        title: queryParams.nextStep,
      };
    }
    if (queryParams.containerStatus) {
      this.filtersData.containerStatus = parseInt(queryParams.containerStatus.split('#')[0]);
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

  override onPaginationChange(pageInformation: { pageSize: number; pageIndex: number }): void {
    if (
      this.pageIndex === pageInformation.pageIndex &&
      this.pageSize === pageInformation.pageSize
    ) {
      return;
    }

    this.pageIndex = pageInformation.pageIndex;
    this.pageSize = pageInformation.pageSize;

    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'pageSize', propertyValue: pageInformation.pageSize },
      { propertyName: 'pageIndex', propertyValue: pageInformation.pageIndex },
    ]);
    this.loadData();
  }

  override onSortColumn(sortInformation: { active: string; direction: SortDirection }): void {
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'sortBy', propertyValue: sortInformation.active },
      { propertyName: 'sortType', propertyValue: sortInformation.direction },
    ]);
  }

  initializeTable(): Observable<AllTransactions> {
    this.isLoading = true;
    console.log('initializeTable');
    return this.manageTransactionsService.requestContainersService
      .getTransactionsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.allFilters,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.transactionsSource = res.data;
          this.totalElements = res.totalCount;
        })
      );
  }

  private loadData() {
    // Capture current state at the time of call, not after debounce delay
    const currentFilters = { ...this.allFilters };
    const currentPageNumber = this.pageIndex;
    const currentPageSize = this.pageSize;

    this.loadDataSubject.next({
      filters: currentFilters,
      pageNumber: currentPageNumber,
      pageSize: currentPageSize,
    });
  }

  private performLoadData(filters: any, pageNumber: number, pageSize: number) {
    // Reset totalElements and items when starting a new data load to avoid showing stale data
    this.totalElements = 0;
    this.transactionsSource = [];
    this.isLoading = true;

    // Increment request ID to track which response is current
    this.currentRequestId++;
    const requestId = this.currentRequestId;

    // Cancel any pending requests
    this.pendingDataRequest$.next();

    this.manageTransactionsService.requestContainersService
      .getTransactionsList({ pageIndex: pageNumber, pageSize: pageSize }, filters, this.sortData)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.pendingDataRequest$),
        tap((res) => {
          // Only update if this is still the current request
          if (requestId === this.currentRequestId) {
            this.transactionsSource = res.data;
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

  onResetFilters() {
    if (this.isResetting) return;
    this.isTableFiltered = false;
    this.allFilters = {};
    this.filtersData = {};
    this.tableFilters = {};
    this.pageIndex = this.DEFAULT_PAGE_NUMBER;
    this.loadData();
  }

  resetAllFiltersFromDialog() {
    // Emit empty filters through onFiltersChange to properly trigger reset
    // This will set isTableFiltered = false through the onFiltersChange logic
    this.onFiltersChange({} as RequestContainersFiltersForm2);
    // Also reset the app-filters component's internal state
    if (this.filtersComponent) {
      this.filtersComponent.resetAllFilters();
    }
  }

  onFiltersChange(filtersData: RequestContainersFiltersForm2): void {
    if (this.isResetting) return;

    // Handle null or undefined filtersData
    if (!filtersData) {
      filtersData = {};
    }

    // Handle null or undefined allFilters
    if (!this.allFilters) {
      this.allFilters = {};
    }

    // Extract current table filters from allFilters (everything except component filters)
    const {
      autoNumber,
      foundation,
      sector,
      title,
      requestContainerId,
      requests,
      exportableDocuments,
      requestStepContents,
      operator,
      ...currentTableFilters
    } = this.allFilters as any;
    const componentOnlyFilters = {
      autoNumber,
      foundation,
      sector,
      title,
      requestContainerId,
      requests,
      exportableDocuments,
      requestStepContents,
      operator,
    };

    const isReset = Object.keys(filtersData).length === 0;

    if (isReset) {
      this.isResetting = true;
      this.isTableFiltered = false;
      this.filtersData = {};
      this.allFilters = {};
      this.tableFilters = {};
      this.pageIndex = this.DEFAULT_PAGE_NUMBER;
    } else {
      // Normal filter update
      this.isTableFiltered = true;
      this.filtersData = filtersData;
      const {
        autoNumber: a,
        foundation: f,
        sector: s,
        title: t,
        requestContainerId: r,
        requests: req,
        exportableDocuments: e,
        requestStepContents: rst,
        operator: op,
        ...tableFilters
      } = this.allFilters as any;

      this.allFilters = {
        ...tableFilters,
        ...filtersData,
      };
    }
    this.loadData();
    if (isReset) {
      setTimeout(() => {
        this.isResetting = false;
      }, 500);
    }
  }

  onViewElement(elementId: string): void {
    this.router.navigate([`${elementId}`], {
      relativeTo: this.activatedRoute,
    });
  }

  onEditElement(elementId: string): void {
    if (!this.authService.userPermissions.includes(PermissionsObj.ViewRequestContainers)) {
      this.noPermission();
      return;
    }
    this.router.navigate([`${elementId}/edit`], {
      relativeTo: this.activatedRoute,
    });
  }

  onOpenAccessibility(element: Transaction): void {
    this.dialog.open(UpdateAccessibilityModalComponent, {
      minWidth: '62.5rem',
      maxWidth: '62.5rem',
      // maxHeight: '95vh',
      // height: '95vh',
      panelClass: ['action-modal'],
      autoFocus: false,
      disableClose: false,
      data: {
        requestContainerId: element.id,
        users: element.users,
      },
    });
  }

  onDeleteElement(element: Transaction): void {
    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        headerTranslationRef: this.translateService.instant(
          'TransactionsModule.TransactionsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'TransactionsModule.TransactionsListComponent.deleteSectorWarning'
        )}  '${element.title}' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageTransactionsService.requestContainersService
            .deleteTransaction(element.id)
            .subscribe({
              next: (res) => {
                this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));

                this.initializeTable().subscribe();
              },
            });
        },
      },
    });
  }
  clicked = false;
  onOpenSearch(event: MouseEvent): void {
    if (this.filtersDialogRef) {
      return;
    }
    this.clicked = true;
    const svgRect = (event.target as HTMLElement).getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const dialogWidth = 23.625 * rem;
    let top = svgRect.bottom + window.scrollY;
    let left = svgRect.left + window.scrollX + svgRect.width / 2 - dialogWidth / 2;
    this.filtersDialogRef = this.dialog.open(TransactionsFiltersComponent, {
      // height: '450px',
      width: '23.625rem',
      hasBackdrop: false,
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
      disableClose: false,
      panelClass: 'filters-dialog-panel',

      data: { lang: this.lang, filtersData: this.filtersData },
    });

    this.filtersDialogRef.afterOpened().subscribe(() => {
      const dialogComponent = this.filtersDialogRef!.componentInstance;
      dialogComponent.filtersChange.subscribe((dialogFilters: RequestContainersFiltersForm2) => {
        this.onFiltersChange(dialogFilters);
      });
      dialogComponent.resetRequested.subscribe(() => {
        this.resetAllFiltersFromDialog();
      });
    });
    setTimeout(() => {
      const dialogContainer = document.querySelector('.mat-mdc-dialog-container') as HTMLElement;
      if (dialogContainer) {
        const actualWidth = dialogContainer.offsetWidth;
        const actualHeight = dialogContainer.offsetHeight;

        left = svgRect.left + window.scrollX + svgRect.width / 2 - actualWidth / 2;
        dialogContainer.style.left = `${left}px`;
        dialogContainer.style.top = `${top}px`;
      }

      // Listen for clicks outside the dialog
      this.globalClickUnlisten = this.renderer.listen(
        'document',
        'mousedown',
        (evt: MouseEvent) => {
          const dialogOverlay = document.querySelector('.cdk-overlay-container');
          const datepickerPopup = document.querySelector(
            '.mat-datepicker-content, .mat-mdc-datepicker-content'
          );
          const trigger = event.target as HTMLElement;

          if (
            (dialogOverlay && dialogOverlay.contains(evt.target as Node)) ||
            (datepickerPopup && datepickerPopup.contains(evt.target as Node)) ||
            trigger.contains(evt.target as Node)
          ) {
            // Do nothing, click is inside dialog, popup, or trigger
            return;
          }

          // Otherwise, close the dialog
          this.filtersDialogRef?.close();
        }
      );
    });

    this.filtersDialogRef.afterClosed().subscribe(() => {
      this.filtersDialogRef = null;
      this.clicked = false;
      this.changeDetectorRef.detectChanges();
      if (this.globalClickUnlisten) {
        this.globalClickUnlisten();
        this.globalClickUnlisten = null;
      }
    });
  }
  onOpenAdvancedSearch(): void {
    const dialogRef = this.dialog.open(AdvancedSearchModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: false,
      data: {},
    });

    dialogRef.afterClosed().subscribe(
      (dialogResult: {
        statusCode: ModalStatusCode;
        status: string;
        data: {
          autoNumber: string | undefined;
          foundation: string | undefined;
          operator: AdvanedSearchOperator;
          requestContainerId: string | undefined;
          requests: string | undefined;
          exportableDocuments: string | undefined;
          requestStepContents: string | undefined;
          sector: string | undefined;
          title: string | undefined;
        };
      }) => {
        if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
          this.showAdvancedSearchTable = true;
          this.initializeAdvancedSearchTable(dialogResult.data);
        }
      }
    );
  }

  onCancelAdvancedSearch(): void {
    this.showAdvancedSearchTable = false;
    this.pageIndex = 0;

    this.initializeTable().subscribe();
  }

  initializeAdvancedSearchTable(data: RequestContainerAdvancedSearchQueryParams): void {
    this.isLoading = true;

    this.manageTransactionsService.requestContainerAdvancedSearchService
      .getContainersList(data)
      .subscribe({
        next: (res) => {
          this.isLoading = false;

          this.advancedSearchSource = new MatTableDataSource(res);
        },
      });
  }
  getPriorities() {
    forkJoin({
      priorities: this.manageImportsExportsService.prioritiesService.getPrioritiesList(
        { pageSize: 50, pageIndex: 0 },
        undefined,
        undefined,
        ['id', 'title', 'titleEn']
      ),

      currentSteps: this.manageImportsExportsService.requestsService.getCurrentStepsList(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.prioritiesList = results.priorities.data;

        // this.foundationsList = results.foundations.data;
        this.nextStepsList = results.currentSteps;
        this.initializeColumnConfig();
        this.initializeColumns();
      });
  }

  onNavigateBack(): void {
    this.location.back();
  }

  onGoToDetails(element: Transaction): void {
    if (element.isRestricted) {
      return;
    }
    this.router.navigate([`${element.id}`], {
      relativeTo: this.activatedRoute,
    });
  }

  onRightClick(element: Transaction): void {
    if (element.isRestricted) {
      return;
    }
    window.open(`/transactions/${element.id}`, '_blank');
  }

  override view_hide_element(element: Transaction): void {
    if (!element) {
      this.expandedElement = null;
    }
    if (!element.isRestricted) {
      if (this.expandedElement == element) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['transactionNumber', 'actions', 'dislayDetails'];
    } else {
      return [
        'transactionNumber',
        'title',
        'nextStep.title',
        'priority.title',
        'containerStatus',
        'creditsRequestedAmount',
        'duration',
        'actions',
        'dislayDetails',
      ];
    }
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
  /***************** start of changes****************** */

  initializeColumnConfig() {
    this.columnsConfig = [
      {
        label: 'shared.transactionNum',
        type: 'text',
      },
      {
        label: 'shared.title',
        type: 'text',
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
        label: 'shared.priority',
        type: 'priorityColors',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.prioritiesList,
      },
      {
        label: 'TransactionsModule.TransactionsListComponent.transactionStatus',
        type: 'RequestContainerStatus',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.RequestContainerStatusArr,
      },
      {
        label: 'TransactionsModule.TransactionsListComponent.requiredAmount',
        type: 'text',
      },
      {
        label: 'TransactionsModule.TransactionsListComponent.durationPeriod',
        type: 'chart',
        arKey: 'days',
        enKey: 'days',
        color: 'color',
      },
      {
        label: 'shared.action',
        type: 'actions',
        actions: [
          {
            action: 'accessibility',
            actionName: 'accessibility',
            Permission: PermissionsObj.UpdateRequestContainerAccessibility,
            classificationLevel: ClassificationLevel.Restricted,
            onClick: (element: any) => {
              this.onOpenAccessibility(element);
            },
          },
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
              this.onEditElement(element.id);
            },
          },
        ],
      },
      {
        label: '# ',
        type: 'actions',
        actions: [
          {
            action: 'customhover',
            actionName: 'customhover',
            // Remove onClick: use direct template event binding for hover popup
          },
        ],
      },
    ];
  }
  initializeColumns() {
    this.columns = [
      'transactionNumber',
      'title',
      'nextStep',
      'priority',
      'containerStatus',
      'creditsRequestedAmount',
      'duration',
      'actions',
      'actions2',
    ];
  }
  onTableFilterChanged(filters: any) {
    // Extract current table filters from allFilters (everything except component filters)
    const {
      autoNumber,
      foundation,
      sector,
      title,
      requestContainerId,
      requests,
      exportableDocuments,
      requestStepContents,
      operator,
      ...currentTableFilters
    } = this.allFilters as any;
    const componentOnlyFilters = {
      autoNumber,
      foundation,
      sector,
      title,
      requestContainerId,
      requests,
      exportableDocuments,
      requestStepContents,
      operator,
    };

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

      // Merge component filters with the remaining table filters and map table field names
      this.tableFilters = filters;
      this.allFilters = {
        ...componentOnlyFilters,
        ...this.tableFilters,
        // Map table field names to form field names
        ...(filters.priorityId && { priority: filters.priorityId }),
        ...(filters.foundationId && { foundation: filters.foundationId }),
      } as RequestContainersFiltersForm2;
      this.isTableFiltered = Object.keys(filters).length > 0;
    } else {
      // New filters are being added
      this.isTableFiltered = true;
      this.tableFilters = {
        ...this.tableFilters,
        ...filters,
        // Map table field names to form field names
        ...(filters.priorityId && { priority: filters.priorityId }),
        ...(filters.foundationId && { foundation: filters.foundationId }),
      };
      this.allFilters = { ...this.allFilters, ...this.tableFilters };
    }

    this.pageIndex = this.DEFAULT_PAGE_NUMBER; // Reset to first page when filters change
    this.loadData();
  }
  pageChanged(event: any) {
    if (this.pageIndex !== event.pageIndex || this.pageSize !== event.pageSize) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
      this.loadData();
    }
  }

  showTransactionElement: boolean = false;
  transactionTargetedElement: Transaction;
  private hidePopupTimeout: any;
  private isMouseOverPopup = false;

  showTargetedElement(event: MouseEvent, data: Transaction, i?: number, column?: string) {
    if (this.hidePopupTimeout) {
      clearTimeout(this.hidePopupTimeout);
    }
    let top: number, left: number;
    const popupWidth = 450; // Estimate or set a max width for the popup
    const popupHeight = 250; // Estimate or set a max height for the popup
    const padding = 8;
    if (event && event.target && (event.target as HTMLElement).getBoundingClientRect) {
      const iconRect = (event.target as HTMLElement).getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      // Align popup's left edge with icon's right edge for a clear right offset
      let tryLeft = iconRect.right + 8; // 8px gap to the right of the icon
      // Clamp left/right to viewport
      const minLeft = padding;
      const maxLeft = viewportWidth - popupWidth - padding;
      left = Math.max(minLeft, Math.min(tryLeft, maxLeft));
      // Prefer below icon, else above (relative to viewport)
      let belowTop = iconRect.bottom;
      let aboveTop = iconRect.top - popupHeight;
      // If enough space below, show below
      if (belowTop + popupHeight <= viewportHeight) {
        top = belowTop;
      } else if (aboveTop >= 0) {
        // Else if enough space above, show above
        top = aboveTop;
      } else {
        // Not enough space above or below: overlap icon, anchor to whichever edge is closer
        if (viewportHeight - belowTop > iconRect.top) {
          // More space below, anchor below (may overflow viewport)
          top = belowTop;
        } else {
          // More space above, anchor above (may overflow viewport)
          top = aboveTop;
        }
      }
      // Clamp top and bottom so popup is never cut off at the top or bottom of the viewport
      top = Math.max(padding, top);
      top = Math.min(top, viewportHeight - popupHeight - padding);
    } else if (
      data.position &&
      data.position.top !== undefined &&
      data.position.left !== undefined
    ) {
      top =
        typeof data.position.top === 'string' ? parseFloat(data.position.top) : data.position.top;
      left =
        typeof data.position.left === 'string'
          ? parseFloat(data.position.left)
          : data.position.left;
    } else {
      top = scrollY + window.innerHeight / 2 - popupHeight / 2;
      left = scrollX + window.innerWidth / 2 - popupWidth / 2;
    }
    data.position = {
      top: top + 'px',
      left: left + 'px',
    };
    this.showTransactionElement = true;
    this.transactionTargetedElement = data;
    this.changeDetectorRef.detectChanges();
  }

  onPopupMouseEnter() {
    this.isMouseOverPopup = true;
    if (this.hidePopupTimeout) {
      clearTimeout(this.hidePopupTimeout);
    }
  }

  onPopupMouseLeave() {
    this.isMouseOverPopup = false;
    this.hideTargetedElement();
  }

  hideTargetedElement() {
    if (this.hidePopupTimeout) {
      clearTimeout(this.hidePopupTimeout);
    }
    this.hidePopupTimeout = setTimeout(() => {
      if (!this.isMouseOverPopup) {
        this.showTransactionElement = false;
        this.transactionTargetedElement = undefined;
        this.changeDetectorRef.detectChanges();
      }
    }, 200); // 200ms delay to allow mouse to move between icon and popup
  }
  noPermission() {
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
  View(data: Transaction) {
    let url = `/${RouteConstants.Transactions}/${data.id}`;
    this.router.navigateByUrl(url);
  }
}
