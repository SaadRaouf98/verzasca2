import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Location } from '@angular/common';
import { isTouched } from '@shared/helpers/helpers';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { Priority } from '@core/models/priority.model';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';

@Component({
  selector: 'app-add-priority',
  templateUrl: './add-priority.component.html',
  styleUrls: ['./add-priority.component.scss'],
})
export class AddPriorityPage {
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
    //
    if (this.elementId) {
      this.manageActionsService.prioritiesService.getPriorityById(this.elementId).subscribe({
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
      duration: new FormControl('', [Validators.required, Validators.min(1)]),
    });
  }

  patchForm(data: Priority): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const data = this.form.value;
    if (this.elementId) {
      this.manageActionsService.prioritiesService.updatePriority(data).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
    } else {
      delete data.id;
      this.manageActionsService.prioritiesService.addPriority(data).subscribe({
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

    /*     this.router.navigateByUrl('system-management/system-settings/priorities');
     */
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreatePriority) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdatePriority)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}
