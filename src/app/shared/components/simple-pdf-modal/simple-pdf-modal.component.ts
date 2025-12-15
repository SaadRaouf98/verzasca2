import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-simple-pdf-modal',
  template: `
    <div class="pdf-modal-container">
      <div class="pdf-modal-header">
        <h2 mat-dialog-title>{{ 'shared.viewFile' | translate }}</h2>
        <button mat-icon-button (click)="close()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="pdf-modal-content">
        <object
          *ngIf="pdfSrc"
          [data]="safeSrc"
          type="application/pdf"
          width="100%"
          height="100%"
        >
          <iframe
            [src]="safeSrc"
            width="100%"
            height="100%"
            frameborder="0"
          ></iframe>
        </object>
      </div>
    </div>
  `,
  styles: [`
    .pdf-modal-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }
    .pdf-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }
    .pdf-modal-header h2 {
      margin: 0;
      font-size: 20px;
    }
    .pdf-modal-content {
      flex: 1;
      overflow: auto;
      position: relative;
      background: #525659;
    }
    .pdf-modal-content ::ng-deep .textLayer {
      direction: rtl !important;
      text-align: right !important;
    }
    .pdf-modal-content ::ng-deep canvas {
      direction: rtl !important;
    }
    .close-btn {
      margin-inline-start: auto;
    }
  `]
})
export class SimplePdfModalComponent {
  pdfSrc: string;
  safeSrc: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    private dialogRef: MatDialogRef<SimplePdfModalComponent>,
    private sanitizer: DomSanitizer
  ) {
    this.pdfSrc = data;
    this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(data);
  }

  close(): void {
    this.dialogRef.close();
  }
}
