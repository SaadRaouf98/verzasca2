import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { RequestStep } from '@core/models/request.model';
import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-reset-request-modal',
  templateUrl: './reset-request-modal.component.html',
  styleUrls: ['./reset-request-modal.component.scss'],
})
export class ResetRequestModalComponent {
  previousRequestSteps: RequestStep[] = [];

  disableSubmitBtn: boolean = false;
  isLoading: boolean = false;
  lang: string = 'ar';

  // Helper to check if delete-all checkbox is selected
  isDeleteAllChecked: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      requestId: string;
    },
    private dialogRef: MatDialogRef<ResetRequestModalComponent>,
    private manageImportsExportsService: ManageImportsExportsService,
    private langugaeService: LanguageService,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.getPreviousRequestSteps();
    this.disableSubmitBtn = true;
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  getPreviousRequestSteps(): void {
    this.isLoading = true;
    this.manageImportsExportsService.requestsService
      .getPreviousRequestSteps(this.data.requestId)
      .subscribe((res) => {
        this.isLoading = false;
        this.previousRequestSteps = res;
      });
  }

  onSelect(step: RequestStep, check: boolean): void {
    // Only allow one checkbox to be selected at a time
    this.previousRequestSteps.forEach((ele) => {
      ele.checked = false;
    });
    step.checked = check;
    // Enable button if selected, disable if not
    if (check) {
      this.disableSubmitBtn = false;
    } else {
      this.disableSubmitBtn = true;
    }
    // Also, if delete-all is checked, uncheck it
    if (this.isDeleteAllChecked && check) {
      this.isDeleteAllChecked = false;
    }
  }

  onDeleteAllCheckboxChange(checked: boolean) {
    this.isDeleteAllChecked = checked;
    if (checked) {
      this.disableSubmitBtn = false;
      this.previousRequestSteps.forEach((ele) => {
        ele.checked = false;
      });
    } else {
      this.disableSubmitBtn = true;
    }
  }

  resetRequest(): void {
    this.disableSubmitBtn = true;
    if (this.isDeleteAllChecked) {
      this.onCancelAllSteps();
      return;
    }
    const selectedStep = this.previousRequestSteps.find((ele) => ele.checked);
    if (!selectedStep) {
      this.toastr.error('عفوا، يجب اختيار خطوة');
      return;
    }
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        selectedStepId: selectedStep.id,
        type: 'reset',
      },
    });
  }

  onCancelAllSteps(): void {
    this.disableSubmitBtn = true;

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        type: 'cancelAllSteps',
      },
    });
  }

  hasUserChosenRequest(): boolean {
    return this.previousRequestSteps.find((ele) => ele.checked) ? true : false;
  }
}
