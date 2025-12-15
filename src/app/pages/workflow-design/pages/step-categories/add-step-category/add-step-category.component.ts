import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
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

@Component({
  selector: 'app-add-step-category',
  templateUrl: './add-step-category.component.html',
  styleUrls: ['./add-step-category.component.scss'],
})
export class AddStepCategoryComponent {
  form!: FormGroup;
  elementId: string = '';
  stepCategoryElement$: Observable<Entity> = new Observable<Entity>();

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
    this.elementId = this.activatedRoute.snapshot.params['id'];
    if (this.elementId) {
      this.stepCategoryElement$ =
        this.manageActionsService.stepCategoriesService.getStepCategoryById(this.elementId);
    }
    this.setFormMode();
  }

  onSubmit(data: any): void {
    if (this.elementId) {
      this.manageActionsService.stepCategoriesService.updateStepCategory(data).subscribe((res) => {
        this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
        this.navigateToTablePage();
      });
    } else {
      delete data.id;
      this.manageActionsService.stepCategoriesService.addStepCategory(data).subscribe((res) => {
        this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));
        this.navigateToTablePage();
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

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateStepCategory) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateStepCategory)
    ) {
      this.formMode = FormMode.Modify;
    }
  }
}
