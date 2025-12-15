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
import { ManageCommitteesService } from '@pages/committees/services/manage-committees.service';
import { Observable } from 'rxjs';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-internal-department-division',
  templateUrl: './add-internal-department-division.component.html',
  styleUrls: ['./add-internal-department-division.component.scss'],
})
export class AddInternalDepartmentDivisionComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  parentId: string = '';
  elementId: string = '';
  usersList$: Observable<AllUsers> = new Observable();

  compareFn = compareFn;

  constructor(
    private activatedRoute: ActivatedRoute,
    private manageCommitteesService: ManageCommitteesService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.parentId = this.activatedRoute.snapshot.params['committeeId'];
    this.elementId = this.activatedRoute.snapshot.params['id'];

    if (this.elementId) {
      this.manageCommitteesService.organizationUnitsService
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
              parentId: res.parentId,
            });
          },
        });
    } else {
      this.patchForm({
        id: '',
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        admin: undefined,
        parentId: this.parentId,
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
      parentId: new FormControl('', [Validators.required]),
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
      this.manageCommitteesService.organizationUnitsService
        .updateOrganizationUnit({
          id,
          title,
          titleEn,
          description,
          descriptionEn,
          adminId: admin?.id,
          parentId: this.parentId,
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
      this.manageCommitteesService.organizationUnitsService
        .addOrganizationUnit({
          title,
          titleEn,
          description,
          descriptionEn,
          adminId: admin?.id,
          parentId: this.parentId,
          type: OrganizationUnitType.Department,
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
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onSetIfAdminIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('admin')?.markAsTouched();
    } else {
      this.form.get('admin')?.markAsUntouched();
    }
  }
}
