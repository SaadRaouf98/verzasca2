import { trigger, state, style, transition, animate } from '@angular/animations';
import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Subscription, BehaviorSubject } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';

import { Observable, switchMap, tap, timer, debounceTime, distinctUntilChanged } from 'rxjs';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import {
  AllRegularReports,
  HolderRegularReport,
  RegularReport,
} from '@core/models/regular-report.model';
import { ManageRegularReportsService } from '@pages/regular-reports/services/manage-regular-reports.service';
import { RegularReportBoardType } from '@core/enums/regular-report-board-type.enum';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ViewImageModalComponent } from '@shared/components/view-image-modal/view-image-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ReportLogsDialogComponent } from '@pages/regular-reports/components/report-logs-dialog/report-logs-dialog.component';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CdkTree, FlatTreeControl } from '@angular/cdk/tree';
import { ArrayDataSource } from '@angular/cdk/collections';
import { mapTo } from 'rxjs/operators';
import { PDFSource } from 'ng2-pdf-viewer';
import { DomSanitizer } from '@angular/platform-browser';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddReportFolderDialogComponent } from '@pages/regular-reports/components/add-report-folder-dialog/add-report-folder-dialog.component';
import { Title } from 'chart.js';
import { DeletePopupComponent } from '@shared/new-components/delete-popup/delete-popup.component';
import { data } from 'jquery';
import { AuthorizationPopupComponent } from '@shared/new-components/authorization-popp/authorization-popup.component';
import { MoveReportDialogComponent } from '@pages/regular-reports/components/move-report/move-report-dialog.component';
import { REPORT_PERIOD_OPTIONS } from '@core/enums/report-period-type.enum';
import { CustomToastrService } from '@core/services/custom-toastr.service';

/** Flat node with expandable and level information */
interface flatNodeItem {
  expandable: boolean;
  title: string;
  level: number;
  id: string;
}

@Component({
  selector: '' + 'app-regular-reports-list',
  templateUrl: './regular-reports-list.component.html',
  styleUrls: ['./regular-reports-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    // animate tree nodes when they are inserted/removed (enter/leave)
    trigger('treeNodeAnim', [
      transition(':enter', [
        style({ height: 0, opacity: 0, transform: 'translateY(-6px)' }),
        animate('200ms ease-out', style({ height: '*', opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ height: 0, opacity: 0, transform: 'translateY(-6px)' })),
      ]),
    ]),
  ],
})
export class RegularReportsListComponent implements OnDestroy {
  reportsHolders: HolderRegularReport[] = [];
  documentsSource: MatTableDataSource<RegularReport> = new MatTableDataSource<RegularReport>([]);
  selectedID: string;
  parentId: string | null = null;
  isAsc: boolean = true;
  isGettingAllReports: boolean = true;
  showDetails: boolean = false;
  pageIndex: number = 0;
  searchForm: FormGroup;
  pageSize: number = 20;
  length: number = 100000;
  pageEvent!: PageEvent;
  isLoading: boolean = true;
  isLoadingChildren: boolean = false;
  isLoadingForViewPdf: boolean = false;
  reportPeriodOptions = REPORT_PERIOD_OPTIONS;
  selectedItemInfo: RegularReport;
  isLoadingReport: boolean = false;
  sortData: {
    sortBy: string;
    sortType: SortDirection;
  } = {
    sortBy: '',
    sortType: '',
  };
  sortDirection: 'asc' | 'desc' = 'asc';
  exportableDocument: {
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    fileBlob: Blob | undefined;
  } = {
    pdfSrc: undefined,
    fileBlob: undefined,
  };
  expandedElement!: RegularReport | null;
  RegularReportBoardType = RegularReportBoardType;
  directoryName: string = '';

  // Store expansion state
  private expandingNodeId: string | null = null;
  private preventScroll: boolean = false;
  private isUpdatingData: boolean = false;
  private previousSearchValue: string = '';

  treeControl = new FlatTreeControl<flatNodeItem>(
    (node) => node.level,
    (node) => node.expandable
  );

