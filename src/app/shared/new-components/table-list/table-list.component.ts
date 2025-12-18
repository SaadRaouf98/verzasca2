import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnDestroy,
  OnChanges,
  ChangeDetectorRef,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
  MatPaginatorIntl,
} from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, fromEvent, Subject } from 'rxjs';
import {
  CommonModule,
  DatePipe,
  JsonPipe,
  NgClass,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { RouterLink } from '@angular/router';
import { ActionModel } from '@core/interfaces/action.interface';
import { mapTo } from '@shared/helpers/shared.helper';
import { Events } from '@core/enums/events.enum';
import { Colors } from '@core/enums/colors.enum';
import { Actions } from '@core/enums/actions.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { PendingRequestsFiltersForm } from '@core/models/pending-request.model';
import { PriorityColorPipe } from '@shared/pipes/priorityColor.pipe';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { RequestStatus, RequestStatusTranslationMap } from '@core/enums/request-status.enum';
import { PercentGaugeChart } from '@shared/components/percent-gauge-chart/percent-gauge.component';
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { NgxPermissionsModule } from 'ngx-permissions';
import { StylePaginatorDirective } from './style-paginator.directive';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ExportableDocumentActionType } from '@core/enums/exportable-document-action-type.enum';
import { SuccessModalComponent } from '@shared/components/success-modal/success-modal.component';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [
    PriorityColorPipe,
    CommonModule,
    NgFor,
    NgIf,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    FormsModule,
    ReactiveFormsModule,
    PercentGaugeChart,
    TranslateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatRadioModule,
    DatePipe,
    NgxPermissionsModule,
    StylePaginatorDirective,
  ],
})
export class TableListComponent {
  ExportableDocumentActionType = ExportableDocumentActionType;
  RequestStatusTranslationMap = RequestStatusTranslationMap;
  @Output() customHoverShow = new EventEmitter<{
    event: MouseEvent;
    element: any;
    i: number;
    column: string;
  }>();
  @Output() customHoverHide = new EventEmitter<void>();
  hasOpenLinkAction(actions: any[]): boolean {
    if (!actions) return false;
    return actions.some((action) => action?.action === 'OPENLINK');
  }
  @ViewChild('table', { read: ElementRef }) public matTableRef!: ElementRef;
  serviceDetailForm!: FormGroup;
  @Input() columns: any;
  @Input() isError: any = false;
  @Input() isLoading: any = false;
  skeletonArray = new Array(10);
  @Input() customMessage!: string;
  @Input() columnsConfig: any;
  @Input() loadData: any;
  @Input() actions: ActionModel[] = [];
  @Input() className = '';
  @Input() set totalElements(value: number) {
    this._totalElements = value;
    // Recalculate total pages
    this.totalPages = Math.ceil(this._totalElements / this.pageSize);
    // Update paginator if available
    this.updatePaginatorState();
  }
  get totalElements(): number {
    return this._totalElements;
  }
  private _totalElements: number = 0;
  @Input() showPagination: boolean = false;
  @Input() set pageIndex(value: number) {
    this._pageIndex = value;
    this.currentPage = value;
    // Update paginator if available
    this.updatePaginatorState();
  }
  get pageIndex(): number {
    return this._pageIndex;
  }
  private _pageIndex: number = 0;
  @Input() pageSize: number = 15;
  @Input() sortDisabled: boolean = false;
  @Input() useScroll: boolean = false;
  @Output() serviceRowSelect = new EventEmitter<any>();
  @Output() selectPage = new EventEmitter<any>();
  @Output() rowClicked = new EventEmitter<any>();
  @Output() autoCompleteValueSelected = new EventEmitter<any>();
  @Output() selectValueSelected = new EventEmitter<any>();
  @Output() sortChanged = new EventEmitter<Sort>();
  @Output() inputCellChanged = new EventEmitter<any>();
  @Output() pageScroll = new EventEmitter<any>();
  @Output() toggleChanged = new EventEmitter<any>();
  @Output() eventClicked = new EventEmitter<any>();
  public dataSource = new MatTableDataSource<any>();
  expandedElement: any | null = null;
  expandedRows = new Set<any>(); // Track multiple expanded rows
  allRowsExpanded: boolean = false; // Track if all rows are expanded
  @Output() filterChanged = new EventEmitter<PendingRequestsFiltersForm>();
  @ViewChild('tableSort') tableSort = new MatSort();
  @ViewChild('paginator') paginator?: MatPaginator;
  localControl = new FormControl();
  ClassificationLevel = ClassificationLevel;
  lang: string = '';
  spans = [];
  ctrl = new FormControl();
  ExportedDocumentType = ExportedDocumentType;
  RequestContainerStatus = RequestContainerStatus;
  selectedOption = '';
  // protected readonly translate = translate;
  protected readonly Actions = Actions;
  private unSubscribe = new Subject();

