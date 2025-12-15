import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Injector, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { ManagePendingTransactionsService } from '@pages/pending-transactions/services/manage-pending-transactions.service';
import { Observable, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { RequestStatus } from '@core/enums/request-status.enum';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { AbstractTable } from '@core/abstract-classes/abstract-table.abstract';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import {
  AllPendingRequests,
  PendingRequest,
  PendingRequestsFiltersForm,
} from '@core/models/pending-request.model';
import { FilterDef } from '@shared/models/filter.interface';
import { CustomToastrService } from '@core/services/custom-toastr.service';
@Component({
  selector: 'app-pending-transactions-list',
  templateUrl: './pending-transactions-list.page.html',
  styleUrls: ['./pending-transactions-list.page.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class PendingTransactionsListPage extends AbstractTable implements OnInit {
  requestsSource: MatTableDataSource<PendingRequest> = new MatTableDataSource<PendingRequest>([]);
  override expandedElement!: PendingRequest | null;

  filtersData: PendingRequestsFiltersForm = {} as PendingRequestsFiltersForm;

  RequestStatus = RequestStatus;
  PermissionsObj = PermissionsObj;

  ExportedDocumentType = ExportedDocumentType;

  constructor(
    private dialog: MatDialog,
    private managePendingTransactionsService: ManagePendingTransactionsService,
    private translateService: TranslateService,
    private toastr: CustomToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.initializeTable().subscribe();
  }

  initializeTable(): Observable<AllPendingRequests> {
    this.isLoading = true;
    return this.managePendingTransactionsService.requestsService
      .getPendingRequestsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.requestsSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  onFiltersChange(filtersData: PendingRequestsFiltersForm): void {
    this.filtersData = filtersData;
    this.pageIndex = 0;
    this.initializeTable().subscribe();
  }

  onViewElement(element: PendingRequest): void {
    if (element.isExportDocument) {
      this.router.navigate([`${element.id}`, 'exportable-document-details'], {
        relativeTo: this.activatedRoute,
      });
    } else {
      this.router.navigate([`${element.id}`, 'request-details'], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  onRightClick(element: PendingRequest): void {
    if (element.isExportDocument) {
      window.open('/pending-transactions/' + element.id + '/exportable-document-details', '_blank');
    } else {
      window.open('/pending-transactions/' + element.id + '/request-details', '_blank');
    }
  }

  onEditElement(event: any, element: PendingRequest): void {
    event.stopPropagation();
    if (element.isExportDocument) {
      //It is exported document
      this.router.navigate(['imports-exports', element.id, 'export']);
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

    this.router.navigate(['imports-exports', element.id, 'import']);
  }

  onDeleteElement(event: any, element: PendingRequest): void {
    event.stopPropagation();

    if (element.isExportDocument) {
      this.toastr.success(this.translateService.instant('shared.canotDeleteExportableDocument'));
      return;
    }

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'ImportsExportsModule.ImportsExportsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'ImportsExportsModule.ImportsExportsListComponent.deleteImportWarning'
        )}  '${element.title}' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.managePendingTransactionsService.requestsService
            .deleteRequest(element.id)
            .subscribe((res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.initializeTable().subscribe();
            });
        },
      },
    });
  }

  onGoToDetails(elementId: string): void {
    this.router.navigate(['imports-exports', `${elementId}`]);
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['icon', 'importNumber', 'actions'];
    } else {
      return [
        'icon',
        'importNumber',
        'requestType.title',
        'nextStep.title',
        'priority.title',
        'title',
        'foundation.title',
        //'requestingFoundation',
        // 'concernedFoundation',
        'deliveryDate',
        'mainConsultant.name',
        'exportType',
        //'isExportDocument',
        'actions',
      ];
    }
  }

  formatConsultants(consultants: { id: string; name: string; isMain: boolean }[]): string {
    if (!consultants || (consultants && consultants.length === 1)) {
      return '';
    }

    return consultants
      .filter((ele) => !ele.isMain)
      .map((ele) => {
        return ele.name;
      })
      .join(' ,');
  }
}
