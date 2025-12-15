import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UpdateTransactionAmountsCommand } from '@core/models/transaction.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched } from '@shared/helpers/helpers';

@Component({
  selector: 'app-edit-amounts-modal',
  templateUrl: './edit-amounts-modal.component.html',
  styleUrls: ['./edit-amounts-modal.component.scss'],
})
export class EditAmountsModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      amounts: UpdateTransactionAmountsCommand;
    },
    private dialogRef: MatDialogRef<EditAmountsModalComponent>,
    private toastr: CustomToastrService,
    private manageTransactionsService: ManageTransactionsService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    //
    this.initializeForm();
    this.patchForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', [Validators.required]),
      costsRequestedAmount: new FormControl('', [Validators.required]),
      creditsRequestedAmount: new FormControl('', [Validators.required]),
      costsApprovedAmount: new FormControl('', [Validators.required]),
      creditsApprovedAmount: new FormControl('', [Validators.required]),
    });
  }

  patchForm(): void {
    const {
      id,
      costsRequestedAmount,
      creditsRequestedAmount,
      costsApprovedAmount,
      creditsApprovedAmount,
    } = this.data.amounts;
    this.form.patchValue({
      id,
      costsRequestedAmount,
      creditsRequestedAmount,
      costsApprovedAmount,
      creditsApprovedAmount,
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let {
      id,
      creditsRequestedAmount,
      creditsApprovedAmount,
      costsRequestedAmount,
      costsApprovedAmount,
    } = this.form.value;
    this.manageTransactionsService.requestContainersService
      .updateTransactionAmounts({
        id,
        creditsRequestedAmount,
        creditsApprovedAmount,
        costsRequestedAmount,
        costsApprovedAmount,
      })
      .subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));
          this.disableSubmitBtn = true;
          this.dialogRef.close({
            status: 'Succeeded',
            statusCode: ModalStatusCode.Success,
          });
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
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