  // Arrow positioning cleanup
  private arrowObserver?: MutationObserver;
  private arrowMenuWatch?: MutationObserver;
  private arrowResizeObserver?: ResizeObserver;
  private scrollListener?: (e: Event) => void;
  private resizeListener?: (e: Event) => void;
  private menuClickListener?: (e: Event) => void; // Separate listener for menu clicks
  private arrowUpdateTimeout?: any; // Debounce timer
  private arrowMap = new Map<HTMLElement, SVGSVGElement>(); // Maps menu panel to arrow
  private arrowContainer?: HTMLElement; // Container for arrows
  private lastVisiblePanels: Set<HTMLElement> = new Set(); // Track which panels were visible last time
  private updateInProgress = false; // Prevent concurrent updates
  private paginatorUpdateTimeout: any; // Debounce timer for paginator updates
  @Input() hasPaginator = false;
  @Input() currentPage = 0;
  @Output() pageChange = new EventEmitter<any>();
  @Output() checkedData = new EventEmitter<any>();
  totalPages: number = 0;
  SelectedID: string = null;
  private currentFilters = {};
  @Input() set resetTableFilters(value: boolean) {
    if (value === true) {
      this.currentFilters = {};
      this.selectedOption = '';
      this.cdr.markForCheck();
    }
  }
  constructor(
    public dialog: MatDialog,
    public translateService: TranslateService,
    private paginatorIntl: MatPaginatorIntl,
    public cdr: ChangeDetectorRef
  ) {}
  ngOnChanges(changes: SimpleChanges) {
    // ngOnChanges is still called but input changes are now handled by setters
    // This keeps compatibility with any direct property assignments
  }

  private updatePaginatorState() {
    // Debounce multiple rapid calls (when both pageIndex and totalElements change)
    clearTimeout(this.paginatorUpdateTimeout);

    this.paginatorUpdateTimeout = setTimeout(() => {
      if (this.paginator) {
        // Store current page for event
        // const previousPageIndex = this.paginator.pageIndex;

        // Update paginator's internal state
        this.paginator.length = this._totalElements;
        this.paginator.pageIndex = this.currentPage;
        this.paginator.pageSize = this.pageSize;

        // Trigger change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();

        // Always emit page event so the StylePaginatorDirective updates
        // The parent component should guard against duplicate loads
        // if (this.paginator.length > 0 && this.hasPaginator) {
        //   try {
        //     // Try to emit the page event (Material paginator has a method for this)
        //     if ((this.paginator as any)['_emitPageEvent']) {
        //       (this.paginator as any)['_emitPageEvent'](previousPageIndex);
        //     }
        //   } catch (e) {
        //     // If that doesn't work, just trigger change detection again
        //     this.cdr.detectChanges();
        //   }
        // }
      }
    }, 0);
  }

  @Input() set keyWord(value: string) {
    this.applyFilter(value);
  }
  PermissionsObj = PermissionsObj;
  _rows: any;

  get rows(): any {
    return this._rows;
  }

  @Input() set rows(value: any) {
    this._rows = value;
    this.dataSource = new MatTableDataSource(this.rows);
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.pageChange.emit({
      pageSize: this.pageSize,
      pageIndex: this.currentPage,
    });
  }

