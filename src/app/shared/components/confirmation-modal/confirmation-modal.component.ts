import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
  isLoading: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      headerTranslationRef: string;
      headerIconSrc: string;
      hasActionButtons: boolean;
      hasDeleteBtn: boolean;
      content: string;
      confirmBtnTranslationRef?: string;
      confirmationAction: () => Observable<any>;
    },
    private dialogRef: MatDialogRef<ConfirmationModalComponent>
  ) {}

  /**
   * Called when either user clicks on 'close mark' or 'cancel button'.
   * It closes the modal and passes two propeties to its caller to indicate cancellation.
   */
  cancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  confirm(): void {
    this.isLoading = true;
    this.data.confirmationAction().subscribe({
      next: () => {
        this.dialogRef.close({
          status: 'Succeed',
          statusCode: ModalStatusCode.Success,
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
