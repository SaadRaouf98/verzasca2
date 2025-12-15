import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Entity } from '@core/models/entity.model';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';

import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-container-outcome',
  templateUrl: './add-container-outcome.component.html',
  styleUrls: ['./add-container-outcome.component.scss'],
})
export class AddContainerOutcomeComponent {
  form!: FormGroup;
  elementId: string = '';
  outcomeElement$: Observable<Entity> = new Observable<Entity>();
  lang: string = 'ar';

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
    //
    if (this.elementId) {
      this.outcomeElement$ = this.manageActionsService.outcomesService.getOutcomeById(
        this.elementId
      );
    }
    this.setFormMode();
  }

  onSubmit(data: any): void {
    if (this.elementId) {
      this.manageActionsService.outcomesService.updateOutcome(data).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.navigateToTablePage();
        },
      });
    } else {
      delete data.id;
      this.manageActionsService.outcomesService.addOutcome(data).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));
          this.navigateToTablePage();
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
      'system-management/system-settings/benefit-types'
    );
    */
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateOutcome) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateOutcome)
    ) {
      this.formMode = FormMode.Modify;
    }
  }
}
