import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { MemberApprovalType } from '@core/enums/member-approval-type.enum';
import { CommitteeApproval } from '@core/models/request.model';
import { TranslateModule } from '@ngx-translate/core';
import { TakeCommitteeMemberApprovalActionComponent } from '@pages/imports-exports/modals/take-committee-member-approval-action/take-committee-member-approval-action.component';
import { NgxPermissionsModule } from 'ngx-permissions';

@Component({
  selector: 'app-members-approval',
  standalone: true,
  imports: [CommonModule, NgxPermissionsModule, TranslateModule],
  templateUrl: './members-approval.component.html',
  styleUrls: ['./members-approval.component.scss'],
})
export class MembersApprovalComponent {
  PermissionsObj = PermissionsObj;
  @Input() isCommitteeApprovalStep!: boolean;
  @Input() committeeMembersApprovals: any[] = [];
  @Input() requestId!: string;
  MemberApprovalType = MemberApprovalType;

  constructor(private clipboard: Clipboard, private dialog: MatDialog) {}

  onTakeActionViaPhone(committeeApproval: CommitteeApproval): void {
    this.dialog.open(TakeCommitteeMemberApprovalActionComponent, {
      minWidth: '31.25rem',
      maxWidth: '31.25rem',
      maxHeight: '44.3125rem',
      panelClass: 'action-modal',
      autoFocus: false,
      disableClose: true,
      data: {
        requestId: this.requestId,
        committeeApproval: committeeApproval,
      },
    });
  }
}
