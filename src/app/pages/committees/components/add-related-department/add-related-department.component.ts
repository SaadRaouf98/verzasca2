import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { Entity } from '@core/models/entity.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageCommitteesService } from '@pages/committees/services/manage-committees.service';
import { FormMode } from '@shared/enums/form-mode.enum';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';

import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-add-related-department',
  templateUrl: './add-related-department.component.html',
  styleUrls: ['./add-related-department.component.scss'],
})
export class AddRelatedDepartmentComponent implements OnInit {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  departmentElement$: Observable<Entity> = new Observable<Entity>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      formMode: FormMode;
      header: string;
      employee: { id: string; name: string };
      parentId: string;
      form: {
        id: string;
        title: string;
        titleEn: string;
        description: string;
        descriptionEn: string;
      };
    },
    private dialogRef: MatDialogRef<AddRelatedDepartmentComponent>,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private manageCommitteesService: ManageCommitteesService
  ) {}

  ngOnInit(): void {
    if (this.data.form) {
      this.departmentElement$ = of(this.data.form);
    }
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  onSubmit(data: any): void {
    if (this.data.form) {
      //Edit mode
      this.manageCommitteesService.organizationUnitsService
        .updateOrganizationUnit({
          id: data.id,
          title: data.title,
          titleEn: data.titleEn,
          description: data.description,
          descriptionEn: data.descriptionEn,
          adminId: this.data.employee.id,
          parentId: this.data.parentId,
        })
        .subscribe({
          next: (res) => {
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));

            this.dialogRef.close({
              status: 'Succeeded',
              statusCode: ModalStatusCode.Success,
            });
          },
        });
    } else {
      //Add mode
      this.manageCommitteesService.organizationUnitsService
        .addOrganizationUnit({
          title: data.title,
          titleEn: data.titleEn,
          description: data.description,
          descriptionEn: data.descriptionEn,
          adminId: this.data.employee.id,
          parentId: this.data.parentId,
          type: OrganizationUnitType.Department,
        })
        .subscribe({
          next: (res) => {
            this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));

            this.dialogRef.close({
              status: 'Succeeded',
              statusCode: ModalStatusCode.Success,
            });
          },
        });
    }
  }
}
