import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { Clipboard } from '@angular/cdk/clipboard';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-view-note-modal',
  templateUrl: './view-note-modal.component.html',
  styleUrls: ['./view-note-modal.component.scss'],
})
export class ViewNoteModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      comment: string;
    },
    private dialogRef: MatDialogRef<ViewNoteModalComponent>,
    private clipboard: Clipboard,
    private toastr: CustomToastrService
  ) {}

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  onCopyNote(): void {
    this.clipboard.copy(this.data.comment);
    this.toastr.success('تم النسخ بنجاح');
  }
}
