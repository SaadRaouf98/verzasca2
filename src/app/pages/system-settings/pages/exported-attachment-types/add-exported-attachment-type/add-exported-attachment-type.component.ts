import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';

import { Location } from '@angular/common';
import { isTouched } from '@shared/helpers/helpers';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { ExportedAttachmentType } from '@core/models/exported-attachment-type.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-exported-attachment-type',
  templateUrl: './add-exported-attachment-type.component.html',
  styleUrls: ['./add-exported-attachment-type.component.scss'],
})
export class AddExportedAttachmentTypeComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';

  FormMode = FormMode;
  formMode: FormMode = FormMode.View;

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
      this.manageActionsService.exportedAttachmentTypesService
        .getExportedAttachmentTypeById(this.elementId)
        .subscribe({
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
      isRequiredNumber: new FormControl(false, [Validators.required]),
    });
  }

  patchForm(data: ExportedAttachmentType): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const { id, title, titleEn, description, descriptionEn, isRequiredNumber } = this.form.value;
    if (this.elementId) {
      this.manageActionsService.exportedAttachmentTypesService
        .updateExportedAttachmentType({
          id,
          title,
          titleEn,
          description,
          descriptionEn,
          isRequiredNumber,
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
      this.manageActionsService.exportedAttachmentTypesService
        .addExportedAttachmentType({
          title,
          titleEn,
          description,
          descriptionEn,
          isRequiredNumber,
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
    this.form.reset();
    this.navigateToTablePage();
  }

  navigateToTablePage(): void {
    this.location.back();
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateExportedAttachmentType) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateExportedAttachmentType)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}
