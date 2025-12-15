import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reschedule-meeting',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './reschedule-meeting.component.html',
  styleUrls: ['./reschedule-meeting.component.scss'],
})
export class RescheduleMeetingComponent {
  constructor(
    private dialogRef: MatDialogRef<RescheduleMeetingComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      desc: string;
    }
  ) {}

  onSubmit(): void {
    // Close dialog immediately and let parent handle the confirmation
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
