import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';

import { Location } from '@angular/common';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { SectorCommand } from '@core/models/sector.model';
import { isTouched } from '@shared/helpers/helpers';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { FormMode } from '@shared/enums/form-mode.enum';

@Component({
  selector: 'app-add-sector',
  templateUrl: './add-sector.component.html',
  styleUrls: ['./add-sector.component.scss'],
})
export class AddSectorPage implements OnInit {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  parentId: string = '';
  elementId: string = '';
  parentName: string = '';

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
    this.parentId = this.activatedRoute.snapshot.params['sectorId'];
    this.parentName = this.activatedRoute.snapshot.queryParams['parentName'];
    this.elementId = this.activatedRoute.snapshot.params['id'];

    if (this.elementId) {
      this.manageActionsService.sectorsService.getSectorById(this.elementId).subscribe((res) => {
        this.patchForm({
          id: res.id,
          title: res.title,
          titleEn: res.titleEn,
          description: res.description,
          descriptionEn: res.descriptionEn,
          parentId: this.parentId,
        });
      });
    } else {
      this.patchForm({
        id: '',
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        parentId: this.parentId,
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
        parentId: new FormControl('', []),
      },
      {
        validators: [this.customParentIdValidator()],
      }
    );
  }

  customParentIdValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      if (this.parentId && !form.get('parentId')?.value) {
        return {
          parentIdRequired: true,
        };
      }

      return null;
    };
  }

  patchForm(data: SectorCommand): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const data = this.form.value;
    if (this.elementId) {
      this.manageActionsService.sectorsService.updateSector(data).subscribe({
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
      this.manageActionsService.sectorsService.addSector(data).subscribe({
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
      this.authService.userPermissions.includes(PermissionsObj.CreateSector) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateSector)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}
