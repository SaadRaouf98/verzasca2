import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { actionTypes } from '@core/constants/action-types.constant';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { ActionType } from '@core/enums/action-type.enum';
import { TransactionAction } from '@core/models/transaction-action.model';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { FormMode } from '@shared/enums/form-mode.enum';
import { isTouched } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss'],
})
export class AddActionComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  actionTypes: {
    id: ActionType;
    name: string;
    nameAr: string;
    nameEn: string;
  }[] = [];

  lang: string = 'ar';

  FormMode = FormMode;
  formMode: FormMode = FormMode.View;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private manageActionsService: ManageSystemSettingsService,
    private languageService: LanguageService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setFormMode();

    this.elementId = this.activatedRoute.snapshot.params['id'];

    if (this.elementId) {
      this.manageActionsService.actionsService.getActionById(this.elementId).subscribe({
        next: (res) => {
          this.patchForm(res);
        },
      });
    }

    this.actionTypes = actionTypes;

    this.lang = this.languageService.language;
    if (this.lang === 'en') {
      this.actionTypes.map((ele) => (ele.name = ele.nameEn));
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      title: new FormControl('', [Validators.required, Validators.pattern(arabicRegex)]),
      titleEn: new FormControl('', [Validators.required, Validators.pattern(englishRegex)]),
      description: new FormControl('', [Validators.pattern(arabicRegex)]),
      descriptionEn: new FormControl('', [Validators.pattern(englishRegex)]),
      actionType: new FormControl('', [Validators.required]),
    });
  }

  patchForm(data: TransactionAction): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const data = this.form.value;
    if (this.elementId) {
      this.manageActionsService.actionsService.updateAction(data).subscribe({
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
      this.manageActionsService.actionsService.addAction(data).subscribe({
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
    this.router.navigateByUrl('system-management/workflow-design/actions');
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateAction) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateAction)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}
