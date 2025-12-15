import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched } from '@shared/helpers/helpers';

@Component({
  selector: 'app-title-modal',
  templateUrl: './title-modal.component.html',
  styleUrls: ['./title-modal.component.scss'],
})
export class TitleModalComponent {
  form!: FormGroup;
  lang: string = 'ar';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { label: string; title: string },
    private dialogRef: MatDialogRef<TitleModalComponent>
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.data.title) {
      this.form.setValue({ title: this.data.title });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close({
        status: 'Succeed',
        statusCode: ModalStatusCode.Success,
        data: {
          title: this.form.value.title,
        },
      });
    }
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