  ngOnInit() {
    // this.paginatorIntl.itemsPerPageLabel = this.translateService.instant(
    //   'assets.itemsPerPage'
    // );
  }

  ngAfterViewInit() {
    // this.tableSort.disableClear = true;
    // this.tableSort.disabled = this.sortDisabled;
    this.dataSource.sort = this.tableSort;
    //this.dataSource.paginator = this.paginator;
    this.handleScroll();
    // Enhanced arrow positioning with debouncing to prevent freezing
    this.setupArrowPositioning();
  }

  private setupArrowPositioning() {
    // Clean up previous observers first
    this.cleanupArrowObservers();

    // Create container
    this.arrowContainer = document.getElementById('table-menu-arrows');
    if (!this.arrowContainer) {
      this.arrowContainer = document.createElement('div');
      this.arrowContainer.id = 'table-menu-arrows';
      document.body.appendChild(this.arrowContainer);
    }

    // Update function - only position existing arrows
    const updateArrowPositions = () => {
      if (this.updateInProgress) return;
      this.updateInProgress = true;

      try {
        const menuPanels = document.querySelectorAll('.mat-mdc-menu-panel.customPosition');

        // Update positions only
        menuPanels.forEach((panelEl: Element) => {
          const panel = panelEl as HTMLElement;
          const rect = panel.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;

          if (isVisible && !this.arrowMap.has(panel)) {
            // Create arrow only if not exists
            const svg = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'svg'
            ) as SVGSVGElement;
            svg.setAttribute('width', '26');
            svg.setAttribute('height', '12');
            svg.setAttribute('viewBox', '0 0 26 12');
            svg.style.cssText = 'position: fixed; z-index: 10001; pointer-events: none;';

            const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            use.setAttributeNS(
              'http://www.w3.org/1999/xlink',
              'xlink:href',
              'assets/icons/sprite.svg#dialog-arrow'
            );
            svg.appendChild(use);
            this.arrowContainer!.appendChild(svg);
            this.arrowMap.set(panel, svg);
          }

          // Update position
          if (isVisible) {
            const arrow = this.arrowMap.get(panel);
            if (arrow) {
              arrow.style.top = rect.top - 12 + 'px';
              arrow.style.left = rect.left + rect.width / 2 - 13 + 'px';
              arrow.style.display = 'block';
            }
          }
        });

        // Hide and remove arrows for panels that no longer exist or are hidden
        const panelsToRemove: HTMLElement[] = [];
        this.arrowMap.forEach((arrow, panel) => {
          // Check if panel is still in DOM (can be in overlay container)
          const overlayContainer = document.querySelector('.cdk-overlay-container');
          const isInDOM =
            document.body.contains(panel) || (overlayContainer && overlayContainer.contains(panel));

          // If panel not in DOM, remove arrow immediately
          if (!isInDOM) {
            if (arrow && arrow.parentNode) {
              arrow.remove();
            }
            panelsToRemove.push(panel);
          }
        });
        panelsToRemove.forEach((panel) => this.arrowMap.delete(panel));
      } finally {
        this.updateInProgress = false;
      }
    };

    // Throttled update
    const throttledUpdate = () => {
      clearTimeout(this.arrowUpdateTimeout);
      this.arrowUpdateTimeout = setTimeout(() => {
        updateArrowPositions();
      }, 100);
    };

