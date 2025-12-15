import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { OrganizationUnitForm } from '@core/models/organization-unit.model';
import { AllUsers } from '@core/models/user.model';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { TranslateService } from '@ngx-translate/core';
import { compareFn, isTouched } from '@shared/helpers/helpers';

import { Location } from '@angular/common';
import { ManageSecretarialsService } from '@pages/secretariats/services/manage-secretariats.service';
import { Observable } from 'rxjs';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-secretariat',
  templateUrl: './add-secretariat.component.html',
  styleUrls: ['./add-secretariat.component.scss'],
})
export class AddSecretariatComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  usersList$: Observable<AllUsers> = new Observable();

  compareFn = compareFn;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private manageSecretarialsService: ManageSecretarialsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.intializeDropDownLists();
    /* this.manageSecretarialsService.usersService
      .getUsersList({ pageIndex: 0, pageSize: 100 })
      .subscribe((res) => {
        this.secretaries = res.data;
      }); */

    this.elementId = this.activatedRoute.snapshot.params['id'];

    if (this.elementId) {
      this.manageSecretarialsService.organizationUnitsService
        .getOrganizationUnitById(this.elementId)
        .subscribe({
          next: (res) => {
            this.patchForm({
              id: res.id,
              title: res.title,
              titleEn: res.titleEn,
              description: res.description,
              descriptionEn: res.descriptionEn,
              admin: res.admin,
              parentId: null,
            });
            this.searchOnUsers({ term: res.admin?.name, items: [] });
          },
        });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      title: new FormControl('', [Validators.required, Validators.pattern(arabicRegex)]),
      titleEn: new FormControl('', [Validators.required, Validators.pattern(englishRegex)]),
      description: new FormControl('', [Validators.pattern(arabicRegex)]),
      descriptionEn: new FormControl('', [Validators.pattern(englishRegex)]),
      admin: new FormControl('', [Validators.required]),
    });
  }

  intializeDropDownLists(): void {
    this.usersList$ = this.manageSecretarialsService.usersService.getUsersList({
      pageSize: 20,
      pageIndex: 0,
    });
  }

  patchForm(data: OrganizationUnitForm): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const { id, title, titleEn, description, descriptionEn, admin } = this.form.value;
    if (this.elementId) {
      this.manageSecretarialsService.organizationUnitsService
        .updateOrganizationUnit({
          id,
          title,
          titleEn,
          description,
          descriptionEn,
          adminId: admin?.id,
          parentId: null,
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
      this.manageSecretarialsService.organizationUnitsService
        .addOrganizationUnit({
          title,
          titleEn,
          description,
          descriptionEn,
          adminId: admin?.id,
          parentId: null,
          type: OrganizationUnitType.Secretariate,
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

  navigateToTablePage(): void {
    this.location.back();

    /* this.router.navigateByUrl(
      'system-management/secretarial-structure/secretarials'
    ); */
  }

  searchOnUsers(event: { term: string; items: any[] }) {
    this.usersList$ = this.manageSecretarialsService.usersService.getUsersList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: event.term,
      }
    );
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onClearUser() {
    this.searchOnUsers({ term: '', items: [] });
  }
}
