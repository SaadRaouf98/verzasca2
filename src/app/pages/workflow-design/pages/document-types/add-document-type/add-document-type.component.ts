import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Location } from '@angular/common';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { isTouched } from '@shared/helpers/helpers';
import { Documenttype } from '@core/models/document-type.model';

@Component({
  selector: 'app-add-document-type',
  templateUrl: './add-document-type.component.html',
  styleUrls: ['./add-document-type.component.scss'],
})
export class AddDocumentTypeComponent {
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
      this.manageActionsService.documentTypesService
        .getDocumentTypeById(this.elementId)
        .subscribe((res) => {
          this.patchForm(res);
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
      isSystematic: new FormControl(true, [Validators.required]),
    });
  }

  patchForm(data: Documenttype): void {
    const { id, title, titleEn, description, descriptionEn, isSystematic } = data;

    this.form.patchValue({
      id,
      title,
      titleEn,
      description,
      descriptionEn,
      isSystematic,
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
    }
    this.disableSubmitBtn = true;
    const { id, title, titleEn, description, descriptionEn, isSystematic } = this.form.value;

    const dataToSend = {
      id,
      title,
      titleEn,
      description,
      descriptionEn,
      isSystematic,
    };

    if (this.elementId) {
      this.manageActionsService.documentTypesService.updateDocumentType(dataToSend).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
    } else {
      delete dataToSend.id;
      this.manageActionsService.documentTypesService.addDocumentType(dataToSend).subscribe({
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

    /*     this.router.navigateByUrl(
      'system-management/system-settings/step-categories'
    ); */
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateDocumentType) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateDocumentType)
    ) {
      this.formMode = FormMode.Modify;
    }
  }
}
