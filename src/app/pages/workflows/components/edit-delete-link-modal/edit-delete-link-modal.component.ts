import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WorkflowLinkUserAction } from '@core/enums/workflow-link-user-action.enum';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';

@Component({
  selector: 'app-edit-delete-link-modal',
  templateUrl: './edit-delete-link-modal.component.html',
  styleUrls: ['./edit-delete-link-modal.component.scss'],
})
export class EditDeleteLinkModalComponent {
  WorkflowLinkUserAction = WorkflowLinkUserAction;

  constructor(private dialogRef: MatDialogRef<EditDeleteLinkModalComponent>) {}

  ngOnInit(): void {}

  onSubmit(workflowLinkUserAction: WorkflowLinkUserAction): void {
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        userAction: workflowLinkUserAction,
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
