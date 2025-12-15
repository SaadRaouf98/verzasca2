import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Attachment } from '@core/models/request.model';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { downloadBlobOrFile } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';

@Component({
  selector: 'app-view-attachments-modal',
  templateUrl: './view-attachments-modal.component.html',
  styleUrls: ['./view-attachments-modal.component.scss'],
})
export class ViewAttachmentsModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      attachments: Attachment[];
      attachment:Attachment
    },

    private dialogRef: MatDialogRef<ViewAttachmentsModalComponent>,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnInit(): void {}

  onViewFile(file: Attachment): void {
    window.open(
      `${window.location.origin}/imports-exports/attachments/${file.id}?name=${file.name}`,
      '_blank'
    );
  }

  onDownloadFile(file: Attachment): void {
    this.manageSharedService.requestsService
      .getRequestSingleAttachment(file.id)
      .subscribe({
        next: (res) => {
          downloadBlobOrFile(file.name, res);
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }
}
