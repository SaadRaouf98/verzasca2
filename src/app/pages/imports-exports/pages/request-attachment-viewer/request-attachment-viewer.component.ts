import { Component, OnInit } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { PDFSource } from 'ng2-pdf-viewer';

import printJS from 'print-js';
import { Observable, map } from 'rxjs';
import { Location } from '@angular/common';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-request-attachment-viewer',
  templateUrl: './request-attachment-viewer.component.html',
  styleUrls: ['./request-attachment-viewer.component.scss'],
})
export class RequestAttachmentViewerComponent implements OnInit, OnInit {
  attachmentId: string = '';
  fileBlob: Blob | null = null;
  fileName: string = 'test';
  pdfFileToView: {
    pdfSrc: string | Uint8Array | PDFSource | undefined;
  } = {
    pdfSrc: undefined,
  };

  imageUrl: SafeUrl = '';
  fileExtension: string = '';
  pages: Array<{ thumbnail: string }> = [];
  iconActions = [
    {
      icon: 'download',
      label: 'shared.download',
      callback: () => this.onDownloadFile(),
    },
    {
      icon: 'printer',
      label: 'ImportsExportsModule.RequestDetailsComponent.printer',
      callback: () => this.onPrintFile(),
    },
  ];
  constructor(
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private sanitizer: DomSanitizer,
    private manageImportsExportsService: ManageImportsExportsService,
    private location: Location
  ) {}

  ngOnInit() {
    this.attachmentId = this.activatedRoute.snapshot.params['attachmentId'];
    this.fileName = this.activatedRoute.snapshot.queryParams['name'];
    this.fileExtension = `.${this.fileName.split('.').pop()}` || '.pdf'; //.pdf

    this.getDocument().subscribe({
      next: (blobFile) => {
        if (this.fileExtension === '.pdf') {
          this.pdfFileToView.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(blobFile)
          );
          // blobToBase64(blobFile).then((base64string) => {
          // Convert Base64 string to Data URL format
          // const dataUrl = `data:application/pdf;base64,${base64string}`;

          // Sanitize the URL so that it can be safely used in the iframe
          // this.pdfFileToView.pdfSrc =
          //   this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
          // });

          return;
        }

        if (
          this.fileExtension == '.png' ||
          this.fileExtension == '.jpg' ||
          this.fileExtension == '.jpeg'
        ) {
          let objectURL = URL.createObjectURL(blobFile);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);

          return;
        }
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastr.error('عفوا هذا المرفق غير موجود');
        }
      },
    });
  }

  private getDocument(): Observable<Blob> {
    return this.manageImportsExportsService.requestsService
      .getRequestSingleAttachment(this.attachmentId)
      .pipe(
        map((res) => {
          this.fileBlob = res;
          return res;
        })
      );
  }

  onPrintFile(): void {
    if (this.fileBlob) {
      if (this.fileExtension === '.pdf') {
        /* printJS({
          printable: URL.createObjectURL(this.fileBlob),
          type: 'pdf',
        }); */

        printJS({
          printable: this.pages.map((ele) => ele.thumbnail),
          type: 'image',
          base64: true,
        });
      } else if (this.fileExtension === '.doc' || this.fileExtension === '.docx') {
        //@ts-ignore
        const iframe = document.getElementById('office').contentWindow;
        const message = {
          MessageId: 'Action_Print',
          SendTime: Date.now(),
          Values: {},
        };
        iframe.postMessage(JSON.stringify(message), '*');
      } else if (
        this.fileExtension === '.png' ||
        this.fileExtension === '.jpg' ||
        this.fileExtension === '.jpeg'
      ) {
        printJS({
          printable: window.URL.createObjectURL(this.fileBlob!),
          type: 'image',
          base64: false,
        });
      }
    }
  }

  onDownloadFile(): void {
    if (this.fileBlob) {
      const url: string = window.URL.createObjectURL(this.fileBlob!);
      var a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = `${this.fileName}`;
      a.click();
    } else {
      this.toastr.warning(this.translateService.instant('shared.waitUntilFileIsLoaded'));
    }
  }

  onNavigateBack(): void {
    this.location.back();
  }
}