  private _transformer = (node: RegularReport, level: number) => {
    return {
      expandable: !!node.hasChildren,
      title: node.title,
      level: level,
      id: node.id,
      children: node.children,
      parentId: node.parentId,
      boardType: node.boardType,
      isActive: node.isActive,
      contentType: node.contentType,
      data: node.date,
      periodType: node.periodType,
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  lang: string = 'ar';
  PermissionsObj = PermissionsObj;
  searchKeyword: string = null;

  setSort() {
    this.isAsc = !this.isAsc;
    this.initializePageFolders().subscribe();
  }

  constructor(
    private manageRegularReportsService: ManageRegularReportsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private router: Router,
    private location: Location,
    private matDialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private manageTransactionsService: ManageTransactionsService
  ) {}

  initForm() {
    this.searchForm = new FormGroup({
      searchKeyword: new FormControl(null, [Validators.required]),
    });
  }

  private expansionSubscription?: Subscription;
  private readonly _loadedNodeIds = new Set<string>();

  ngOnInit(): void {
    this.initForm();

    this.activatedRoute.queryParams
      .pipe(
        tap((params: Params) => {
          this.parentId = params['parentId'];
          this.directoryName = params['name'];
        }),
        switchMap(() => {
          if (this.parentId) {
            return this.initializePageFiles();
          }
          return this.initializePageFolders();
        })
      )
      .subscribe();

    // Add debounce to search keyword for auto-search
    this.searchForm
      .get('searchKeyword')
      .valueChanges.pipe(
        debounceTime(500),
        tap((value) => {
          // Skip if value hasn't actually changed from what was last processed
          const currentValue = value ? value.trim() : '';
          if (currentValue === this.previousSearchValue) {
            return;
          }
          this.previousSearchValue = currentValue;

          // Only search if value is not empty and at least 2 characters
          if (value && value.trim().length >= 2) {
            this.submitSearch();
          } else if (!value || value.trim().length === 0) {
            // Reset search if empty
            this.reset();
          }
        })
      )
      .subscribe();

    this.expansionSubscription = this.treeControl.expansionModel.changed.subscribe((change) => {
      // Only process expansions when we're not updating data
      if (this.isUpdatingData) return;

      for (const flatNode of change.added) {
        try {
          const id = (flatNode as any).id as string;

          // Set expanding node id
          this.expandingNodeId = id;

          // Avoid re-loading the same node
          if (this._loadedNodeIds.has(id)) {
            this.expandingNodeId = null;
            continue;
          }

          const nested = this.findNodeById(id);
          if (!nested) {
            this.expandingNodeId = null;
            continue;
          }

          // If children already loaded, skip
          if (nested.children && nested.children.length) {
            this._loadedNodeIds.add(id);
            this.expandingNodeId = null;
            continue;
          }

          this._loadedNodeIds.add(id);
          this.parentId = id;
          this.preventScroll = true;

          this.initializePageFiles(true).subscribe({
            next: () => {
              this.expandingNodeId = null;
              this.preventScroll = false;
            },
            error: (err) => {
              console.error('Error loading children for', id, err);
              this._loadedNodeIds.delete(id);
              this.expandingNodeId = null;
              this.preventScroll = false;
            },
          });
        } catch (e) {
          console.error('Error handling expansion change', e);
          this.expandingNodeId = null;
          this.preventScroll = false;
        }
      }
    });
  }

  submitSearch() {
    this.showDetails = false; // Clear PDF display details
    this.exportableDocument = { pdfSrc: undefined, fileBlob: undefined }; // Clear PDF display
    this.initializePageFolders().subscribe();
  }

  initializePageFolders() {
    this.isLoading = true;
    this.sortData.sortBy = 'date';
    this.sortData.sortType = this.isAsc ? 'asc' : 'desc';
    return this.manageRegularReportsService.regularReportsService
      .getRegularReportsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        { searchKeyword: this.searchForm.controls['searchKeyword'].value },
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this._loadedNodeIds.clear();
          this.dataSource.data = res.data;
          this.length = res.totalCount;
          this.changeDetectorRef.markForCheck();
        })
      );
  }

  toggleActiveStatus(report: RegularReport): void {
    let message = !report.isActive
      ? 'RegularReportsModule.AddRegularReportComponent.activationPopupMessage'
      : 'RegularReportsModule.AddRegularReportComponent.deactivationPopupMessage';
    let title = !report.isActive
      ? 'RegularReportsModule.AddRegularReportComponent.activationPopupTitle'
      : 'RegularReportsModule.AddRegularReportComponent.deactivationPopupTitle';
    const filtersDialogRef = this.matDialog.open(DeletePopupComponent, {
      data: {
        title: this.translateService.instant(title),
        message: this.translateService.instant(message),
        Feedback: true,
        isTextCenter: true,
      },
      disableClose: true,
    });

    filtersDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.isLoading = true;
        this.manageRegularReportsService.regularReportsService
          .toggleActiveStatus(report.id)
          .subscribe({
            next: () => {
              report.isActive = !report.isActive;
              this.toastr.success(
                this.translateService.instant(
                  report.isActive ? 'تم التفعيل بنجاح' : 'تم إلغاء التفعيل بنجاح'
                )
              );
              this.isLoading = false;
            },
          });
      }
    });
  }

  initializePageFiles(skipLoader: boolean = false) {
    if (!skipLoader) {
      this.isLoading = true;
    } else {
      this.isLoadingChildren = true;
    }

    this.sortData.sortBy = 'date';
    this.sortData.sortType = this.isAsc ? 'asc' : 'desc';

    const customHeaders = skipLoader ? new HttpHeaders({ 'X-Skip-Loader': 'true' }) : undefined;

    return this.manageRegularReportsService.regularReportsService
      .getRegularReportsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        { parentId: this.parentId },
        this.sortData,
        undefined,
        customHeaders
      )
      .pipe(
        tap((res) => {
          const sortedChildren = (res.data || []).slice().sort((a, b) => {
            if (
              a.boardType === this.RegularReportBoardType.Holder &&
              b.boardType !== this.RegularReportBoardType.Holder
            ) {
              return -1;
            }
            if (
              a.boardType !== this.RegularReportBoardType.Holder &&
              b.boardType === this.RegularReportBoardType.Holder
            ) {
              return 1;
            }
            return 0;
          });

          if (skipLoader && this.parentId) {
            this.updateNodeChildren(this.parentId, sortedChildren);
          } else if (!skipLoader && this.parentId) {
            this.dataSource.data = sortedChildren;
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          } else {
            this.dataSource.data = sortedChildren;
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          }

          this.length = res.totalCount;
        })
      );
  }

  onNavigateBack(): void {
    this.pageIndex = 0;
    this.location.back();
  }

  view_hide_element(element: RegularReport) {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  check_view_element(element: RegularReport): boolean {
    return this.expandedElement === element;
  }

  private updateNodeChildren(parentId: string, newChildren: RegularReport[]): void {
    // Set updating flag to prevent expansion changes during update
    this.isUpdatingData = true;

    // Get scroll position before any changes
    const scrollContainer = document.querySelector('.fixed_height') as HTMLElement;
    const scrollTopBefore = scrollContainer ? scrollContainer.scrollTop : 0;

    // Find and update the parent node
    const updateParent = (nodes: RegularReport[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === parentId) {
          nodes[i].children = newChildren;
          nodes[i].hasChildren = newChildren && newChildren.length > 0;
          return true;
        }

        if (nodes[i].children && nodes[i].children.length > 0) {
          if (updateParent(nodes[i].children as RegularReport[])) {
            return true;
          }
        }
      }
      return false;
    };

    if (!updateParent(this.dataSource.data)) {
      console.warn('Parent node not found:', parentId);
      this.isLoadingChildren = false;
      this.isUpdatingData = false;
      return;
    }

    // Instead of replacing the entire array, we need to update the tree in a way that doesn't clear expansion
    // The key is to use a technique that doesn't replace the array reference
    this.updateTreeDataWithoutResetting();

    // Restore scroll position
    if (scrollContainer) {
      setTimeout(() => {
        scrollContainer.scrollTop = scrollTopBefore;
      }, 10);
    }

    this.isLoadingChildren = false;
    this.isUpdatingData = false;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Update tree data without resetting expansion state
   * This is a workaround for MatTreeFlatDataSource which clears expansion when data changes
   */
  private updateTreeDataWithoutResetting(): void {
    // Store current expansion state
    const expandedNodes = new Set<string>();
    try {
      // Get all expanded nodes
      for (const node of this.treeControl.dataNodes) {
        if (this.treeControl.isExpanded(node)) {
          expandedNodes.add((node as any).id);
        }
      }
    } catch (e) {
      console.error('Error getting expanded nodes:', e);
    }

    // Get the current data
    const currentData = this.dataSource.data;

    // Update the tree flattener manually
    // This is a hack to refresh the tree without clearing expansion
    // We create a new array reference but preserve expansion
    this.dataSource.data = currentData.map((node) => ({ ...node }));

    // Restore expansion after the tree is updated
    setTimeout(() => {
      try {
        for (const id of expandedNodes) {
          const node = this.treeControl.dataNodes.find((n) => (n as any).id === id);
          if (node && !this.treeControl.isExpanded(node)) {
            // Use a small delay to ensure the node exists in the DOM
            setTimeout(() => {
              if (node && !this.treeControl.isExpanded(node)) {
                this.treeControl.expand(node);
              }
            }, 0);
          }
        }
      } catch (e) {
        console.error('Error restoring expansions:', e);
      }
    }, 50);
  }

  ngOnDestroy(): void {
    this.expansionSubscription?.unsubscribe();
  }

  private findNodeById(id: string): RegularReport | undefined {
    const stack: RegularReport[] = [...this.dataSource.data];
    while (stack.length) {
      const node = stack.shift() as RegularReport;
      if (!node) continue;
      if (node.id === id) return node;
      if (node.children && (node.children as RegularReport[]).length) {
        stack.unshift(...(node.children as RegularReport[]));
      }
    }
    return undefined;
  }

  private findPathToNode(
    nodes: RegularReport[],
    targetId: string | undefined,
    path: string[] = []
  ): string[] | null {
    if (!targetId) return null;
    for (const n of nodes || []) {
      const newPath = [...path, n.id];
      if (n.id === targetId) return newPath;
      if (n.children && (n.children as RegularReport[]).length) {
        const res = this.findPathToNode(n.children as RegularReport[], targetId, newPath);
        if (res) return res;
      }
    }
    return null;
  }

  findRootId(nodeId: string): string | undefined {
    for (const root of this.dataSource.data) {
      if (root.id === nodeId) return root.id;
      if (this.nodeContainsId(root, nodeId)) return root.id;
    }
    return undefined;
  }

  private nodeContainsId(node: RegularReport, id: string): boolean {
    if (!node.children) return false;
    for (const child of node.children as RegularReport[]) {
      if (child.id === id) return true;
      if (this.nodeContainsId(child, id)) return true;
    }
    return false;
  }

  getBGColor(rootId?: string) {
    if (!rootId) return { background: 'transparent' };
    return { background: '#F5F5F5', 'margin-bottom': '0' };
  }

  getGroupColor(rootId?: string) {
    return this.getBGColor(rootId);
  }

  private _rootClassCache = new Map<string, string>();

  private safeClassSuffix(id: string | undefined): string {
    if (!id) return 'unknown';
    return id.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  }

  private rootClassFor(rootId?: string): string {
    if (!rootId) return 'rr-group-unknown';
    if (!this._rootClassCache.has(rootId)) {
      this._rootClassCache.set(rootId, `rr-group-${this.safeClassSuffix(rootId)}`);
    }
    return this._rootClassCache.get(rootId)!;
  }

  nodeClasses(flatNode: any): Record<string, boolean> {
    const classes: Record<string, boolean> = {};
    try {
      const id = flatNode.id as string;
      const level = flatNode.level as number;
      classes['rr-root'] = level === 0;
      classes['rr-child'] = level > 0;

      const rootId = this.findRootId(id);
      const groupClass = this.rootClassFor(rootId);
      classes[groupClass] = true;

      if (this.isFirstInGroup(id)) classes['rr-first'] = true;
      if (this.isLastInGroup(id)) classes['rr-last'] = true;
    } catch (e) {
      // ignore
    }
    return classes;
  }

  private isFirstInGroup(nodeId: string): boolean {
    const dataNodes = this.treeControl.dataNodes;
    const idx = dataNodes.findIndex((n) => (n as any).id === nodeId);
    if (idx === -1) return false;
    if (idx === 0) return true;
    const rootId = this.findRootId(nodeId);
    const prevRoot = this.findRootId((dataNodes[idx - 1] as any).id);
    return prevRoot !== rootId;
  }

  private isLastInGroup(nodeId: string): boolean {
    const dataNodes = this.treeControl.dataNodes;
    const idx = dataNodes.findIndex((n) => (n as any).id === nodeId);
    if (idx === -1) return false;
    if (idx === dataNodes.length - 1) return true;
    const rootId = this.findRootId(nodeId);
    const nextRoot = this.findRootId((dataNodes[idx + 1] as any).id);
    return nextRoot !== rootId;
  }

  openReportDialog(document: RegularReport) {
    this.matDialog.open(ReportLogsDialogComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '75vw',
      minHeight: '55vh',
      maxHeight: '95vh',
      autoFocus: false,
      disableClose: true,
      panelClass: ['action-modal', 'float-footer'],
      data: {
        id: document.id,
      },
    });
  }

  onViewFile(document: RegularReport): void {
    if (document.contentType === '.pdf') {
      this.isLoadingForViewPdf = true;
      this.manageRegularReportsService.regularReportsService
        .viewReportByPath(document.id)
        .subscribe((res) => {
          this.isLoadingForViewPdf = false;
        });
    } else if (
      document.contentType === '.jpg' ||
      document.contentType === '.jpeg' ||
      document.contentType === '.png' ||
      document.contentType === '.gif'
    ) {
      this.manageRegularReportsService.regularReportsService.getFile(document.id).subscribe({
        next: (res) => {
          const blobUrl = URL.createObjectURL(res);
          window.open(blobUrl, '_blank');
        },
      });
    }
  }

  loadFile(node: RegularReport): void {
    if (!this.authService.userPermissions.includes(PermissionsObj.ViewRegularReports)) {
      this.noPermission();
      return;
    }
    if (node.boardType !== RegularReportBoardType.File) return;

    this.isLoadingReport = true;
    this.selectedID = node.id;

    let observ$: Observable<Blob> = new Observable();

    if (node.id) {
      observ$ = this.manageRegularReportsService.regularReportsService.viewReportByPath(node.id);
    }

    observ$.subscribe({
      next: (blobFile) => {
        this.exportableDocument.fileBlob = blobFile;

        this.exportableDocument.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(blobFile)
        );
        this.showDetails = true;
        this.selectedItemInfo = node;

        this.isLoadingReport = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastr.error('عفوا هذا الملف غير موجود');
        }
        this.isLoadingReport = false;
      },
    });
  }

  addFolder(node?: RegularReport, isForEdit?: boolean) {
    const filtersDialogRef = this.matDialog.open(AddReportFolderDialogComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '30vw',
      width: '30vw',
      minHeight: '55vh',
      maxHeight: '95vh',
      autoFocus: false,
      disableClose: true,
      panelClass: ['action-modal', 'float-footer'],
      data: {
        node: node,
        isForEdit: isForEdit,
      },
    });

    filtersDialogRef.afterOpened().subscribe(() => {
      const dialogComponent = filtersDialogRef!.componentInstance;
      dialogComponent.dataChanges.subscribe((res) => {
        if (res) {
          this.initializePageFolders().subscribe();
        }
      });
    });
  }

  moveReport(node: RegularReport) {
    const filtersDialogRef = this.matDialog.open(MoveReportDialogComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '30vw',
      width: '30vw',
      minHeight: '30vh',
      maxHeight: '95vh',
      autoFocus: false,
      disableClose: true,
      panelClass: ['action-modal', 'float-footer'],
      data: {
        node: node,
      },
    });

    filtersDialogRef.afterOpened().subscribe(() => {
      const dialogComponent = filtersDialogRef!.componentInstance;
      dialogComponent.dataChanges.subscribe((res) => {
        if (res) {
          this.initializePageFolders().subscribe();
        }
      });
    });
  }

  editFolder(node: RegularReport, type: RegularReportBoardType) {
    if (type == RegularReportBoardType.Holder) {
      this.addFolder(node, true);
    } else {
      if (!this.authService.userPermissions.includes(PermissionsObj.CreateRegularReports)) {
        this.noPermission();
        return;
      }
      this.router.navigate([`edit`, node.id], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  noPermission() {
    this.matDialog.open(AuthorizationPopupComponent, {
      data: {
        title: this.translateService.instant('unauthorized.accessDenied'),
        message: `${this.translateService.instant('unauthorized.youDoNotHavePermission')} `,
        authorizationInside: false,
      },
      disableClose: true,
    });
  }

  addReport(node: RegularReport) {
    if (!this.authService.userPermissions.includes(PermissionsObj.CreateRegularReports)) {
      this.noPermission();
      return;
    }
    this.router.navigate([`add`], {
      relativeTo: this.activatedRoute,
      queryParams: { parentId: node.id },
    });
  }

  deleteItem(reportID) {
    const filtersDialogRef = this.matDialog.open(DeletePopupComponent, {
      data: {
        title: this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupTitle'
        ),
        message: `${this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupMessage'
        )} `,
      },
      disableClose: true,
    });

    filtersDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.isLoading = true;
        this.manageRegularReportsService.regularReportsService
          .deleteReport(reportID)
          .subscribe((_) => {
            this.toastr.success(this.translateService.instant('تم الحذف'));
            this.treeControl.collapseAll();
            this._loadedNodeIds.clear();
            this.initializePageFolders().subscribe();
          });
      }
    });
  }

  onDownloadFile(report: RegularReport): void {
    this.isLoadingForViewPdf = true;
    this.manageRegularReportsService.regularReportsService
      .downloadReport(report.title + report.contentType, report.id)
      .subscribe((res) => {
        this.isLoadingForViewPdf = false;
      });
  }

  getReportImageSrc(boardType: RegularReportBoardType, thumbnailUrl: string): string {
    if (boardType === RegularReportBoardType.Holder) {
      return `
        assets/images/folder.jpg`;
    }

    return `${
      environment.apiUrl
    }/api/v1/regularreports/thumbnail?path=${thumbnailUrl}&access_token=${this.authService.getToken()}`;
  }

  onViewImage(e: HTMLImageElement, boardType: RegularReportBoardType) {
    if (boardType === RegularReportBoardType.File) {
      this.matDialog.open(ViewImageModalComponent, {
        width: '800px',
        autoFocus: false,
        disableClose: true,
        data: e.src,
      });
    }
  }

  hasChild = (_: number, node: flatNodeItem) => node.expandable;

  expandOnlyTarget(targetId: string): void {
    if (!targetId) {
      return;
    }

    const targetNode = this.treeControl.dataNodes.find((node) => node.id === targetId);
    if (targetNode) {
      this.treeControl.expand(targetNode);
    }

    this.changeDetectorRef.detectChanges();
  }

  onNodeSelect(nodeId: string): void {
    this.expandOnlyTarget(nodeId);
  }

  reset() {
    this.showDetails = false; // Clear PDF display details
    this.exportableDocument = { pdfSrc: undefined, fileBlob: undefined }; // Clear PDF display
    this.previousSearchValue = ''; // Reset the tracking variable
    this.searchForm.reset({}, { emitEvent: false });
    this.initializePageFolders().subscribe();
  }

  findPeriodType(id: number) {
    const period = this.reportPeriodOptions.find((item) => item.id === id);
    return period ? 'تقرير ' + period.title : '';
  }

  getChildrenForNode(parentNode: any): any[] {
    const children: any[] = [];
    const parentLevel = parentNode.level;
    const parentIndex = this.treeControl.dataNodes.indexOf(parentNode);

    if (parentIndex === -1) return children;

    for (let i = parentIndex + 1; i < this.treeControl.dataNodes.length; i++) {
      const node = this.treeControl.dataNodes[i];
      if (node.level <= parentLevel) {
        break;
      }
      if (node.level === parentLevel + 1) {
        children.push(node);
      }
    }

    return children;
  }

  getRootNodes(): any[] {
    return this.treeControl.dataNodes.filter((node) => node.level === 0);
  }
}
