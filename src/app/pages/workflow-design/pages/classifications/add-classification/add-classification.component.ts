import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClassificationDetails } from '@core/models/classification.model';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Location } from '@angular/common';
import { AllUsers } from '@core/models/user.model';
import { Observable } from 'rxjs';
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { CustomItemMustHaveValueValidator } from '@shared/custom-validators/custom-item-must-have-value.validator';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';

@Component({
  selector: 'app-add-classification',
  templateUrl: './add-classification.component.html',
  styleUrls: ['./add-classification.component.scss'],
})
export class AddClassificationComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  usersList$: Observable<AllUsers> = new Observable();
  ClassificationLevel = ClassificationLevel;
  passwordInput: {
    type: 'text' | 'password';
    iconSrc: string;
  } = {
    type: 'password',
    iconSrc: 'assets/icons/eye-opened.png',
  };

  FormMode = FormMode;
  formMode: FormMode = FormMode.View;

  compareFn = compareFn;

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
    this.intializeDropDownList();
    this.elementId = this.activatedRoute.snapshot.params['id'];

    if (this.elementId) {
      this.manageActionsService.classificationsService
        .getClassificationById(this.elementId)
        .subscribe((res) => {
          this.patchForm(res);
        });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        id: new FormControl('', []),
        title: new FormControl('', [Validators.required, Validators.pattern(arabicRegex)]),
        titleEn: new FormControl('', [Validators.required, Validators.pattern(englishRegex)]),
        description: new FormControl('', [Validators.pattern(arabicRegex)]),
        descriptionEn: new FormControl('', [Validators.pattern(englishRegex)]),
        classificationLevel: new FormControl('', [Validators.required]),
        isActive: new FormControl(true, [Validators.required]),
        users: new FormControl('', []),
        password: new FormControl('', []),
      },
      {
        validators: [
          CustomItemMustHaveValueValidator(
            'users',
            'classificationLevel',
            ClassificationLevel.Restricted
          ),
          CustomItemMustHaveValueValidator(
            'password',
            'classificationLevel',
            ClassificationLevel.Restricted
          ),
          this.customPasswordValidator(),
        ],
      }
    );
  }

  intializeDropDownList(): void {
    this.usersList$ = this.manageActionsService.usersService.getUsersList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      undefined,
      undefined,
      ['id', 'name']
    );
  }

  customPasswordValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const passwordValue = form.get('password')?.value;
      if (form.get('classificationLevel')?.value === ClassificationLevel.Unrestricted) {
        return null;
      }

      if (
        !passwordValue ||
        passwordValue.length < 10 ||
        !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(passwordValue)
      ) {
        return { passwordValidation: true };
      }

      return null;
    };
  }

  onTogglePassword() {
    if (this.passwordInput.type === 'password') {
      this.passwordInput.type = 'text';
      this.passwordInput.iconSrc = 'assets/icons/eye-closed.png';
    } else {
      this.passwordInput.type = 'password';
      this.passwordInput.iconSrc = 'assets/icons/eye-opened.png';
    }
  }

  patchForm(data: ClassificationDetails): void {
    const {
      id,
      title,
      titleEn,
      description,
      descriptionEn,
      isActive,
      classificationLevel,
      password,
      classifiedUsers,
    } = data;

    this.form.patchValue({
      id,
      title,
      titleEn,
      description,
      descriptionEn,
      isActive,
      classificationLevel,
      users: classifiedUsers,
      password,
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const {
      id,
      title,
      titleEn,
      description,
      descriptionEn,
      classificationLevel,
      isActive,
      users,
      password,
    } = this.form.value;

    const dataToSend = {
      id,
      title,
      titleEn,
      description,
      descriptionEn,
      classificationLevel,
      isActive,
      usersId: users ? users.map((ele: { id: string; name: string }) => ele.id) : [],
      password,
    };

    if (this.elementId) {
      this.manageActionsService.classificationsService.updateClassification(dataToSend).subscribe({
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

      this.manageActionsService.classificationsService.addClassification(dataToSend).subscribe({
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

  onSetIfUserIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('users')?.markAsTouched();
    } else {
      this.form.get('users')?.markAsUntouched();
    }
  }

  navigateToTablePage(): void {
    this.location.back();

    /*  this.router.navigateByUrl(
      'system-management/system-settings/classifications'
    ); */
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  searchOnUsers(event: { term: string; items: any[] }) {
    this.usersList$ = this.manageActionsService.usersService.getUsersList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: event.term,
      }
    );
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateClassification) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateClassification)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}
