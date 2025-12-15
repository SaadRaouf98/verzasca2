import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { PDFSource } from 'ng2-pdf-viewer';

import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-exportable-document-viewer',
  templateUrl: './exportable-document-viewer.component.html',
  styleUrls: ['./exportable-document-viewer.component.scss'],
})
export class ExportableDocumentViewerComponent implements OnInit {
  exportableDocumentId: string = '';
  exportId: string = '';
  exportableDocumentName: string = '';

  isExportableDocumentLoading: boolean = true;
  exportableDocument: {
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    fileBlob: Blob | undefined;
  } = {
    pdfSrc: undefined,
    fileBlob: undefined,
  };

  constructor(
    private manageImportsExportsService: ManageImportsExportsService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toastr: CustomToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.exportableDocumentId = this.activatedRoute.snapshot.params['documentId'];

    this.exportId = this.activatedRoute.snapshot.params['exportId'];

    this.exportableDocumentName = this.activatedRoute.snapshot.queryParams['name'];
    this.loadFile();
  }

  loadFile(): void {
    this.isExportableDocumentLoading = true;

    let observ$: Observable<Blob> = new Observable();

    if (this.exportId) {
      observ$ = this.manageImportsExportsService.exportableDocumentService.getExportablePdfDocument(
        this.exportId
      );
    } else if (this.exportableDocumentId) {
      observ$ = this.manageImportsExportsService.requestsService.getRequestSingleAttachment(
        this.exportableDocumentId
      );
    }

    observ$.subscribe({
      next: (blobFile) => {
        this.isExportableDocumentLoading = false;
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

  onNavigateBack(): void {
    this.location.back();
  }
}
