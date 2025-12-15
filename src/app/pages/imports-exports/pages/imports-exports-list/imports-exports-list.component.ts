import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { AllRequests, Request, RequestsFiltersForm } from '@core/models/request.model';
import { Observable, Subscription, tap } from 'rxjs';
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
import { ExportsListComponent } from '@pages/imports-exports/components/exports-list/exports-list.component';
import { ImportsListComponent } from '@pages/imports-exports/components/imports-list/imports-list.component';
import { Entity } from '@core/models/entity.model';
import { ImportsExportsFiltersComponent } from '@pages/imports-exports/components/imports-exports-filters/imports-exports-filters.component';
import { ExportsFiltersComponent } from '@pages/imports-exports/components/exports-filters/exports-filters.component';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { FiltersComponent } from '@features/components/pending-request/pending-request-list/filters/filters.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { ComponentType } from 'ngx-toastr';

@Component({
  selector: 'app-imports-exports-list',
  templateUrl: './imports-exports-list.component.html',
  styleUrls: [
    './imports-exports-list.component.scss',
    '../../../manage-records/pages/records-list/records-list.component.scss',
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ImportsExportsListComponent implements OnInit, OnDestroy {
  filtersData: RequestsFiltersForm = {} as RequestsFiltersForm;
  isTableFiltered: boolean = false;

  @ViewChild('ExportListComponent') ExportListComponent: ExportsListComponent;
  @ViewChild('ImportsListComponent') ImportsListComponent: ImportsListComponent;
  @ViewChild('filtersComponent') filtersComponent: FiltersComponent;
  private filtersDialogRef: MatDialogRef<any> | null = null;
  lang = 'ar';
  RequestStatus = RequestStatus;
  PermissionsObj = PermissionsObj;
  ExportedDocumentType = ExportedDocumentType;
  isExportDocument = false;
  urlChangeObservable = new Subscription();
  prioritiesList: Entity[] = [];
  selectedPriority;
  private globalClickUnlisten: (() => void) | null = null;
  constructor(
    private dialog: MatDialog,
    private manageImportsExportsService: ManageImportsExportsService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private router: Router,
    private location: Location,
    private queryUrlFiltersPaginationSort: QueryUrlFiltersPaginationSort,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
    private ManageSharedService: ManageSharedService
  ) {}
  getPriorityList() {
    this.manageImportsExportsService.prioritiesService
      .getPrioritiesList({ pageSize: 50, pageIndex: 0 }, undefined, undefined, [
        'id',
        'title',
        'titleEn',
      ])
      .subscribe((response) => {
        this.prioritiesList = response.data;
      });
  }
  ngOnInit(): void {
    this.activatedRoute.queryParams
      .subscribe((params: any) => {
        this.isExportDocument = params.isExportDocument === 'true';
        this.filtersData.isExportDocument = this.isExportDocument;
      })
      .unsubscribe();
    this.getPriorityList();
  }

  ngOnDestroy() {
    this.urlChangeObservable.unsubscribe();
  }

  get activeTab() {
    if (this.isExportDocument) {
      return 1;
    } else {
      return 0;
    }
  }
  setSelectedPriority(val) {
    this.selectedPriority = val;
  }

  onNavToAddingExport(): void {
    this.router.navigate(['export'], {
      relativeTo: this.activatedRoute,
    });
  }

  onNavToAddingImport(): void {
    this.router.navigate(['add'], {
      relativeTo: this.activatedRoute,
    });
  }

  onNavigateBack(): void {
    this.location.back();
  }

  onTabClicked(event: MatTabChangeEvent): void {
    this.ManageSharedService.searchFormValue = null;
    this.onResetFilters();
    // Reset the filters component to clear form values
    if (this.filtersComponent) {
      this.filtersComponent.reset();
    }
    if (event.index === 1) {
      this.filtersData.isExportDocument = true;
      this.isExportDocument = true;
      this.filtersData.requestType = undefined;
    } else if (event.index === 0) {
      this.filtersData.isExportDocument = false;
      this.isExportDocument = false;
      this.filtersData.documentType = undefined;
    }
    this.clearQueryParams();
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'pageIndex', propertyValue: 0 },
    ]);
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      {
        propertyName: 'isExportDocument',
        propertyValue: this.filtersData.isExportDocument,
      },
      { propertyName: 'pageIndex', propertyValue: 0 },
    ]);
  }

  clearQueryParams() {
    this.router.navigate([], {
      queryParams: {
        pageIndex: 0,
        pageSize: 20,
        isExportDocument: this.isExportDocument,
      },
      replaceUrl: true,
    });
  }

  onPrintDeliveryReceipts(): void {
    if (!this.ExportListComponent.selectedExportedDocumentsIds.length) {
      this.toastr.warning(
        this.translateService.instant(
          'ImportsExportsModule.ImportsExportsListComponent.mustSelectAtLeastOneExport'
        )
      );
      return;
    }

    window.open(
      `${window.location.origin}/imports-exports/delivery-receipts/create?ids=${this.ExportListComponent.selectedExportedDocumentsIds}`,
      '_blank'
    );
  }

  onNavToDeliveryReceipts(): void {
    this.router.navigate(['delivery-receipts'], {
      relativeTo: this.activatedRoute,
    });
  }
  onResetFilters(): void {
    // Disable button immediately
    this.isTableFiltered = false;

    // Clear parent filters
    this.filtersData = {} as RequestsFiltersForm;
    this.filtersData.isExportDocument = this.isExportDocument;

    // Clear shared service
    this.ManageSharedService.searchFormValue = {};

    // Reset filters component (clears dialog filters)
    if (this.filtersComponent) {
      this.filtersComponent.resetAllFilters();
    }

    // Reset child component using its reset method
    if (this.activeTab === 0 && this.ImportsListComponent) {
      this.ImportsListComponent.resetFilters();
    } else if (this.activeTab === 1 && this.ExportListComponent) {
      this.ExportListComponent.resetFilters();
    }

    // Update URL
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'pageIndex', propertyValue: 0 },
    ]);
  }

  onExportExcel(): void {
    this.isExportDocument
      ? this.ExportListComponent.onExportExcel()
      : this.ImportsListComponent.onExportExcel();
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

    let activeFilterComponent;

    if (this.activeTab == 0) {
      activeFilterComponent = ImportsExportsFiltersComponent;
      this.filtersData = this.ExportListComponent?.filtersData || this.filtersData;
      this.filtersData.isExportDocument = false;
    } else {
      activeFilterComponent = ExportsFiltersComponent;
      this.filtersData = this.ImportsListComponent?.filtersData || this.filtersData;
      this.filtersData.isExportDocument = true;
    }
    this.filtersDialogRef = this.dialog.open(activeFilterComponent as ComponentType<any>, {
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

    // this.filtersDialogRef.afterOpened().subscribe(() => {
    //   const dialogComponent = this.filtersDialogRef!.componentInstance;
    //   dialogComponent.filtersChange.subscribe((dialogFilters: any) => {

    //     this.ManageSharedService.searchFormValue = dialogFilters;
    //   });
    // });
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

  onFiltersChange(filters: RequestsFiltersForm): void {
    // Dialog filters from FiltersComponent
    this.filtersData = filters || {};

    console.log('Dialog filters received:', this.filtersData);

    // Check if filters are applied
    const hasFilters =
      this.filtersData &&
      Object.keys(this.filtersData).some((key) => {
        const value = this.filtersData[key];
        const hasValue =
          key !== 'isExportDocument' && value !== null && value !== undefined && value !== '';
        console.log(`Checking key "${key}": value="${value}", hasValue=${hasValue}`);
        return hasValue;
      });

    console.log('hasFilters:', hasFilters);

    // Enable/disable reset button
    this.isTableFiltered = hasFilters;

    console.log('isTableFiltered set to:', this.isTableFiltered);

    // Propagate dialog filters to child component
    if (this.activeTab === 0 && this.ImportsListComponent) {
      this.ImportsListComponent.filtersData = this.filtersData;
      this.ImportsListComponent.onFiltersChange(this.filtersData);
    } else if (this.activeTab === 1 && this.ExportListComponent) {
      this.ExportListComponent.filtersData = this.filtersData;
      this.ExportListComponent.onFiltersChange(this.filtersData);
    }

    // Update URL
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'pageIndex', propertyValue: 0 },
    ]);
  }

  onTableFiltersChange(filters: RequestsFiltersForm): void {
    // Table filters from child component
    this.filtersData = filters || {};

    console.log('Table filters received:', this.filtersData);

    // Check if filters are applied
    const hasFilters =
      this.filtersData &&
      Object.keys(this.filtersData).some((key) => {
        const value = this.filtersData[key];
        const hasValue =
          key !== 'isExportDocument' && value !== null && value !== undefined && value !== '';
        return hasValue;
      });

    // Enable/disable reset button
    this.isTableFiltered = hasFilters;

    console.log('isTableFiltered set to:', this.isTableFiltered);

    // Update URL
    this.queryUrlFiltersPaginationSort.updateUrlQueryParams(this.filtersData, [
      { propertyName: 'pageIndex', propertyValue: 0 },
    ]);
  }
}
