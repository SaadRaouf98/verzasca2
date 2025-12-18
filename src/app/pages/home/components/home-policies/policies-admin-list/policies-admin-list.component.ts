import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableListComponent } from '@shared/new-components/table-list/table-list.component';
import { MatDialog } from '@angular/material/dialog';
import { SortDirection } from '@angular/material/sort';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { Classification } from '@core/models/classification.model';
import { NewsPost, AllLatestNews } from '@core/models/news-posts.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ManageLatestNewsService } from '@pages/latest-news/services/manage-latest-news.service';
import { DeletePopupComponent } from '@shared/new-components/delete-popup/delete-popup.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { catchError, Observable, tap } from 'rxjs';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';
import { RegulatoryDocumentsDto } from '@pages/home/interfaces/policy.interface';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-policies-admin-list',
  standalone: true,
  imports: [CommonModule, TableListComponent, TranslateModule, NgxPermissionsModule, RouterModule],
  templateUrl: './policies-admin-list.component.html',
  styleUrls: ['./policies-admin-list.component.scss'],
})
export class PoliciesAdminListComponent implements OnInit {
  dataSource: RegulatoryDocumentsDto[] = [];
  destroyRef = inject(DestroyRef);
  PermissionsObj = PermissionsObj;
  isLoading: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 0;
  sortData: { sortBy: string; sortType: SortDirection } = { sortBy: '', sortType: '' };
  hasUpdatePermission: boolean = false;
  hasDeletePermission: boolean = false;

  constructor(
    private dialog: MatDialog,
    private manageHomeService: ManageHomeService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private permissionsService: NgxPermissionsService
  ) {}
  columnsConfig: any[] = [];
  columns: string[] = [];
  ngOnInit(): void {
    this.initializeColumns();
    this.checkPermissions();
    this.initializeTable();
  }

  checkPermissions(): void {
    Promise.all([
      this.permissionsService.hasPermission(PermissionsObj.UpdateRegulatoryDocuments),
      this.permissionsService.hasPermission(PermissionsObj.DeleteRegulatoryDocuments),
    ]).then(([updatePerm, deletePerm]) => {
      this.hasUpdatePermission = updatePerm;
      this.hasDeletePermission = deletePerm;
      this.initializeColumnConfig();
    });
  }

  initializeTable(): void {
    this.manageHomeService
      .getCategoryData()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.isLoading = false;
          this.dataSource = res.data;
          this.length = res.totalCount;
        }),
        catchError((err) => {
          this.dataSource = [];
          return [];
        })
      )
      .subscribe();
  }

  onViewElement(elementId: string): void {
    this.router.navigate([`${elementId}/edit`], {
      relativeTo: this.activatedRoute,
    });
  }

  onEditElement(elementId: string): void {
    this.router.navigate(['/policies-admin', elementId, 'edit']);
  }

  onDeleteElement(element: Classification): void {
    const filtersDialogRef = this.dialog.open(DeletePopupComponent, {
      disableClose: false,
      data: {
        title: this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupTitle'
        ),
        message: `${this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupMessage'
        )} `,
      },
    });
    filtersDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.isLoading = true;
        this.manageHomeService
          .delete(element.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.initializeTable();
            },
            error: (err) => {
              this.isLoading = false;
              this.toastr.error(
                this.translateService.instant('shared.deleteFailed') || 'Delete failed'
              );
            },
          });
      }
    });
  }
  initializeColumns() {
    this.columns = ['title', 'category', 'isActive', 'actions'];
  }
  initializeColumnConfig() {
    const editAction = {
      action: 'edit',
      actionName: 'edit',
      onClick: (element: any) => {
        this.onEditElement(element.id);
      },
    };

    const deleteAction = {
      action: 'delete',
      actionName: 'delete',
      onClick: (element: any) => {
        this.onDeleteElement(element);
      },
    };

    // Filter actions based on permissions
    const actions = [];
    if (this.hasUpdatePermission) {
      actions.push(editAction);
    }
    if (this.hasDeletePermission) {
      actions.push(deleteAction);
    }

    this.columnsConfig = [
      {
        label: 'shared.title',
        type: 'text',
      },
      {
        label: 'shared.category',
        type: 'text',
        arKey: 'title',
        enKey: 'titleEn',
      },
      {
        label: 'shared.status',
        type: 'customSwitcher',
        title: { falseText: 'غير نشط', trueText: 'نشط' },
        // colorCode: { falseColor: '#DB5757', trueColor: '#4CAF50' },
      },

      {
        label: 'shared.action',
        type: 'actions',
        actions: actions,
      },
    ];
  }
  toggleValueChange(element: any) {
    const newValue = element.e.checked;
    this.manageHomeService
      .activate(element.element.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
          this.initializeTable();
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(
            this.translateService.instant('shared.deleteFailed') || 'Delete failed'
          );
        },
      });
  }
  onPaginationChange(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.initializeTable();
  }

  onNavigateBack(): void {
    this.router.navigate(['/home']);
  }
}
