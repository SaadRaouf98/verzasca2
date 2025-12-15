import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched } from '@shared/helpers/helpers';

@Component({
  selector: 'app-print-barcode-modal',
  templateUrl: './print-barcode-modal.component.html',
  styleUrls: ['./print-barcode-modal.component.scss'],
})
export class PrintBarcodeModalComponent {
  form!: FormGroup;

  disableSubmitBtn: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      attachmentDescription: string;
    },
    private dialogRef: MatDialogRef<PrintBarcodeModalComponent>
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      attachmentDescription: new FormControl('', []),
    });
    this.form.patchValue({
      attachmentDescription: this.data.attachmentDescription,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.disableSubmitBtn = true;

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: this.form.value,
    });
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }
}
