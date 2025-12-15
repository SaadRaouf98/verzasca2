import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeliveryReceiptAttachmentType } from '@core/enums/delivery-receipt-attachment-type.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { DeliveryReceiptBasicRow } from '@core/models/delivery-receipt.model';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched } from '@shared/helpers/helpers';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-delivery-receipt-form-modal',
  templateUrl: './delivery-receipt-form-modal.component.html',
  styleUrls: ['./delivery-receipt-form-modal.component.scss'],
})
export class DeliveryReceiptFormModalComponent implements OnInit {
  form!: FormGroup;
  ExportedDocumentType = ExportedDocumentType;
  DeliveryReceiptAttachmentType = DeliveryReceiptAttachmentType;
  subFoundationsList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();
  disableSubmitBtn: boolean = false;
  isLoading: boolean = false;

  readonly OtherSubFoundation = 1;
  readonly dropDownProperties = ['id', 'title', 'titleEn'];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: DeliveryReceiptBasicRow,
    private dialogRef: MatDialogRef<DeliveryReceiptFormModalComponent>,
    private manageImportsExportsService: ManageImportsExportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeDropDownLists();
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        id: new FormControl(this.data.id, []),
        attachmentType: new FormControl(this.data.attachmentType, [
          Validators.required,
        ]),
        otherAttachmentType: new FormControl(this.data.otherAttachmentType, []),
        attachments: new FormControl(this.data.attachments, []),
        subFoundation: new FormControl(this.data.subFoundation, [
          // Validators.required,
        ]),
        foundationDescription: new FormControl(
          this.data.foundationDescription,
          []
        ),
      },
      {
        // validators: this.validateForm(),
      }
    );
  }

  private validateForm(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {

      if (
        form.get('attachmentType')?.value &&
        form.get('attachmentType')?.value ===
          DeliveryReceiptAttachmentType.Other &&
        !form.get('otherAttachmentType')?.value
      ) {
        return {
          otherAttachmentTypeRequired: true,
        };
      }

      if (
        form.get('subFoundation')?.value &&
        form.get('subFoundation')?.value === this.OtherSubFoundation && //Other
        !form.get('foundationDescription')?.value
      ) {
        return {
          otherSubFoundationRequired: true,
        };
      }

      //this.cdr.detectChanges();
      return null;
    };
  }

  initializeDropDownLists(): void {
    if (this.data.foundation) {
      this.subFoundationsList$ =
        this.manageImportsExportsService.foundationsService.getFoundationsList(
          {
            pageSize: 20,
            pageIndex: 0,
          },
          {
            parentId: this.data.foundation.id,
          },
          undefined,
          this.dropDownProperties
        );
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: this.form.value,
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

  compareFn(
    obj1: { id: string; name: string; title: string; titleEn: string },
    obj2: { id: string; name: string; title: string; titleEn: string }
  ): boolean {
    return obj1?.id === obj2?.id;
  }
}

