import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';

import { Location } from '@angular/common';
import { isTouched } from '@shared/helpers/helpers';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { FormMode } from '@shared/enums/form-mode.enum';
import { CommitteeSequenceCommand } from '@core/models/committee-sequence.model';
import { CommitteeSequenceFormat } from '@core/enums/committee-sequence-format.enum';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-committee-sequence',
  templateUrl: './add-committee-sequence.component.html',
  styleUrls: ['./add-committee-sequence.component.scss'],
})
export class AddCommitteeSequenceComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';

  FormMode = FormMode;
  formMode: FormMode = FormMode.View;
  CommitteeSequenceFormat = CommitteeSequenceFormat;

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
      this.manageActionsService.committeeSequencesService
        .getCommitteeSequenceById(this.elementId)
        .subscribe({
          next: (res) => {
            this.patchForm({
              id: res.id,
              title: res.title,
              sequenceFormat: res.sequenceFormat,
            });
          },
        });
    } else {
      this.patchForm({
        id: '',
        title: '',
        sequenceFormat: CommitteeSequenceFormat.DateNumber,
      });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      title: new FormControl('', [Validators.required]),
      sequenceFormat: new FormControl('', [Validators.required]),
    });
  }

  patchForm(data: CommitteeSequenceCommand): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const data = this.form.value;
    if (this.elementId) {
      this.manageActionsService.committeeSequencesService.updateCommitteeSequence(data).subscribe({
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
      this.manageActionsService.committeeSequencesService.addCommitteeSequence(data).subscribe({
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
      this.authService.userPermissions.includes(PermissionsObj.CreateOrganizationStructure) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateOrganizationStructure)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}
