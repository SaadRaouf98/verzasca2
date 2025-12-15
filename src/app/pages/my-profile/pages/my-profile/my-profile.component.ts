import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageMyProfileService } from '@pages/my-profile/services/manage-my-profile.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss'],
})
export class MyProfileComponent implements OnInit {
  private location = inject(Location);
  form!: FormGroup;
  isLoading: boolean = true;
  disableSubmitBtn: boolean = false;
  lang: string = 'ar';
  active = 'top';
  breadcrumbs$ = this.breadcrumbService.breadcrumb$;
  currentBreadcrumb$ = this.breadcrumbService.currentBreadcrumb$;

  constructor(
    private manageMyProfileService: ManageMyProfileService,
    private translateService: TranslateService,
    private toastr: CustomToastrService,
    private langugaeService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService
  ) {}
  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initializeForm();
    this.patchForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      isSMSEnabled: new FormControl('', [Validators.required]),
      isEmailEnabled: new FormControl('', [Validators.required]),
      isRealtimeEnabled: new FormControl('', [Validators.required]),
    });
  }

  patchForm(): void {
    this.manageMyProfileService.notificationPreferencesService
      .getMyNotificationsPreferences()
      .subscribe((res) => {
        this.isLoading = false;
        this.form.patchValue(res);
      });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;

    let { isSMSEnabled, isEmailEnabled, isRealtimeEnabled } = this.form.value;
    this.manageMyProfileService.notificationPreferencesService
      .updateMyNotificationPreference({
        isSMSEnabled,
        isEmailEnabled,
        isRealtimeEnabled,
      })
      .subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.router.navigateByUrl('home');
        },
        error: (err) => {
          this.disableSubmitBtn = false;
          this.toastr.error(this.translateService.instant('shared.SomethingWentWrong'));
        },
      });
  }

  onNavigateBack(): void {
    this.location.back();
  }
}
