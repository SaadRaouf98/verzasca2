import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { ImportExport } from '@core/models/import-export.model';
import { RequestAction } from '@core/models/request-action.model';
import {
  RelatedContainer,
  RequestContainerTimeLine,
  Transaction,
} from '@core/models/transaction.model';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { UpdateAccessibilityModalComponent } from '@pages/transactions/components/update-accessibility-modal/update-accessibility-modal.component';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';

import { Observable, map, forkJoin } from 'rxjs';
import { Location } from '@angular/common';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DeletePopupComponent } from '@shared/new-components/delete-popup/delete-popup.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: [
    './transaction-details.component.scss',
    '../../../imports-exports/pages/request-details/request-details.component.scss',
  ],
})
export class TransactionDetailsComponent implements OnInit {
  elementId: string = '';
  requestContainerDetails!: Transaction;
  requestContainerTimeLine!: RequestContainerTimeLine[];
  importsExports: ImportExport[] = [];
  relatedContainers: RelatedContainer[] = [];
  lang: string = 'ar';
  requestActions!: RequestAction[];
  isLoading: boolean = false;
  PermissionsObj = PermissionsObj;
  RequestContainerStatus = RequestContainerStatus;
  sortAsc = true;
  selectedTabIndex: number = 0;
  tabsLoading: {
    tab1: boolean;
    tab2: boolean;
    tab3: boolean;
  } = {
    tab1: true,
    tab2: true,
    tab3: true,
  };

  constructor(
    private manageTransactionsService: ManageTransactionsService,
    private toastr: CustomToastrService,
    private activatedRoute: ActivatedRoute,
    private languageService: LanguageService,
    private dialog: MatDialog,
    private router: Router,
    private translateService: TranslateService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.activatedRoute.params.subscribe((params) => {
      this.elementId = this.activatedRoute.snapshot.params['id'];
      this.intializePageData();
    });
    this.getRequestActions();
  }

  intializePageData(): void {
    this.isLoading = true;

    let requests: Observable<any>[] = [];

    requests.push(
      this.manageTransactionsService.requestContainersService
        .getRequestContainerTimeLine(this.elementId)
        .pipe(
          map((res) => {
            this.requestContainerTimeLine = res;
          })
        )
    );

    requests.push(
      this.manageTransactionsService.requestContainersService
        .getTransactionById(this.elementId)
        .pipe(
          map((res) => {
            this.requestContainerDetails = res;
          })
        )
    );

    if (requests.length) {
      forkJoin({
        ...requests,
      }).subscribe({
        next: (res) => {
          this.isLoading = false;
        },
        error: (err) => {
          if (err.status === 403) {
            this.router.navigate(['transactions']);
          }
        },
      });
    } else {
      this.isLoading = false;
    }
  }

  onAddImport(): void {
    this.router.navigate(['..', 'imports-exports', this.elementId, 'import', 'add']);
  }

  onAddExport(): void {
    this.router.navigate(['..', 'imports-exports', 'export']);
  }

  onChangeUrlOfRrequestContainerId(requestContainerId: string): void {
    this.router.navigateByUrl(this.router.url.replace(this.elementId, requestContainerId));
  }

  onEditElement(): void {
    this.router.navigate(['edit'], {
      relativeTo: this.activatedRoute,
    });
  }

  onOpenAccessibility(): void {
    this.dialog.open(UpdateAccessibilityModalComponent, {
      minWidth: '62.5rem',
      maxWidth: '62.5rem',
      // maxHeight: '95vh',
      // height: '95vh',
      panelClass: ['action-modal'],
      autoFocus: false,
      disableClose: false,
      data: {
        requestContainerId: this.elementId,
      },
    });
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
  getRequestActions() {
    this.manageTransactionsService.requestContainersService
      .getRequestContainerActions(this.elementId, this.sortAsc)
      .subscribe((res) => {
        this.requestActions = res;
      });
  }

  onToggleSort() {
    this.sortAsc = !this.sortAsc;
    this.getRequestActions();
    // this.requestActions = [...this.requestActions].sort((a, b) => {
    //   const dateA = new Date(a.date).getTime();
    //   const dateB = new Date(b.date).getTime();
    //   return this.sortAsc ? dateA - dateB : dateB - dateA;
    // });
  }
  onTabClicked(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;

    if (event.index === 0) {
      return;
    }

    if (event.index === 1) {
      this.tabsLoading.tab2 = true;

      this.manageTransactionsService.requestContainersService
        .getTransactionImportsAndExports(this.elementId, {
          pageSize: 1000,
          pageIndex: 0,
        })
        .pipe(
          map((res) => {
            const cloneData: ImportExport[] = [];
            res.data.forEach((element: any) => {
              cloneData.push({
                id: element.id,
                number: element.number,
                requestType: {
                  id: element.requestType?.id,
                  title: element.requestType?.title,
                  titleEn: element.requestType?.titleEn,
                },
                isExportDocument: element.isExportDocument,
                documentType: element.documentType,
                otherDocumentType: element.otherDocumentType,

                title: element.title,
                titleEn: element.titleEn,

                date: element.date,
                viewWatchButton: element.isRestricted ? false : true,
                isRestricted: element.isRestricted,
              });
            });
            this.tabsLoading.tab2 = false;
            this.importsExports = cloneData;
          })
        )
        .subscribe();
      return;
    }

    if (event.index === 2) {
      this.tabsLoading.tab3 = true;
      this.manageTransactionsService.requestContainersService
        .getRelatedContainersList(
          {
            pageIndex: 0,
            pageSize: 1000,
          },
          {
            requestContainerId: this.elementId,
          }
        )
        .pipe(
          map((res) => {
            this.tabsLoading.tab3 = false;
            this.relatedContainers = res.data;
          })
        )
        .subscribe();
      return;
    }
  }
  onCardClick(data: Transaction) {
    //  this.elementId = data.id;
    //  this.manageTransactionsService.requestsService
    //       .getFullPreview(this.activeCardId)
    //       .subscribe((res:Transaction) => {
    //         this.details = res;
    //       });
  }
  onChangeUrlOfRequestId(requestId: string): void {
    this.router.navigateByUrl(this.router.url.replace(this.elementId, requestId));
  }
  onNavigateBack(): void {
    this.location.back();
  }
  selectedForDelete: boolean = false;
  destroyRef = inject(DestroyRef);
  onSelectDelete() {
    this.selectedForDelete = true;
  }
  deleteItem() {
    console.log(document);
    const filtersDialogRef = this.dialog.open(DeletePopupComponent, {
      data: {
        title: this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupTitle'
        ),
        message: `${this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupMessage'
        )} `,
      },
      disableClose: false,
    });

    filtersDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.isLoading = true;

        this.manageTransactionsService.requestContainersService
          .deleteTransaction(this.elementId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              // navigate to parent route (same URL without id)
              let url = this.router.url.split('/')[1];
              this.router.navigateByUrl(url);
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
}
