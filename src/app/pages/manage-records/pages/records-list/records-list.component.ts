import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { SortDirection } from '@angular/material/sort';
import { forkJoin, Observable, Subscription, tap } from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ManageRecordsService } from '@pages/manage-records/services/manage-records.service';
import {
  AllRecords,
  CommitteeIds,
  Record,
  RecordMembersRealTime,
  RecordsFiltersForm2,
  TableRecord,
} from '@core/models/record.model';
import { ExportableDocumentActionType } from '@core/enums/exportable-document-action-type.enum';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { Clipboard } from '@angular/cdk/clipboard';
import { ViewNoteModalComponent } from '@pages/manage-records/components/view-note-modal/view-note-modal.component';
import { environment } from '@env/environment';
import { AbstractTable } from '@core/abstract-classes/abstract-table.abstract';
import { QueryUrlFiltersPaginationSort } from '@core/abstract-classes/query-url-filters.abstract';
import { RecordsFiltersComponent } from '@pages/manage-records/components/records-filters/records-filters.component';
import { Priority } from '@core/models/priority.model';
import { Classification } from '@core/models/classification.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { OrganizationUnit } from '@core/models/organization-unit.model';
import { AuthorizationPopupComponent } from '@shared/new-components/authorization-popp/authorization-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { AuthService } from '@core/services/auth/auth.service';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-records-list',
  templateUrl: './records-list.component.html',
  styleUrls: ['./records-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RecordsListComponent extends AbstractTable implements OnInit, OnDestroy {
  recordsSource: TableRecord[] = [];
  isTableFiltered: boolean = false;
  isLoadingTable: boolean = true;
  @ViewChild('outerTabGroup', { read: ElementRef })
  outerTabGroupRef!: ElementRef;
  @ViewChild('tableList') tableListComponent: any; // Reference to table-list component
  viewAllElements: boolean = false;
  filtersData: RecordsFiltersForm2 = {} as RecordsFiltersForm2;
  public ExportableDocumentActionType = ExportableDocumentActionType;
  currentTab: 'Finance' | 'Preparatory' = 'Finance';
  currenActivetTab: 'details' | 'signatures' = 'details';
  urlChangeObservable = new Subscription();
  mainActiveTab = 0;
  private filtersDialogRef: MatDialogRef<RecordsFiltersComponent> | null = null;
  private globalClickUnlisten: (() => void) | null = null;
  readonly dropDownProperties = ['id', 'title', 'titleEn'];
  prioritiesList: Priority[] = [];
  viewMode: 'activeRecords' | 'allRecords' = 'activeRecords';
  destroyRef = inject(DestroyRef);
  constructor(
    private dialog: MatDialog,
    private manageRecordsService: ManageRecordsService,
    private router: Router,
    private location: Location,
    private clipboard: Clipboard,
    private toastr: CustomToastrService,
    private activatedRoute: ActivatedRoute,
    private queryUrlFiltersPaginationSort: QueryUrlFiltersPaginationSort,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
    private manageImportsExportsService: ManageImportsExportsService,
    injector: Injector,
    private translateService: TranslateService,
    private authService: AuthService,
    private manageSharedService: ManageSharedService
  ) {
    super(injector);
  }
  // organizationUnitsList: OrganizationUnit[] = [];
  ngOnInit(): void {
    this.activatedRoute.snapshot.routeConfig?.path?.includes('active')
      ? (this.viewMode = 'activeRecords')
      : (this.viewMode = 'allRecords');

    this.pageSize = 20;
    this.urlChangeObservable = this.queryUrlFiltersPaginationSort.initializeFiltersObservable(this);

    const committeeIds = this.activatedRoute.snapshot.queryParamMap.get('committeeIds'); // Get 'id'
    if (!committeeIds) {
      this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
        {
          propertyName: 'committeeIds',
          propertyValue: [
            environment.financeCommitteeId,
            environment.coordinatingCommitteeId,
            // environment.preparatoryCommitteeId,
          ],
        },
        // {
        //   propertyName: 'isExported',
        //   propertyValue: false,
        // },
        { propertyName: 'pageSize', propertyValue: 20 },
        {
          propertyName: 'currentMainTab',
          propertyValue: 'activeRecords',
        },
      ]);
    }
    // this.manageImportsExportsService.organizationUnitsService
    //   .getOrganizationUnitsList(
    //     {
    //       pageSize: 100,
    //       pageIndex: 0,
    //     },
    //     {
    //       type: OrganizationUnitType.Committee,
    //     }
    //   )
    //   .subscribe({
    //     next: (res) => {
    //       this.organizationUnitsList = res.data;
    //     },
    //   });
    this.initRealTime();
    this.getList();
    this.manageSharedService.searchFormValue
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filters: any) => {
        this.filtersData = filters;
        this.onFiltersChange(filters);
      });
  }

  ngOnDestroy() {
    this.urlChangeObservable.unsubscribe();
  }

  initializeTable(): Observable<AllRecords> {
    this.isLoadingTable = true;

    return this.manageRecordsService.recordsService
      .getRecordsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoadingTable = false;

          this.recordsSource = res.data;
          this.length = res.totalCount;
        })
      );
  }

  addCustomClassToFirstTab() {
    const header = this.outerTabGroupRef.nativeElement.querySelector('mat-tab-header');
    if (header) {
      this.renderer.addClass(header, 'mainTabHeader');
      // You can add more styles here if needed
    }
  }

  ngAfterViewInit() {}
  getList() {
    forkJoin({
      priorities: this.manageRecordsService.prioritiesService.getPrioritiesList(
        { pageSize: 50, pageIndex: 0 },
        undefined,
        undefined,
        ['id', 'title', 'titleEn']
      ),

      classifications: this.manageRecordsService.classificationsService.getClassificationsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        this.dropDownProperties
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.prioritiesList = results.priorities.data;
        this.classificationsList = results.classifications.data;
        this.initializeColumnConfig();
        this.initializeColumns();
      });
  }
  override setFiltersFromUrl(queryParams: any): void {
    this.filtersData = {};

    if (queryParams.currentTab) {
      this.currentTab = queryParams.currentTab;
    }

    if (queryParams.searchKeyword) {
      this.filtersData.searchKeyword = queryParams.searchKeyword;
    }

    if (queryParams.committeeIds) {
      this.filtersData.committeeIds =
        typeof queryParams.committeeIds === 'string'
          ? [queryParams.committeeIds]
          : queryParams.committeeIds;
    } else {
      // Set default committeeIds if not in URL
      if (this.currentTab === 'Finance') {
        this.filtersData.committeeIds = [
          environment.financeCommitteeId,
          environment.coordinatingCommitteeId,
        ];
      } else if (this.currentTab === 'Preparatory') {
        this.filtersData.committeeIds = [environment.preparatoryCommitteeId];
      }
    }

    if (queryParams.priorityId) {
      this.filtersData.priorityId = queryParams.priorityId;
    }

    if (queryParams.classificationId) {
      this.filtersData.classificationId = queryParams.classificationId;
    }

    if (queryParams.isInitiated) {
      this.filtersData.isInitiated = queryParams.isInitiated === 'true' ? true : false;
    }

    if (queryParams.isExported) {
      this.filtersData.isExported = queryParams.isExported === 'true' ? true : false;
    } else if (this.viewMode === 'activeRecords') {
      // Set default isExported to true for activeRecords view
      this.filtersData.isExported = false;
    }

    if (queryParams.currentMainTab == 'activeRecords') {
      this.mainActiveTab = 0;
    } else {
      this.mainActiveTab = 1;
    }
  }

  onTableFilterChanged(filters: RecordsFiltersForm2) {
    const mappedFilters = this.mapFiltersToApiFormat(filters);
    this.filtersData = { ...this.filtersData, ...mappedFilters };
    this.onFiltersChange(this.filtersData);
  }
  clicked = false;
  onOpenSearch(event) {
    if (this.filtersDialogRef) {
      return;
    }
    this.clicked = true;
    const svgRect = (event.target as HTMLElement).getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const dialogWidth = 23.625 * rem;
    let top = svgRect.bottom + window.scrollY;
    let left = svgRect.left + window.scrollX + svgRect.width / 2 - dialogWidth / 2;
    this.filtersDialogRef = this.dialog.open(RecordsFiltersComponent, {
      // height: '500px',
      width: '23.625rem',
      hasBackdrop: false,
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
      disableClose: false,
      panelClass: 'filters-dialog-panel',

      data: {
        lang: this.lang,
        filtersData: this.filtersData,
        prioritiesList: this.prioritiesList,

        organizationUnitsList: this.organizationUnitsList,
        classificationsList: this.classificationsList,
        currentTab: this.currentTab,
        viewMode: this.viewMode,
      },
    });

    this.filtersDialogRef.afterOpened().subscribe(() => {
      const dialogComponent = this.filtersDialogRef!.componentInstance;
      dialogComponent.filtersChange.subscribe((dialogFilters: RecordsFiltersForm2) => {
        this.onFiltersChange(dialogFilters);
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
          const ngSelectDropdown = document.querySelector('.ng-dropdown-panel');
          const trigger = event.target as HTMLElement;

          if (
            (dialogOverlay && dialogOverlay.contains(evt.target as Node)) ||
            (datepickerPopup && datepickerPopup.contains(evt.target as Node)) ||
            (ngSelectDropdown && ngSelectDropdown.contains(evt.target as Node)) ||
            trigger.contains(evt.target as Node)
          ) {
            // Do nothing, click is inside dialog, popup, dropdown, or trigger
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

  /**
   * Map filter values from component format to API format
   * Handles both form field names and object values
   */
  private mapFiltersToApiFormat(filters: any): RecordsFiltersForm2 {
    const mapped: RecordsFiltersForm2 = {};
    // Transform field names and extract IDs from objects
    if (filters?.committeeIds) {
      mapped.committeeIds = filters.committeeIds;
    } else if (filters?.committee) {
      // Handle table filter which sends 'committee' field
      mapped.committeeIds = Array.isArray(filters?.committee)
        ? filters?.committee
        : [filters?.committee];
    }

    // Priority: can be object or string
    if (filters?.priority) {
      mapped.priorityId =
        typeof filters?.priority === 'object' ? filters?.priority.id : filters?.priority;
    } else if (filters?.priorityId) {
      mapped.priorityId = filters?.priorityId;
    }

    // Classification: can be object or string
    if (filters?.classification) {
      mapped.classificationId =
        typeof filters.classification === 'object'
          ? filters.classification.id
          : filters.classification;
    } else if (filters?.classificationId) {
      mapped.classificationId = filters.classificationId;
    }

    // Direct passthrough for these fields
    if (filters?.searchKeyword) {
      mapped.searchKeyword = filters.searchKeyword;
    }

    if (
      filters?.isInitiated !== undefined &&
      filters?.isInitiated !== null &&
      filters?.isInitiated !== ''
    ) {
      mapped.isInitiated = filters.isInitiated;
    }

    if (
      filters?.isExported !== undefined &&
      filters?.isExported !== null &&
      filters?.isExported !== ''
    ) {
      mapped.isExported = filters.isExported;
    }

    return mapped;
  }

  onFiltersChange(filtersData: RecordsFiltersForm2): void {
    const isReset = Object.keys(filtersData).length === 0;
    if (isReset) {
      this.isTableFiltered = false;
    } else {
      this.isTableFiltered = true;
    }
    // Map filters from component format to API format
    this.filtersData = this.mapFiltersToApiFormat(filtersData);

    // Only apply default committeeIds if user didn't select a specific committee
    if (!this.filtersData.committeeIds || this.filtersData.committeeIds.length === 0) {
      // Use default committeeIds based on current tab
      if (this.currentTab === 'Finance') {
        this.filtersData.committeeIds = [
          environment.financeCommitteeId,
          environment.coordinatingCommitteeId,
        ];
      } else if (this.currentTab === 'Preparatory') {
        this.filtersData.committeeIds = [environment.preparatoryCommitteeId];
      }
    }

    // Apply default isExported if not explicitly set
    if (this.filtersData.isExported === undefined || this.filtersData.isExported === null) {
      if (this.viewMode === 'activeRecords') {
        this.filtersData.isExported = true;
      }
      // If viewMode is 'allRecords', leave isExported undefined (no filter)
    }

    this.pageIndex = 0;
    this.viewAllElements = false;

    // DON'T update URL on filter changes - just load the data
    // URL updates only happen on pagination, sort, and tab changes
    this.initializeTable().subscribe();
  }

  override onPaginationChange(pageInformation: { pageSize: number; pageIndex: number }): void {
    this.viewAllElements = false;
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'pageSize', propertyValue: pageInformation.pageSize },
      { propertyName: 'pageIndex', propertyValue: pageInformation.pageIndex },
    ]);
  }

  override onSortColumn(sortInformation: { active: string; direction: SortDirection }): void {
    this.viewAllElements = false;
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'sortBy', propertyValue: sortInformation.active },
      { propertyName: 'sortType', propertyValue: sortInformation.direction },
    ]);
  }

  onViewRequestContainerDetails(requestContainerId: string): void {
    if (requestContainerId) {
      this.router.navigate(['transactions', requestContainerId]);
    }
  }
  onViewRecordPDF(id: string): void {
    if (!this.authService.userPermissions.includes(PermissionsObj.ViewRecords)) {
      this.noPermission();
      return;
    }
    if (id) {
      this.router.navigate([id, 'record-file'], {
        relativeTo: this.activatedRoute,
      });
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
  onViewRecordDetails(record: Record): void {
    if (!record.isRestricted) {
      this.router.navigate(['manage-records', record.id]);
    }
  }

  onNavigateBack(): void {
    this.location.back();
  }

  get activeTab() {
    if (this.currentTab === 'Finance') {
      return 0;
    }

    return 1;
  }

  // onChangeMainTab(event: MatTabChangeEvent): void {
  //   if (event.index === 0) {
  //     this.filtersData = {}
  //     this.filtersData.isExported = false
  //     this.filtersData.committeeIds = [
  //       environment.financeCommitteeId,
  //       environment.coordinatingCommitteeId,
  //       environment.preparatoryCommitteeId
  //     ];
  //     // this.pageSize = 1000
  //     this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
  //       {propertyName: 'pageIndex', propertyValue: 0},
  //       {propertyName: 'pageSize', propertyValue: 1000},
  //       {propertyName: 'isExported', propertyValue: false},
  //       {
  //         propertyName: 'currentMainTab',
  //         propertyValue: 'activeRecords',
  //       },
  //       {
  //         propertyName: 'committeeIds',
  //         propertyValue: this.filtersData.committeeIds,
  //       },
  //     ]);
  //   } else if (event.index === 1) {
  //     this.filtersData = {}
  //     if (this.activeTab === 1) this.filtersData.committeeIds = [environment.preparatoryCommitteeId];
  //     else this.filtersData.committeeIds = [
  //       environment.financeCommitteeId,
  //       environment.coordinatingCommitteeId,
  //     ];
  //     delete this.filtersData.isExported;
  //     this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
  //       {propertyName: 'isExported', propertyValue: ''},
  //       {propertyName: 'pageSize', propertyValue: 20},
  //       {
  //         propertyName: 'currentMainTab',
  //         propertyValue: '',
  //       },
  //       {
  //         propertyName: 'committeeIds',
  //         propertyValue: this.filtersData.committeeIds,
  //       }
  //     ]);
  //   }
  //   // this.initializeTable().subscribe()
  // }

  onTabClicked(event: MatTabChangeEvent): void {
    if (event.index === 0) {
      this.currentTab = 'Finance';

      this.filtersData.committeeIds = [
        environment.financeCommitteeId,
        environment.coordinatingCommitteeId,
      ];
    } else if (event.index === 1) {
      this.currentTab = 'Preparatory';
      this.filtersData.committeeIds = [environment.preparatoryCommitteeId];
    }

    // Reinitialize column config to update hasFilter based on current tab
    this.initializeColumnConfig();

    this.viewAllElements = false;
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'pageIndex', propertyValue: 0 },
      {
        propertyName: 'currentTab',
        propertyValue: this.currentTab,
      },
      {
        propertyName: 'committeeIds',
        propertyValue: this.filtersData.committeeIds,
      },
    ]);
  }
  onActiveRecordsTabClicked(event: MatTabChangeEvent) {
    if (event.index === 0) {
      this.currenActivetTab = 'details';
    } else {
      this.currenActivetTab = 'signatures';
    }
  }
  onViewComment(comment: string): void {
    this.dialog.open(ViewNoteModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '800px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: {
        comment,
      },
    });
  }

  onCopyNote(comment: string): void {
    this.clipboard.copy(comment);
    this.toastr.success('Note copied successfully');
  }

  toggleViewAllElementsAction(): void {
    if (this.viewAllElements) {
      //Hide ALL Rows
      this.recordsSource.forEach((element) => {
        if (element.viewExpandedElement) {
          this.view_hide_element(element, true);
        }
      });
      this.viewAllElements = false;
    } else {
      //Show ALL Rows
      this.recordsSource.forEach((element) => {
        if (!element.viewExpandedElement) {
          this.view_hide_element(element, false);
        }
      });
      this.viewAllElements = true;
    }
  }

  override view_hide_element(element: TableRecord, closeOtherRows = true): void {
    if (!element.viewExpandedElement) {
      //Open row details
      element.isLoadingRowDetails = true;
      // this.manageRecordsService.recordsService
      //   .getRecordMembers(element.id)
      //   .subscribe((res) => {
      //
      //     element.recordMembers = res;
      //   });
      element.isLoadingRowDetails = false;
      element.viewExpandedElement = true;

      //Close other rows
      if (closeOtherRows && !this.viewAllElements) {
        this.recordsSource.forEach((ele) => {
          if (ele.id !== element.id) {
            ele.viewExpandedElement = false;
          }
        });
      }
    } else {
      //Close row details
      element.viewExpandedElement = false;
    }
  }

  override check_view_element(element: TableRecord): boolean {
    return element.viewExpandedElement ? true : false;
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['icon', 'title', 'actions'];
    } else {
      if (this.currentTab === 'Preparatory') {
        return [
          'icon',
          'exportNumber',
          'title',
          'committee.title',
          'priority.title',
          'classification.title',
          'isExported',
          'requestContainer.id',
          'actions',
        ];
      }

      return [
        'icon',
        'exportNumber',
        'title',
        'committee.title',
        'priority.title',
        'classification.title',
        'isInitiated',
        'isExported',
        'requestContainer.id',
        'actions',
      ];
    }
  }

  columnsConfig: any[] = [];
  columns: string[] = [];

  classificationsList: Classification[] = [];
  organizationUnitsList = [
    {
      id: 'bfb23c24-c443-43c5-b411-aa5140273e06',
      title: 'اللجنة المالية',
      titleEn: 'Finance Committee',
      committeeSymbol: 'أ',
    },
    {
      id: '5284e50a-ecf2-456d-9483-470beeddb8ea',
      title: 'اللجنة التنسيقية',
      titleEn: 'Coordinating Committee',
      committeeSymbol: 'ب',
    },
  ];
  isInitiatedList = [
    { name: 'shared.yes', id: true },
    { name: 'shared.no', id: false },
  ];
  recordStatusList = [
    { name: 'shared.inactive', id: false },
    { name: 'shared.active', id: true },
  ];

  initializeColumnConfig() {
    this.columnsConfig = [
      {
        label: 'ManageRecordsModule.RecordsListComponent.recordNumber',
        type: 'text',
      },
      {
        label: 'shared.title',
        type: 'text',
      },
      {
        label: 'shared.processType',
        type: 'text',
        arKey: 'committeeSymbol',
        hasFilter: this.currentTab === 'Finance' ? true : false,
        menuData: this.organizationUnitsList,
      },
      {
        label: 'shared.priorities',
        type: 'priorityColors',
        arKey: 'title',
        enKey: 'titleEn',
        hasFilter: true,
        menuData: this.prioritiesList,
      },
      {
        label: 'shared.classification',
        type: 'text',
        arKey: 'title',
        hasFilter: true,
        menuData: this.classificationsList,
      },
      {
        label: 'shared.initiatedSigned',
        type: 'booleanIcon',

        imgSrc: {
          falseVal: 'assets/icons/Status_not_initiated.svg',
          trueVal: 'assets/icons/Status_initiated.svg',
        },
        hasFilter: true,
        menuData: this.isInitiatedList,
      },
      {
        label: 'ManageRecordsModule.RecordsListComponent.recordStatus',
        type: 'booleanText',
        colorCode: { falseColor: '#043049', trueColor: '#4CAF50' },
        title: { falseText: 'غير نشط', trueText: 'نشط' },
        hasFilter: true,
        menuData: this.recordStatusList,
      },

      {
        label: 'shared.container',
        type: 'actions',
        actions: [
          {
            action: 'customImage',
            actionName: 'customImage',
            imgSrc: 'assets/icons/transaction__icon.svg',
            onClick: (element: any) => {
              this.onViewRequestContainerDetails(element.requestContainer.id);
            },
          },
        ],
      },
      {
        label: 'shared.record',
        type: 'actions',
        actions: [
          {
            action: 'customImage',
            actionName: 'customImage',
            imgSrc: 'assets/icons/pdf_icon.svg',
            onClick: (element: any) => {
              this.onViewRecordPDF(element.id);
            },
          },
        ],
      },
      {
        label: 'shared.action',
        type: 'actions',
        actions: [
          {
            action: 'view',
            actionName: 'view',
            onClick: (element: any) => {
              this.onViewRecordDetails(element);
            },
          },
        ],
      },
      {
        iconLabel: 'signatures',
        type: 'actions',
        actions: [
          {
            action: 'expandRow',
            actionName: 'expandRow',
            onClick: (element: any) => {},
          },
        ],
      },
    ];
  }
  initializeColumns() {
    this.columns = [
      'exportNumber',
      'title',
      'committee',
      'priority',
      'classification',
      'isInitiated',
      'isExported',
      'actions',
      'actions2',
      'actions3',
      'actions4',
    ];
  }
  initRealTime(): void {
    this.manageRecordsService.notificationsHubService.registerMethod(
      'RecordReceiver',
      (data: RecordMembersRealTime) => {
        this.recordsSource.forEach((ele) => {
          if (ele.viewExpandedElement && ele.id === data.recordId) {
            for (const member of ele.recordMembers!) {
              if (member.id === data.member.memberId) {
                if (data.member.actionType === null) {
                  member.action = null;
                } else {
                  member.action = {
                    type: data.member.actionType,
                    date: data.member.date,
                    comment: data.member.comment,
                    isPhoneAction: data.member.isPhoneAction,
                  };
                }
              }
            }
          }
        });
      }
    );
  }

  onExportExcel(): void {
    this.toastr.success('جاري التحميل....قد يستغرق عدة دقائق');
    this.manageRecordsService.recordsService
      .exportExcel(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .subscribe();
  }

  protected readonly CommitteeIds = CommitteeIds;

  expand() {
    // Call table-list component's toggleExpandCollapseAll method
    if (this.tableListComponent) {
      this.tableListComponent.toggleExpandCollapseAll();
    }
    // Update viewAllElements flag
    this.viewAllElements = this.tableListComponent?.allRowsExpanded || false;
  }
}
