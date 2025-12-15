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
import { RequestStatus, RequestStatusTranslationMap } from '@core/enums/request-status.enum';
import {
  MultilingualItemTitleDto,
  RelatedRequestResultDto,
  RelatedRequestScrollableTable,
  RequestDetails,
} from '@core/models/request.model';
import { LanguageService } from '@core/services/language.service';

import { Transaction } from '@core/models/transaction.model';
import {
  RequestContainerStatus,
  statusTranslationMap,
} from '@core/enums/request-container-status.enum';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { Observable } from 'rxjs';
import { PDFSource } from 'ng2-pdf-viewer';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { Router } from '@angular/router';
import { ImportExport } from '@core/models/import-export.model';
import { ExportableDocument } from '@core/models/exportable-document.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-exporta-import-details',
  templateUrl: './exporta-import-details.component.html',
  styleUrls: ['./exporta-import-details.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ExportImportDetailsComponent implements OnInit, OnChanges {
  //  @Input() requestContainerDetails!: ImportExport;
  @Input() requestContainerDetails!: ExportableDocument;

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
    pdfSrc: SafeResourceUrl | string | Uint8Array | PDFSource | undefined;
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
    if (this.data && Array.isArray(this.data) && this.data.length > 0) {
      this.activeCardId = this.data[0].id;
      this.details = this.data[0];
      this.isExportDocument = this.data[0].isExportDocument;
      this.onCardClick(this.data[0]);
    }
  }

  ngOnChanges(changes: { data?: SimpleChange }): void {
    if (changes['data'] && changes['data'].currentValue) {
      const newData = changes['data'].currentValue;
      this.relatedRequestTablesSource = new MatTableDataSource(newData);
      this.length = newData.length;

      // Initialize with first item if no active card selected yet
      if (newData.length > 0 && !this.activeCardId) {
        this.activeCardId = newData[0].id;
        this.details = newData[0];
        this.isExportDocument = newData[0].isExportDocument;
        this.onCardClick(newData[0]);
      }
    }
  }
  currentData: any;
  onCardClick(data: RequestDetails) {
    this.activeCardId = data.id;
    this.currentData = data;
    this.isExportDocument = data.isExportDocument;

    if (data.isExportDocument) {
      this.details = data;
      this.loadFile(data.id);
    } else {
      this.manageTransactionsService.requestsService.getPreview(data.id).subscribe((res: any) => {
        this.details = res;
        this.details.consultants.sort((a, b) => Number(b.isMain) - Number(a.isMain));
      });
    }
  }

  loadImportData(data) {
    this.manageTransactionsService.requestsService.getPreview(data.id).subscribe((res: any) => {
      this.details = res;
      this.details.consultants.sort((a, b) => Number(b.isMain) - Number(a.isMain));
      this.isExportDocument ? this.loadFile(data.id) : null;
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
    console.log(this.details);
    !this.isExportDocument
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
