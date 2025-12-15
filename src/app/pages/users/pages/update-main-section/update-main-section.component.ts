import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrganizationDepartmentLookUp } from '@core/models/organization-unit.model';
import { User } from '@core/models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Location } from '@angular/common';
import { LanguageService } from '@core/services/language.service';
import { ManageUsersService } from '@pages/users/services/manage-users.service';

@Component({
  selector: 'app-update-main-section',
  templateUrl: './update-main-section.component.html',
  styleUrls: ['./update-main-section.component.scss'],
})
export class UpdateMainSectionComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  secretaries: User[] = [];
  departments: OrganizationDepartmentLookUp[] = [];
  lang: string = 'ar';

  compareFn = compareFn;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private manageUsersService: ManageUsersService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.lang = this.languageService.language;
    this.elementId = this.activatedRoute.snapshot.params['id'];
    this.intializeDropDownLists();

    if (this.elementId) {
      this.manageUsersService.usersService
        .getUsersList({ pageSize: 1, pageIndex: 0 }, { userId: this.elementId })
        .subscribe({
          next: (res) => {
            this.patchForm({
              id: this.elementId,
              userName: res.data[0]?.name,
              department: res.data[0]?.department,
            });
          },
        });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      userName: new FormControl('', []),
      department: new FormControl('', [Validators.required]),
    });
  }

  intializeDropDownLists(): void {
    this.manageUsersService.organizationUnitsService
      .getDepartmentsForMember(this.elementId)
      .subscribe((res) => {
        this.departments = res;
      });
  }

  patchForm(data: {
    id: string;
    userName: string;
    department: { id: string; title: string; titleEn: string };
  }): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const { id, department } = this.form.value;

    this.manageUsersService.organizationUnitsService
      .updateMainDepartmentForMember(id, department.id)
      .subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.navigateToTablePage();
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

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }
}
