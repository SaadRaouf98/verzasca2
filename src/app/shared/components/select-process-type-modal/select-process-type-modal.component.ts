import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { AllOrganizationUnits } from '@core/models/organization-unit.model';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-select-process-type-modal',
  templateUrl: './select-process-type-modal.component.html',
  styleUrls: ['./select-process-type-modal.component.scss'],
})
export class SelectProcessTypeModalComponent {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;
  committeesList$: Observable<AllOrganizationUnits> = new Observable();

  compareFn = compareFn;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      buttonLabel: string;
    },
    private dialogRef: MatDialogRef<SelectProcessTypeModalComponent>,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeDropDownList();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      committee: new FormControl('', [Validators.required]),
      changeReason: new FormControl('', []),
    });
  }

  initializeDropDownList(): void {
    this.committeesList$ =
      this.manageSharedService.organizationUnitsService.getOrganizationUnitsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
        }
      );
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { committee, changeReason } = this.form.value;
    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        committeeId: committee.id,
        changeReason,
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

  searchOnCommittees(event: { term: string; items: any[] }): void {
    this.committeesList$ =
      this.manageSharedService.organizationUnitsService.getOrganizationUnitsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
          searchKeyword: event.term,
        }
      );
  }
}

