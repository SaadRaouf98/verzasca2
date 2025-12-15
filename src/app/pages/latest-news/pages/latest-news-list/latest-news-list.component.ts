import { Component, Injector, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { Observable, tap } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Classification } from '@core/models/classification.model';

import { ManageLatestNewsService } from '@pages/latest-news/services/manage-latest-news.service';
import { AllLatestNews, NewsPost } from '@core/models/news-posts.model';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { SortDirection } from '@angular/material/sort';
import { LanguageService } from '@core/services/language.service';
import { DeletePopupComponent } from '@shared/new-components/delete-popup/delete-popup.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-latest-news-list',
  templateUrl: './latest-news-list.component.html',
  styleUrls: ['./latest-news-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LatestNewsListComponent implements OnInit {
  latestNewsSource: NewsPost[] = [];
  expandedElement!: NewsPost | null;
  PermissionsObj = PermissionsObj;
  isLoading: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 0;
  sortData: { sortBy: string; sortType: SortDirection } = { sortBy: '', sortType: '' };

  constructor(
    private dialog: MatDialog,
    private manageLatestNewsService: ManageLatestNewsService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private languageService: LanguageService
  ) {}
  columnsConfig: any[] = [];
  columns: string[] = [];
  ngOnInit(): void {
    this.initializeTable().subscribe();
  }

  initializeTable(): Observable<AllLatestNews> {
    this.isLoading = true;
    return this.manageLatestNewsService.latestNewsService
      .getNewsPostsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        undefined,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.latestNewsSource = res.data;
          this.length = res.totalCount;
          this.initializeColumnConfig();
          this.initializeColumns();
        })
      );
  }

  onViewElement(elementId: string): void {
    this.router.navigate([`${elementId}/edit`], {
      relativeTo: this.activatedRoute,
    });
  }

  onEditElement(elementId: string): void {
    this.router.navigate([`${elementId}/edit`], {
      relativeTo: this.activatedRoute,
    });
  }

  onDeleteElement(element: Classification): void {
    const lang = this.languageService.language;

    const filtersDialogRef = this.dialog.open(DeletePopupComponent, {
      disableClose: true,
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
        this.manageLatestNewsService.latestNewsService.deleteNewsPost(element.id).subscribe(
          (res) => {
            this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
            this.initializeTable().subscribe();
          },
          () => {
            this.isLoading = false;
            this.toastr.error(
              this.translateService.instant('shared.deleteFailed') || 'Delete failed'
            );
          }
        );
      }
    });
  }
  initializeColumnConfig() {
    this.columnsConfig = [
      {
        label: 'shared.title',
        type: 'text',
      },
      {
        label: 'shared.definition',
        type: 'ExportedDocumentTypeEnum',
      },
      {
        label: 'shared.createdBy',
        type: 'text',
      },
      {
        label: 'shared.createdAt',
        type: 'dateOnly',
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
        actions: [
          // {
          //   action: 'view',
          //   actionName: 'view',
          //   onClick: (element: any) => {
          //     this.onViewElement(element.id);
          //   },
          // },
          {
            action: 'edit',
            actionName: 'edit',
            onClick: (element: any) => {
              this.onEditElement(element.id);
            },
          },
          {
            action: 'delete',
            actionName: 'delete',
            onClick: (element: any) => {
              this.onDeleteElement(element);
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
  toggleValueChange(element: any) {
    console.log('event', element);
    const newValue = element.e.checked;
    this.manageLatestNewsService.latestNewsService
      .setVisabilityStatus(element.element.id, newValue)
      .subscribe(
        (res) => {
          this.toastr.success(this.translateService.instant('shared.updatedSuccessfully'));
          this.initializeTable().subscribe();
        },
        (error) => {
          this.toastr.error(
            this.translateService.instant('shared.updateFailed') || 'Update failed'
          );
        }
      );
  }
  onPaginationChange(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.initializeTable().subscribe();
  }
  initializeColumns() {
    this.columns = ['title', 'definition', 'creator', 'createdOn', 'isVisible', 'actions'];
  }

  onNavigateBack(): void {
    this.router.navigate(['/home']);
  }
}
