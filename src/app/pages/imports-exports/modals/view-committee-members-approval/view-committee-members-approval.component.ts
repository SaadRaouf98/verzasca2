import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommitteeApproval } from '@core/models/request.model';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ViewNoteModalComponent } from '@pages/manage-records/components/view-note-modal/view-note-modal.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { TakeCommitteeMemberApprovalActionComponent } from '../take-committee-member-approval-action/take-committee-member-approval-action.component';
import { Clipboard } from '@angular/cdk/clipboard';

import { PermissionsObj } from '@core/constants/permissions.constant';
import { MemberApprovalType } from '@core/enums/member-approval-type.enum';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-view-committee-members-approval',
  templateUrl: './view-committee-members-approval.component.html',
  styleUrls: ['./view-committee-members-approval.component.scss'],
})
export class ViewCommitteeMembersApprovalComponent {
  committeeMembersApprovals: CommitteeApproval[] = [];
  PermissionsObj = PermissionsObj;
  MemberApprovalType = MemberApprovalType;
  isLoading: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      requestId: string;
      stepId: string;
    },

    private dialogRef: MatDialogRef<ViewCommitteeMembersApprovalComponent>,
    private manageImportsExportsService: ManageImportsExportsService,
    private clipboard: Clipboard,
    private dialog: MatDialog,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.manageImportsExportsService.requestsService
      .getCommitteeApprovalsByStepId(this.data.requestId, this.data.stepId)
      .subscribe((res) => {
        this.committeeMembersApprovals = res;
        this.isLoading = false;
      });
  }

  //Committee members approvals
  onViewComment(comment: string): void {
    this.dialog.open(ViewNoteModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '800px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: false,
      data: {
        comment,
      },
    });
  }

  onCopyNote(comment: string): void {
    this.clipboard.copy(comment);
    this.toastr.success('Note copied successfully');
  }

  onTakeActionViaPhone(committeeApproval: CommitteeApproval): void {
    this.dialog.open(TakeCommitteeMemberApprovalActionComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '800px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: false,
      data: {
        requestId: this.data.requestId,
        committeeApproval: committeeApproval,
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
