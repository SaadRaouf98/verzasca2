import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AllEntities } from '@core/models/entity.model';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-select-benefit-type-modal',
  templateUrl: './select-benefit-type-modal.component.html',
  styleUrls: ['./select-benefit-type-modal.component.scss'],
})
export class SelectBenefitTypeModalComponent {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;
  benefitTypesList$: Observable<AllEntities> = new Observable();

  compareFn = compareFn;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      buttonLabel: string;
    },
    private dialogRef: MatDialogRef<SelectBenefitTypeModalComponent>,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeDropDownList();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      benefitType: new FormControl(null, [Validators.required]),
    });
  }

  initializeDropDownList(): void {
    this.benefitTypesList$ = this.manageSharedService.benefitTypesService.getBenefitTypesList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      undefined,
      undefined,
      ['id', 'title']
    );
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { benefitType } = this.form.value;

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        benefitTypeId: benefitType.id,
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

  searchOnRecommendationTypes(event: { term: string; items: any[] }): void {
    this.benefitTypesList$ =
      this.manageSharedService.recommendationTypesService.getRecommendationTypesList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          searchKeyword: event.term,
        },
        undefined,
        ['id', 'title']
      );
  }
}
