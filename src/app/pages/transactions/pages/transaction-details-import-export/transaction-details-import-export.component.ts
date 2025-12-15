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
  RequestDetails,
} from '@core/models/request.model';
import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Transaction } from '@core/models/transaction.model';
import {
  RequestContainerStatus,
  statusTranslationMap,
} from '@core/enums/request-container-status.enum';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { Observable } from 'rxjs';
import { PDFSource } from 'ng2-pdf-viewer';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-transaction-details-import-export',
  templateUrl: './transaction-details-import-export.component.html',
  styleUrls: ['./transaction-details-import-export.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TransactionDetailsImportExportComponent implements OnInit, OnChanges {
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
  isExportDocument: boolean = false;
  exportableDocument: {
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    fileBlob: Blob | undefined;
  } = {
    pdfSrc: undefined,
    fileBlob: undefined,
  };
  RequestStatusTranslationMap = RequestStatusTranslationMap;
  statusTranslationMap = statusTranslationMap;
  @Input() data!: RequestDetails[];
  details!: RequestDetails;
  @Input() elementId: string = '';
  @Output() requestId: EventEmitter<string> = new EventEmitter();
  @Output() updateTableOnDelete: EventEmitter<boolean> = new EventEmitter();
  activeCardId: string | null = null;
  constructor(
    private sanitizer: DomSanitizer,
    private toastr: CustomToastrService,
    private router: Router,
    private langugaeService: LanguageService,
    private manageTransactionsService: ManageTransactionsService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.activeCardId = this.data[0]?.id;

    if (this.data.length > 0) this.onCardClick(this.data[0]);
  }

  ngOnChanges(changes: { data: SimpleChange }) {
    this.relatedRequestTablesSource = new MatTableDataSource(changes.data.currentValue);
    this.length = changes.data.currentValue.length;
  }
  currentData: any;
  onCardClick(data: RequestDetails) {
    this.activeCardId = data.id;
    this.currentData = data;
    this.isExportDocument = data.isExportDocument;
    this.isExportDocument ? this.loadFile(data.id) : this.loadImportData();
  }
  loadImportData() {
    this.manageTransactionsService.requestsService
      .getPreview(this.activeCardId)
      .subscribe((res: any) => {
        this.details = res;
        this.details.consultants.sort((a, b) => Number(b.isMain) - Number(a.isMain));
      });
  }

  loadFile(id: string): void {
    let observ$: Observable<Blob> = new Observable();

    if (id) {
      observ$ = this.manageTransactionsService.exportableDocumentService.getExportablePdfDocument(
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

  getRequestStatusTranslation(requestStatus: any): string {
    const status = requestStatus as RequestStatus;
    return this.RequestStatusTranslationMap[status] || '';
  }

  getContainerStatusTranslation(containerStatus: any): string {
    const status = containerStatus as RequestContainerStatus;
    return this.statusTranslationMap[status] || '';
  }
  onViewElement(): void {
    !this.details?.isExportDocument
      ? this.router.navigate(['imports-exports', this.details.id, 'request-details'])
      : this.router.navigate(['imports-exports', this.details.id, 'exportable-document-details']);
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
