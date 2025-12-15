import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Entity } from '@core/models/entity.model';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { isTouched } from '@shared/helpers/helpers';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { Schema } from '@core/models/schema.model';

@Component({
  selector: 'app-add-workflow-treatment',
  templateUrl: './add-workflow-treatment.component.html',
  styleUrls: ['./add-workflow-treatment.component.scss'],
})
export class AddWorkflowTreatmentComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  workflowTreatmentElement$: Observable<Entity> = new Observable<Entity>();

  formMode: FormMode = FormMode.View;
  FormMode = FormMode;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private manageActionsService: ManageSystemSettingsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setFormMode();

    this.elementId = this.activatedRoute.snapshot.params['id'];
    if (this.elementId) {
      this.manageActionsService.schemasService.getSchemaById(this.elementId).subscribe({
        next: (res) => {
          this.patchForm(res);
        },
      });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      title: new FormControl('', [Validators.required, Validators.pattern(arabicRegex)]),
      titleEn: new FormControl('', [Validators.required, Validators.pattern(englishRegex)]),
      description: new FormControl('', [Validators.pattern(arabicRegex)]),
      descriptionEn: new FormControl('', [Validators.pattern(englishRegex)]),
      isActive: new FormControl(true, [Validators.required]),
    });
  }

  patchForm(data: Schema): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;

    const { id, title, titleEn, description, descriptionEn, isActive } = this.form.value;

    if (this.elementId) {
      this.manageActionsService.schemasService
        .updateSchema({
          id,
          title,
          titleEn,
          description,
          descriptionEn,
          isActive,
        })
        .subscribe({
          next: (res) => {
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
            this.navigateToTablePage();
          },
          error: (err) => {
            this.disableSubmitBtn = false;
          },
        });
    } else {
      this.manageActionsService.schemasService
        .addSchema({
          id,
          title,
          titleEn,
          description,
          descriptionEn,
          isActive,
        })
        .subscribe({
          next: (res) => {
            this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));
            this.navigateToTablePage();
          },
          error: (err) => {
            this.disableSubmitBtn = false;
          },
        });
    }
  }

  onCancel() {
    this.navigateToTablePage();
  }

  navigateToTablePage(): void {
    this.location.back();

    /* this.router.navigateByUrl(
      'system-management/system-settings/workflow-treatments'
    ); */
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateSchemas) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateSchema)
    ) {
      this.formMode = FormMode.Modify;
    }
  }
}
