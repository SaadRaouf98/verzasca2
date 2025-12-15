import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExportableDocumentActionType } from '@core/enums/exportable-document-action-type.enum';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageRecordsService } from '@pages/manage-records/services/manage-records.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched } from '@shared/helpers/helpers';

@Component({
  selector: 'app-take-action-modal',
  templateUrl: './take-action-modal.component.html',
  styleUrls: ['./take-action-modal.component.scss'],
})
export class TakeActionModalComponent {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;
  ExportableDocumentActionType = ExportableDocumentActionType;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      recordId: string;
      memberId: string;
    },

    private dialogRef: MatDialogRef<TakeActionModalComponent>,
    private manageRecordsService: ManageRecordsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        actionType: new FormControl('', [Validators.required]),
        comment: new FormControl('', []),
      },
      {
        validators: this.validateComment(),
      }
    );
  }

  private validateComment(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const actionType = form.get('actionType')?.value;
      const comment = form.get('comment')?.value;

      if (actionType && actionType === this.ExportableDocumentActionType.Conservatism && !comment) {
        return {
          commentRequired: true,
        };
      }

      return null;
    };
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { actionType, comment } = this.form.value;

    this.manageRecordsService.recordsService
      .takeActionViaPhone(this.data.recordId, this.data.memberId, actionType, comment)
      .subscribe({
        next: (res) => {
          this.toastr.success(
            this.translateService.instant(
              'ImportsExportsModule.RequestDetailsComponent.doneSuccessfully'
            )
          );

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
