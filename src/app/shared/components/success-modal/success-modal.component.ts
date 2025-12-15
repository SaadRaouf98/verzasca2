import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { ManageSharedService } from '@shared/services/manage-shared.service';

@Component({
  selector: 'app-success-modal',
  templateUrl: './success-modal.component.html',
  styleUrls: [
    './success-modal.component.scss',
    '../../../pages/imports-exports/pages/request-details/request-details.component.scss'
  ],
})
export class SuccessModalComponent implements OnInit {
  barcodeImagePath: SafeResourceUrl | null = null;
  isLoading: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      content: string;
      specialContent: string;
      requestId?: string;
    },
    public dialogRef: MatDialogRef<SuccessModalComponent>,
    private manageSharedService: ManageSharedService,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.data.requestId) {
      this.manageSharedService.requestsService
        .getBarcode(this.data.requestId)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.barcodeImagePath =
              this.domSanitizer.bypassSecurityTrustResourceUrl(
                `data:image/jpg;base64,${res}`
              );
          },
        });
    }
  }

  onClose(): void {
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
    });
  }
}
