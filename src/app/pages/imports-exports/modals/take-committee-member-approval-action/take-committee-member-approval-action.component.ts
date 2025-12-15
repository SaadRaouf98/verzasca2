import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MemberApprovalType } from '@core/enums/member-approval-type.enum';
import { CommitteeApproval } from '@core/models/request.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched } from '@shared/helpers/helpers';

@Component({
  selector: 'app-take-committee-member-approval-action',
  templateUrl: './take-committee-member-approval-action.component.html',
  styleUrls: ['./take-committee-member-approval-action.component.scss'],
})
export class TakeCommitteeMemberApprovalActionComponent {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;
  MemberApprovalType = MemberApprovalType;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      requestId: string;
      committeeApproval: CommitteeApproval;
    },

    private dialogRef: MatDialogRef<TakeCommitteeMemberApprovalActionComponent>,
    private manageImportsExportsService: ManageImportsExportsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      approval: new FormControl('', [Validators.required]),
      comment: new FormControl('', []),
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { approval, comment } = this.form.value;

    this.manageImportsExportsService.requestsService
      .takeCommitteeApprovalAction(this.data.requestId, this.data.committeeApproval.id, {
        approval,
        comment,
      })
      .subscribe((res) => {
        this.toastr.success(
          this.translateService.instant(
            'ImportsExportsModule.RequestDetailsComponent.doneSuccessfully'
          )
        );

        this.dialogRef.close({
          status: 'Succeeded',
          statusCode: ModalStatusCode.Success,
        });
      });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }
}
