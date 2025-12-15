import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { RequestStatus, RequestStatusTranslationMap } from '@core/enums/request-status.enum';
import {
  MultilingualItemTitleDto,
  RelatedRequestResultDto,
  RelatedRequestScrollableTable,
  Request,
} from '@core/models/request.model';
import { LanguageService } from '@core/services/language.service';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { Transaction } from '@core/models/transaction.model';
import {
  statusTranslationMap,
  RequestContainerStatus,
} from '@core/enums/request-container-status.enum';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { PDFSource } from 'ng2-pdf-viewer';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
@Component({
  selector: 'app-related-requests-scrollable-table',
  templateUrl: './related-requests-scrollable-table.component.html',
  styleUrls: ['./related-requests-scrollable-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RelatedRequestsScrollableTableComponent implements OnInit, OnChanges {
  @Input() pageType!: 'import' | 'transaction';
  @Input() requestContainerDetails!: Transaction;
  relatedRequestTablesSource: MatTableDataSource<RelatedRequestScrollableTable> =
    new MatTableDataSource<RelatedRequestScrollableTable>([]);
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  displayedColumns: string[] = [
    'importNumber',
    'transactionNumber',
    'title',
    'priority',
    'status',
    'foundation',
    'requestType',
    'consultant',
    'actions',
  ];
  expandedElement!: RelatedRequestScrollableTable | null;
  lang: string = 'ar';
  RequestStatus = RequestStatus;
  RequestStatusTranslationMap = RequestStatusTranslationMap;
  statusTranslationMap = statusTranslationMap;
  @Input() data: any[] = [];
  details!: any;
  @Input() elementId: string = '';
  @Output() requestId: EventEmitter<string> = new EventEmitter();
  @Output() updateTableOnDelete: EventEmitter<boolean> = new EventEmitter();
  activeCardId: string | null = null;
  exportableDocument: {
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    fileBlob: Blob | undefined;
  } = {
    pdfSrc: undefined,
    fileBlob: undefined,
  };
  ExportedDocumentType = ExportedDocumentType;
  constructor(
    private langugaeService: LanguageService,
    private toastr: CustomToastrService,
    private dialog: MatDialog,
    private manageImportsExportsService: ManageImportsExportsService,
    private translateService: TranslateService,
    private sanitizer: DomSanitizer,
    private manageTransactionsService: ManageTransactionsService,
    private router: Router
  ) {}

  // Helper method to safely get container status translation
  getContainerStatusTranslation(containerStatus: any): string {
    const status = containerStatus as RequestContainerStatus;
    return this.statusTranslationMap[status] || '';
  }

  // Helper method to safely get request status translation
  getRequestStatusTranslation(requestStatus: any): string {
    const status = requestStatus as RequestStatus;
    return this.RequestStatusTranslationMap[status] || '';
  }

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    if (this.data && this.data.length > 0) {
      this.activeCardId = this.data[0].id;
      this.details = this.data[0];
      this.onCardClick(this.data[0]);
    }
  }

  ngOnChanges(changes: { data: SimpleChange }) {
    this.relatedRequestTablesSource = new MatTableDataSource(changes.data.currentValue);
    this.length = changes.data.currentValue?.length;
  }

  onCardClick(data: any) {
    this.activeCardId = data.id;
    this.details = data;
    if (data.isExportDocument) {
      this.loadFile(data.id);
    } else {
      this.getRequestDetails(data.id);
    }
  }
  onViewElement(): void {
    !this.details?.isExportDocument
      ? this.router.navigate(['imports-exports', this.details.id, 'request-details'])
      : this.router.navigate(['imports-exports', this.details.id, 'exportable-document-details']);
  }
  getRequestDetails(id: string): void {
    if (this.pageType === 'import') {
      this.manageTransactionsService.requestsService.getPreview(id).subscribe((res: any) => {
        this.details = res;
        this.details.consultants.sort((a, b) => Number(b.isMain) - Number(a.isMain));
      });
    } else if (this.pageType === 'transaction') {
      this.manageTransactionsService.requestsService.getFullPreview(id).subscribe((res: any) => {
        this.details = res;
        this.details.consultants.sort((a, b) => Number(b.isMain) - Number(a.isMain));
      });
    }
  }
  loadFile(id: string): void {
    let observ$: Observable<Blob> = new Observable();

    if (id) {
      observ$ = this.manageImportsExportsService.exportableDocumentService.getExportablePdfDocument(
        id,
        true
      );
    }

    observ$.subscribe({
      next: (blobFile) => {
        this.exportableDocument.fileBlob = blobFile;

        this.exportableDocument.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(blobFile)
        );
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastr.error('عفوا هذا الملف غير موجود');
        }
      },
    });
  }

  // Method to trigger deletion confirmation dialog for a given request element
  onDeleteElement(element: Request): void {
    // Load all necessary translations asynchronously
    this.translateService
      .get([
        'ImportsExportsModule.ImportsExportsListComponent.confirmExportDeletion',
        'TransactionsModule.TransactionsListComponent.deleteSectorWarning',
        'shared.questionMark',
        'shared.yesDelete',
        'shared.deletedSuccessfully',
        'shared.deletionFailed',
      ])
      .subscribe((translations) => {
        // Construct the content message using the translated warning and the element title
        const content = `${translations['TransactionsModule.TransactionsListComponent.deleteSectorWarning']} '${element.title}' ${translations['shared.questionMark']}`;

        // Open the confirmation dialog with dynamic configuration
        const dialogRef = this.dialog.open(ConfirmationModalComponent, {
          minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px', // Responsive width
          autoFocus: false, // Avoid focusing to prevent mobile zoom issues
          disableClose: true, // Force the user to make a choice (no outside click dismiss)
          data: {
            headerTranslationRef:
              translations[
                'ImportsExportsModule.ImportsExportsListComponent.confirmExportDeletion'
              ],
            headerIconSrc: 'assets/icons/trash-solid.svg', // Trash icon
            hasActionButtons: true,
            hasDeleteBtn: true,
            content, // Composed content message
            confirmBtnTranslationRef: translations['shared.yesDelete'],
            // Callback triggered if user confirms the deletion
            confirmationAction: () => this.confirmDeletion(element.id, translations),
          },
        });
      });
  }

  // Separate method to handle the actual deletion logic
  private confirmDeletion(elementId: string, translations: { [key: string]: string }): void {
    this.dialog.closeAll(); // Close all open dialogs

    // Call the service to delete the request by ID
    this.manageImportsExportsService.requestsService
      .deleteRelatedRequestById(this.elementId, elementId)
      .subscribe({
        // On success, show a success toast message
        next: () => {
          this.toastr.success(translations['shared.deletedSuccessfully']);
          this.updateTableOnDelete.emit(true);
        },
        // On error, log and notify the user of the failure
        error: (error) => {
          console.error('Deletion failed:', error);
          this.toastr.error(translations['shared.deletionFailed']);
        },
      });
  }

  view_hide_element(element: RelatedRequestScrollableTable): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: RelatedRequestScrollableTable): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }
  formatConcernedFoundations(concernedFoundations: MultilingualItemTitleDto[]): string {
    if (!concernedFoundations || concernedFoundations.length === 0) {
      return '-';
    }
    return concernedFoundations
      .map((ele) => (this.lang === 'ar' ? ele.title : ele.titleEn))
      .join(' ,');
  }
}
