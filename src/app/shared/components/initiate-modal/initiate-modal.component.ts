import { Component, Inject, OnInit } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { RequestProgressType } from '@core/enums/request-progress-type.enum';
import { Attachment, RequestCurrentExport } from '@core/models/request.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { PDFSource } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-initiate-modal',
  templateUrl: './initiate-modal.component.html',
  styleUrls: ['./initiate-modal.component.scss'],
})
export class InitiateModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;

  isRecordFileLoading: boolean = true;

  recordFile: {
    fileBlob: Blob | undefined;
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    name: string;
  } = {
    fileBlob: undefined,
    pdfSrc: undefined,
    name: this.data.fileName,
  };
  error: any;
  RequestProgressType = RequestProgressType;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      requestId: string;
      requestAutoNumber: string;
      actionId: string;
      fileName: string;
      currentProgress: RequestProgressType;
      currentExport: RequestCurrentExport;
    },
    private dialogRef: MatDialogRef<InitiateModalComponent>,
    private manageSharedService: ManageSharedService,
    private toastr: CustomToastrService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadRecordFile();
  }

  loadRecordFile(): void {
    this.isRecordFileLoading = true;

    this.manageSharedService.exportableDocumentService
      .getExportablePdfDocument(this.data.currentExport?.id, true)
      .subscribe({
        next: (res) => {
          this.isRecordFileLoading = false;
          this.recordFile.fileBlob = res;
          this.recordFile.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(this.recordFile.fileBlob)
          );
        },
        error: (err) => {
          if (err.status === 404) {
            this.toastr.error('عفوا هذا الملف غير موجود');
          }
        },
      });
  }

  onSubmit(): void {
    this.disableSubmitBtn = true;
    this.executeRequestAction();
  }

  private executeRequestAction() {
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }
}
