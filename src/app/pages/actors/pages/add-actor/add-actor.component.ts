import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { ActorForm } from '@core/models/actor.model';
import { OrganizationDepartmentLookUp } from '@core/models/organization-unit.model';
import { Role } from '@core/models/role.model';
import { User } from '@core/models/user.model';
import { AuthService } from '@core/services/auth/auth.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { LanguageService } from '@core/services/language.service';
import { RolesSearchService } from '@core/services/search-services/roles-search.service';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { TranslateService } from '@ngx-translate/core';
import { ManageActorsService } from '@pages/actors/services/manage-actors.service';
import { CustomAtLeastOneItemSelectedValidator } from '@shared/custom-validators/custom-one-item-selected.validator';
import { FormMode } from '@shared/enums/form-mode.enum';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { of } from 'rxjs';

@Component({
  selector: 'app-add-actor',
  templateUrl: './add-actor.component.html',
  styleUrls: ['./add-actor.component.scss'],
})
export class AddActorComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  secretaries: User[] = [];

  departments: OrganizationDepartmentLookUp[] = [];
  lang: string = 'ar';

  FormMode = FormMode;
  formMode: FormMode = FormMode.View;

  compareFn = compareFn;
  readonly rolesSearchService = inject(RolesSearchService);

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private manageActorsService: ManageActorsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setFormMode();
    this.intializeDropDownLists();

    this.lang = this.languageService.language;
    this.elementId = this.activatedRoute.snapshot.params['id'];

    if (this.elementId) {
      this.manageActorsService.actorsService.getActorById(this.elementId).subscribe({
        next: (res) => {
          this.patchForm({
            id: res.id,
            title: res.title,
            titleEn: res.titleEn,
            description: res.description,
            descriptionEn: res.descriptionEn,
            userIds: res.users,
            roleIds: res.roles,
            departmentIds: res.departments,
            isEditable: res.isEditable || false,
          });

          this.rolesSearchService.rolesList$ = of({
            data: res.roles as Role[],
            totalCount: this.form.value.roleIds.length,
            groupCount: 1, //Doesn't matter this value
          });
        },
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
        userIds: new FormControl('', []),
        roleIds: new FormControl('', []),
        departmentIds: new FormControl('', []),
        isEditable: new FormControl(true, [Validators.required]),
      },
      {
        validators: [CustomAtLeastOneItemSelectedValidator('userIds', 'roleIds', 'departmentIds')],
      }
    );
  }

  intializeDropDownLists(): void {
    this.rolesSearchService.searchOnRoles();

    this.manageActorsService.organizationUnitsService.getOrganizationDepartments().subscribe({
      next: (res) => {
        this.departments = res;
      },
    });
  }

  patchForm(data: ActorForm): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { id, title, titleEn, description, descriptionEn, userIds, roleIds, departmentIds } =
      this.form.value;

    userIds = userIds ? userIds.map((ele: User) => ele.id) : [];
    roleIds = roleIds ? roleIds.map((ele: Role) => ele.id) : [];
    departmentIds = departmentIds
      ? departmentIds.map((ele: OrganizationDepartmentLookUp) => ele.id)
      : [];

    if (this.elementId) {
      this.manageActorsService.actorsService
        .updateActor({
          id,
          title,
          titleEn,
          description,
          descriptionEn,
          userIds,
          roleIds,
          departmentIds,
        })
        .subscribe({
          next: (res) => {
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
            this.navigateToTablePage();
          },
          error: (err) => {
            this.disableSubmitBtn = false;
          },
        });
    } else {
      this.manageActorsService.actorsService
        .addActor({
          title,
          titleEn,
          description,
          descriptionEn,
          userIds,
          roleIds,
          departmentIds,
        })
        .subscribe({
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
      this.form.get('userIds')?.markAsTouched();
    } else {
      this.form.get('userIds')?.markAsUntouched();
    }
  }

  navigateToTablePage(): void {
    this.location.back();
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateActor) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateActor)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}