    // ONLY use scroll and resize events - NO MutationObserver
    // Scroll listener
    let scrollTimeout: any;
    this.scrollListener = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        updateArrowPositions();
      }, 50);
    };
    document.addEventListener('scroll', this.scrollListener, true);

    // Resize listener
    this.resizeListener = () => {
      throttledUpdate();
    };
    window.addEventListener('resize', this.resizeListener);

    // Watch for menu panel removal from overlay container - use this to detect both open and close
    const overlayContainer = document.querySelector('.cdk-overlay-container');
    if (overlayContainer) {
      this.arrowMenuWatch = new MutationObserver(() => {
        // Use throttled update to debounce multiple mutations
        throttledUpdate();
      });
      this.arrowMenuWatch.observe(overlayContainer, {
        childList: true,
        subtree: false, // Only watch direct children
      });
    }

    // Click outside to close menus - trigger update after a small delay to let menu close animation complete
    this.menuClickListener = () => {
      setTimeout(() => {
        updateArrowPositions();
      }, 150);
    };
    document.addEventListener('mouseup', this.menuClickListener);

    // Initial update
    updateArrowPositions();
  }

  /**
   * Properly clean up all observers and event listeners to prevent memory leaks
   * Called on component destroy and before re-setup on route navigation
   */
  private cleanupArrowObservers() {
    // Clear pending timeout
    clearTimeout(this.arrowUpdateTimeout);
    this.arrowUpdateTimeout = undefined;

    // Disconnect mutation observers
    this.arrowObserver?.disconnect();
    this.arrowMenuWatch?.disconnect();
    this.arrowResizeObserver?.disconnect();

    // Remove event listeners
    if (this.scrollListener) {
      document.removeEventListener('scroll', this.scrollListener, true);
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.menuClickListener) {
      document.removeEventListener('mouseup', this.menuClickListener);
    }

    // Clear arrow map and container reference
    this.arrowMap.clear();
    this.lastVisiblePanels.clear();
    this.arrowContainer = undefined;

    // Clear references
    this.arrowObserver = undefined;
    this.arrowMenuWatch = undefined;
    this.arrowResizeObserver = undefined;
    this.scrollListener = undefined;
    this.resizeListener = undefined;
    this.menuClickListener = undefined;
  }

  isSubTitleString(columnIndex: number): boolean {
    return typeof this.columnsConfig[columnIndex]?.subTitle === 'string';
  }

  isSubTitleArray(columnIndex: number): boolean {
    return Array.isArray(this.columnsConfig[columnIndex]?.subTitle);
  }
  applyFilter(keyWord: string) {
    this.dataSource.filter = keyWord;
  }

  truncateName(text: string) {
    if (text) {
      let characters = text.match(/\b(\w)/g);
      if (characters) {
        return characters.join('');
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  sortChange(sortState: Sort) {
    const data = this.dataSource.data.slice();
    if (!sortState.active || sortState.direction === '') {
      this.dataSource.data = data;
      return;
    }
    this.sortChanged.emit(sortState);
  }

  mapText(path: string, source: any) {
    return mapTo(path, source);
  }

  getSlaColor(min: number, max: number): string {
    const slaColor = min >= max ? Colors.RED : Colors.GREEN;
    return slaColor;
  }

  truncateText(text: string | null | undefined, maxLength: number = 90): string {
    if (!text) return '-';
    const str = String(text);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  isTextTruncated(text: string | null | undefined, maxLength: number = 90): boolean {
    if (!text) return false;
    const str = String(text);
    return str.length > maxLength;
  }

  getFullText(text: string | null | undefined): string {
    return text ? String(text) : '-';
  }

  handlePageEvent(e: PageEvent) {
    this.selectPage.emit({ pageSize: e.pageSize, pageIndex: e.pageIndex });
  }

  allocate(row: any) {
    this.eventClicked.emit(row);
  }

  toggleValueChange(e: any, element?: any) {
    this.toggleChanged.emit({ e, element });
  }
  getCellValue(i: number, column: string, element: any): any {
    const config = this.columnsConfig[i];
    if (config.arKey) {
      if (this.translateService.currentLang === 'ar') {
        return this.mapText(config.arKey, element[column]);
      } else {
        return this.mapText(config.enKey, element[column]);
      }
    } else if (element[column]) {
      return element[column];
    } else {
      return '-';
    }
  }
  ngOnDestroy() {
    this.unSubscribe.next;
    this.unSubscribe.complete();
    // Clean up arrow positioning observers to prevent memory leaks
    this.cleanupArrowObservers();
  }

  getRowSpan(col: any, index: any) {
    return this.spans[index] && this.spans[index][col];
  }

  parseInt(value: string) {
    return parseInt(value);
  }

  private handleScroll() {
    fromEvent(this.matTableRef.nativeElement, Events.SCROLL)
      .pipe(debounceTime(200))
      .subscribe((e: any) => this.onTableScroll(e));
  }

  private onTableScroll(e: any): void {
    const tableViewHeight = e.target.offsetHeight; // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight; // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled
    const scrollDownLimit = tableScrollHeight - tableViewHeight;
    const isScrollingVertically = e.target.scrollHeight > e.target.offsetHeight;
    if (isScrollingVertically && scrollLocation + 2 > scrollDownLimit) {
      this.pageScroll.emit(true);
    }
  }

  getMenuItemLabel(item: any): string {
    if (typeof item === 'string') {
      return item;
    }
    if ('committeeSymbol' in item) {
      return item.committeeSymbol;
    }
    if ('title' in item) {
      return item.title;
    }
    if ('name' in item) {
      return item.name;
    }
    return '';
  }

  isLastColumnMenu(columnIndex: number): boolean {
    // Find the last columnsConfig that has menuData
    for (let i = this.columnsConfig.length - 1; i >= 0; i--) {
      if (this.columnsConfig[i]?.menuData) {
        return columnIndex === i;
      }
    }
    return false;
  }

  onFilterSelect(key: keyof PendingRequestsFiltersForm, item: any) {
    this.selectedOption = typeof item === 'object' && 'id' in item ? item.id : item;

    const keyMapping: Record<string, string> = {
      mainConsultant: 'consultantId',
      requestType: 'requestTypeId',
      priority: 'priorityId',
      foundation: 'foundationId',
      foundations: 'foundationId',
    };

    // Transform the key if mapping exists, otherwise use original key
    const filterKey = keyMapping[key as string] || key;

    // If the selected option is empty (meaning "All" was selected), remove the filter key
    if (
      this.selectedOption === '' ||
      this.selectedOption === null ||
      this.selectedOption === undefined
    ) {
      delete this.currentFilters[filterKey];
    } else {
      // Otherwise, update the current filters object by adding/changing the selected filter
      this.currentFilters = {
        ...this.currentFilters,
        [filterKey]: this.selectedOption,
      };
    }
    // Emit all accumulated filters
    this.filterChanged.emit(this.currentFilters);
  }

  getSlectedFilterskey(key: string): boolean {
    const keyMapping: Record<string, string> = {
      mainConsultant: 'consultantId',
      requestType: 'requestTypeId',
      priority: 'priorityId',
      foundation: 'foundationId',
      foundations: 'foundationId',
    };
    const filterKey = keyMapping[key as string] || key;
    return (
      filterKey in this.currentFilters &&
      this.currentFilters[filterKey] !== null &&
      this.currentFilters[filterKey] !== undefined &&
      this.currentFilters[filterKey] !== ''
    );
  }

  getCustomPages(): (number | string)[] {
    const pages: (number | string)[] = [];
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first 5 pages
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      // Add ellipsis if needed
      if (this.currentPage + 1 > 5 && this.currentPage + 1 < this.totalPages - 1) {
        pages.push('...');
        pages.push(this.currentPage);
        pages.push('...');
      } else {
        pages.push('...');
      }
      // Always show last page
      pages.push(this.totalPages);
    }
    return pages;
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.pageChanged({
      pageIndex: page,
      pageSize: this.pageSize,
      length: this.totalElements, // Add this line
    });
  }
  formatExportFoundations(exportFoundations: { id: string; title: string }[]) {
    if (!exportFoundations || exportFoundations.length === 0) {
      return '';
    }
    return exportFoundations.map((ele) => ele.title).join(' ,');
  }
  get computedDataSource(): any[] {
    return this.isLoading ? [] : this.rows || [];
  }
  trackByIndex(index: number): number {
    return index;
  }
  selectedElements: any[] = [];
  isAllSelected() {
    return this.selectedElements.length === this.rows.length;
  }
  isSomeSelected() {
    return this.selectedElements.length > 0;
  }
  masterToggle() {
    if (this.isAllSelected()) {
      this.selectedElements = [];
    } else {
      this.selectedElements = [...this.rows.map((row) => row.id)];
    }
    this.checkedData.emit(this.selectedElements);
  }
  checkIsSelected(element): boolean {
    return this.selectedElements.includes(element);
  }
  onChange($event, element) {
    if ($event.checked && !this.selectedElements.includes(element)) {
      this.selectedElements.push(element.id);
    } else {
      const index = this.selectedElements.indexOf(element);
      if (index > -1) {
        this.selectedElements.splice(index, 1);
      }
    }
    this.checkedData.emit(this.selectedElements);
  }

  actionSelected(event: MouseEvent, action, element) {
    this.SelectedID = this.SelectedID == element.id ? null : element.id;
    element.show = this.SelectedID ? true : false;

    // Determine a stable element to measure. Prefer currentTarget (the element
    // the listener is bound to). If unavailable, fall back to the event target
    // but climb to a sensible ancestor (button, svg, or action-trigger) so we
    // don't measure inner <use> or text nodes which can return incorrect rects.
    const rawTarget = event.target as HTMLElement | null;
    const current = (event.currentTarget as HTMLElement) || rawTarget;

    let anchor: HTMLElement | null = null;
    try {
      if (current) {
        anchor =
          (current.closest?.(
            'button, [data-action-trigger], .action-trigger, svg'
          ) as HTMLElement) || current;
      }
    } catch (e) {
      anchor = current || rawTarget;
    }

    const elementToMeasure = anchor || rawTarget || (document.documentElement as HTMLElement);
    let svgRect = elementToMeasure.getBoundingClientRect();

    // Fallback: when the measured rect is empty (width/height 0) or contains
    // NaN values (can happen for text nodes or SVG <use> elements), use the
    // mouse event coordinates to compute a stable position instead.
    if (
      !svgRect ||
      (svgRect.width === 0 && svgRect.height === 0) ||
      isNaN(svgRect.left) ||
      isNaN(svgRect.top)
    ) {
      const ev = event as MouseEvent;
      const clientX = ev.clientX || (ev as any).pageX || 0;
      const clientY = ev.clientY || (ev as any).pageY || 0;

      // Use client coords with small offsets so the menu doesn't overlay the cursor
      svgRect = {
        top: clientY,
        left: clientX,
        width: 0,
        height: 0,
        bottom: clientY,
        right: clientX,
        x: clientX,
        y: clientY,
        toJSON: () => ({}),
      } as DOMRect;
    }

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
    const dialogWidth = 34.875 * rem;
    // Conservative estimated menu height (px). If your menus are taller, increase this.
    const estimatedMenuHeight = 300;

    // Compute preferred position: below the anchor (offset -40). If not enough space
    // below, flip above the anchor so the menu remains visible.
    let preferredTop = svgRect.top - 40;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    if (preferredTop + estimatedMenuHeight > viewportHeight - 8) {
      // Not enough space below; position above anchor
      preferredTop = svgRect.top - estimatedMenuHeight - 8;
    }

    // Clamp top to viewport bounds
    // Calculate position relative to the scrolling table container when possible
    let top: number;
    let left: number;
    const tableEl =
      this.matTableRef && this.matTableRef.nativeElement
        ? (this.matTableRef.nativeElement as HTMLElement)
        : null;
    if (tableEl) {
      // Get table viewport rect and scroll offset
      const tableRect = tableEl.getBoundingClientRect();
      const tableScrollTop = tableEl.scrollTop || 0;
      const tableScrollLeft = tableEl.scrollLeft || 0;

      // Anchor position relative to table content: distance from table top + scrolled amount
      const anchorRelativeTop = svgRect.top - tableRect.top + tableScrollTop - 40; // -40 offset keeps menu below anchor
      const anchorRelativeLeft = svgRect.left - tableRect.left + tableScrollLeft + 42;

      // Clamp within table content bounds
      const minTop = 8;
      const maxTop = Math.max(minTop, tableEl.scrollHeight - estimatedMenuHeight - 8);
      top = Math.max(minTop, Math.min(anchorRelativeTop, maxTop));

      const minLeft = 8;
      const maxLeft = Math.max(minLeft, tableRect.width - dialogWidth - 8);
      left = Math.max(minLeft, Math.min(anchorRelativeLeft, maxLeft));
    } else {
      // Fallback to viewport/document calculation
      let desiredTop = svgRect.top + (window.scrollY || window.pageYOffset || 0) - 40;
      const pageTopLimit = (window.scrollY || window.pageYOffset || 0) + 8;
      const pageBottomLimit =
        (window.scrollY || window.pageYOffset || 0) +
        (window.innerHeight || document.documentElement.clientHeight) -
        estimatedMenuHeight -
        8;
      top = Math.max(pageTopLimit, Math.min(desiredTop, Math.max(pageTopLimit, pageBottomLimit)));

      let desiredLeft = svgRect.left + (window.scrollX || window.pageXOffset || 0) + 42;
      const pageLeftLimit = (window.scrollX || window.pageXOffset || 0) + 8;
      const pageRightLimit =
        (window.scrollX || window.pageXOffset || 0) +
        (window.innerWidth || document.documentElement.clientWidth) -
        dialogWidth -
        8;
      left = Math.max(
        pageLeftLimit,
        Math.min(desiredLeft, Math.max(pageLeftLimit, pageRightLimit))
      );
    }

    element.position = { top: `${top}px`, left: `${left}px` };
    event.stopPropagation();
    action?.onClick(element);
  }
  statusClass = '';
  onStatusChange(event: any, element?) {
    element.statusClass = event;
  }

  // Returns true if columnsConfig has a 'view' or 'openLink' action
  get hasViewAction(): boolean {
    return this.columnsConfig?.some(
      (col) =>
        col.type === 'actions' &&
        col.actions?.some((a) => a.action === 'view' || a.action === 'openLink')
    );
  }

  // Handles row click: if 'view' or 'openLink' action exists, call its handler, else emit rowClicked
  handleRowClick(row: any) {
    // Don't allow navigation for restricted elements
    if (row?.isRestricted) {
      return;
    }

    if (this.hasViewAction) {
      // Search through ALL action columns to find the one with 'view' or 'openLink' action
      for (const col of this.columnsConfig) {
        if (col.type === 'actions' && Array.isArray(col.actions)) {
          const actionToExecute = col.actions.find(
            (a) => a.action === 'view' || a.action === 'openLink'
          );
          if (actionToExecute && typeof actionToExecute.onClick === 'function') {
            actionToExecute.onClick(row);
            return;
          }
        }
      }
    }
    this.clickRow(row);
  }
  clickRow(row: any) {
    this.rowClicked.emit(row);
  }

  // Toggle row expansion - allows multiple rows to be expanded
  toggleRowExpansion(element: any): void {
    if (this.expandedRows.has(element)) {
      this.expandedRows.delete(element);
    } else {
      this.expandedRows.add(element);
    }
    this.cdr.markForCheck();
  }

  // Check if a row is expanded
  isRowExpanded(element: any): boolean {
    return this.expandedRows.has(element);
  }

  // Expand all rows
  expandAllRows(): void {
    if (this.rows && this.rows.length > 0) {
      this.rows.forEach((row: any) => {
        this.expandedRows.add(row);
      });
      this.allRowsExpanded = true;
      this.cdr.markForCheck();
    }
  }

  // Collapse all rows
  collapseAllRows(): void {
    this.expandedRows.clear();
    this.allRowsExpanded = false;
    this.cdr.markForCheck();
  }

  // Toggle expand/collapse all rows
  toggleExpandCollapseAll(): void {
    if (this.allRowsExpanded) {
      this.collapseAllRows();
    } else {
      this.expandAllRows();
    }
  }
  showComment(comment: string) {
    const dialogRef = this.dialog.open(SuccessModalComponent, {
      minWidth: '31.25rem',
      maxWidth: '31.25rem',
      panelClass: 'action-modal',
      autoFocus: false,
      disableClose: false,
      data: {
        title: 'shared.comment',
        content: comment,
      },
    });
  }
  // Check if table has expandable rows
  hasExpandableRows(): boolean {
    return this.columnsConfig && this.columnsConfig.some((col) => col.type === 'expandable');
  }
}
