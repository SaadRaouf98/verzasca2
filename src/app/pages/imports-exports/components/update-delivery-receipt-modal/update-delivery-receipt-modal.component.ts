import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched } from '@shared/helpers/helpers';
import moment from 'moment';

@Component({
  selector: 'app-update-delivery-receipt-modal',
  templateUrl: './update-delivery-receipt-modal.component.html',
  styleUrls: ['./update-delivery-receipt-modal.component.scss'],
})
export class UpdateDeliveryReceiptModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      receiptId: string;
      deliveryDate: string;
    },
    private dialogRef: MatDialogRef<UpdateDeliveryReceiptModalComponent>,
    private manageImportsExportsService: ManageImportsExportsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      receiptId: new FormControl(this.data.receiptId, [Validators.required]),
      deliveryDate: new FormControl(this.data.deliveryDate, [Validators.required]),
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { receiptId, deliveryDate } = this.form.value;

    //deliveryDate = new Date(deliveryDate);
    this.manageImportsExportsService.deliveryReceiptsService
      .updateDeliveryReceiptDate(receiptId, moment(deliveryDate).format('yyyy-MM-DD'))
      .subscribe({
        next: (res) => {
          this.disableSubmitBtn = false;
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
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
