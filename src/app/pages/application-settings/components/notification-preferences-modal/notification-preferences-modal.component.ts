import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationPreference } from '@core/models/notification-preference.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageApplicationSettingsService } from '@pages/application-settings/services/manage-application-settings.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isTouched } from '@shared/helpers/helpers';

@Component({
  selector: 'app-notification-preferences-modal',
  templateUrl: './notification-preferences-modal.component.html',
  styleUrls: ['./notification-preferences-modal.component.scss'],
})
export class NotificationPreferencesModalComponent {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      notificationPreferenceItem: NotificationPreference;
    },
    private dialogRef: MatDialogRef<NotificationPreferencesModalComponent>,
    private manageApplicationSettingsService: ManageApplicationSettingsService,
    private translateService: TranslateService,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.patchForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      isSMSEnabled: new FormControl('', [Validators.required]),
      isEmailEnabled: new FormControl('', [Validators.required]),
      isRealtimeEnabled: new FormControl('', [Validators.required]),
    });
  }

  patchForm(): void {
    this.form.patchValue(this.data.notificationPreferenceItem);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { id, name, isSMSEnabled, isEmailEnabled, isRealtimeEnabled } = this.form.value;

    this.manageApplicationSettingsService.notificationPreferencesService
      .updateNotificationUserPreference([
        {
          id,
          name,
          isSMSEnabled,
          isEmailEnabled,
          isRealtimeEnabled,
        },
      ])
      .subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.dialogRef.close({
            status: 'Succeeded',
            statusCode: ModalStatusCode.Success,
          });
        },

        error: (err) => {
          this.disableSubmitBtn = false;
          this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }
}
