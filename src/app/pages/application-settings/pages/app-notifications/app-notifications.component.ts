import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { NotificationCategory } from '@core/enums/notification-category.enum';
import { LanguageService } from '@core/services/language.service';
import { ManageApplicationSettingsService } from '@pages/application-settings/services/manage-application-settings.service';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { UsersSearchService } from '@core/services/search-services/users-search.service';
import { compareFn } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-app-notifications',
  templateUrl: './app-notifications.component.html',
  styleUrls: ['./app-notifications.component.scss'],
})
export class AppNotificationsComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  isLoadingData: boolean = true;

  NotificationCategory = NotificationCategory;
  lang: string = 'ar';
  PermissionsObj = PermissionsObj;

  compareFn = compareFn;
  readonly usersSearchService = inject(UsersSearchService);

  constructor(
    private langugaeService: LanguageService,
    private manageApplicationSettingsService: ManageApplicationSettingsService,
    private location: Location,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initializeForm();
    this.intializeDropDownList();
    this.initializePageData();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      categoryId: new FormControl(NotificationCategory.Requests, [Validators.required]),
      users: new FormControl('', []),
    });
  }

  initializePageData(): void {
    this.isLoadingData = true;
    const { categoryId } = this.form.value;
    this.manageApplicationSettingsService.notificationCategoriesService
      .getCategoryUsers(categoryId)
      .subscribe({
        next: (res) => {
          this.isLoadingData = false;
          this.form.patchValue({
            users: res.data,
          });
        },
      });
  }

  intializeDropDownList(): void {
    this.usersSearchService.searchOnUsers();
  }

  onSelectedCategoryChanges(e: MatRadioChange) {
    this.initializePageData();
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { categoryId, users } = this.form.value;
    this.manageApplicationSettingsService.notificationCategoriesService
      .updateCategoryUsers({
        category: categoryId,
        usersIds: users.map((ele: { id: string; name: string }) => ele.id) || [],
      })
      .subscribe({
        next: (res) => {
          this.disableSubmitBtn = false;
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          //this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
  }

  onCancel() {
    this.form.reset();
    this.navigateToTablePage();
  }

  navigateToTablePage(): void {
    this.location.back();
  }
}
