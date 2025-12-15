import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Location } from '@angular/common';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { FoundationCommand } from '@core/models/foundation.model';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { Observable, of } from 'rxjs';
import { AllEntities } from '@core/models/entity.model';

@Component({
  selector: 'app-add-foundation',
  templateUrl: './add-foundation.component.html',
  styleUrls: ['./add-foundation.component.scss'],
})
export class AddFoundationPage {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  parentId: string = '';
  elementId: string = '';
  parentName: string = '';

  FormMode = FormMode;
  formMode: FormMode = FormMode.View;
  sectorsList$: Observable<AllEntities> = new Observable();
  subSectorsList$: Observable<AllEntities> = new Observable();
  compareFn = compareFn;

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
    this.initializeDropDownLists();

    this.parentId = this.activatedRoute.snapshot.params['foundationId'];
    this.parentName = this.activatedRoute.snapshot.queryParams['parentName'];
    this.elementId = this.activatedRoute.snapshot.params['id'];

    if (this.elementId) {
      this.manageActionsService.foundationsService.getFoundationById(this.elementId).subscribe({
        next: (res) => {
          this.patchForm({
            id: res.id,
            title: res.title,
            titleEn: res.titleEn,
            description: res.description,
            descriptionEn: res.descriptionEn,
            parentId: this.parentId,
            sector: res.sector,
            subSector: res.subSector,
          });
          if (res.sector) {
            this.subSectorsList$ = this.manageActionsService.sectorsService.getSectorsList(
              {
                pageSize: 1000,
                pageIndex: 0,
              },
              {
                parentId: res.sector.id,
              },
              undefined,
              ['id', 'title']
            );
          }
        },
      });
    } else {
      this.patchForm({
        id: '',
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        parentId: this.parentId,
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
        sector: new FormControl('', []),
        subSector: new FormControl('', []),
        parentId: new FormControl('', []),
      },
      {
        validators: [this.customParentIdValidator(), this.validateSectors()],
      }
    );
  }

  customParentIdValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      if (this.parentId && !form.get('parentId')?.value) {
        return {
          parentIdRequired: true,
        };
      }
      return null;
    };
  }

  validateSectors(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      if (!this.parentId && !form.get('sector')?.value) {
        return {
          sectorRequired: true,
        };
      }
      return null;
    };
  }

  initializeDropDownLists(): void {
    this.sectorsList$ = this.manageActionsService.sectorsService.getSectorsList(
      {
        pageSize: 100,
        pageIndex: 0,
      },
      {
        parentId: null,
      },
      undefined,
      ['id', 'title']
    );
  }
  patchForm(data: FoundationCommand): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const data = this.form.value;
    if (!this.parentId) {
      data.sectorId = this.form.value.subSector
        ? this.form.value.subSector.id
        : this.form.value.sector.id;
    }
    delete data.sector;
    delete data.subSector;

    if (this.elementId) {
      this.manageActionsService.foundationsService.updateFoundation(data).subscribe({
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
      this.manageActionsService.foundationsService.addFoundation(data).subscribe({
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

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateFoundation) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateFoundation)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }

  searchOnSectors(event: { term: string; items: any[] }) {
    this.sectorsList$ = this.manageActionsService.sectorsService.getSectorsList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        parentId: null,
        searchKeyword: event.term,
      },
      undefined,
      ['id', 'title']
    );
  }

  onSelectedSectorChanged(): void {
    const { sector } = this.form.value;

    if (sector) {
      //Reset subSector field
      this.form.patchValue({
        subSector: '',
      });

      this.subSectorsList$ = this.manageActionsService.sectorsService.getSectorsList(
        {
          pageSize: 1000,
          pageIndex: 0,
        },
        {
          parentId: sector.id,
        },
        undefined,
        ['id', 'title']
      );
    }
  }

  onSectorCleared(): void {
    //Reset subSector field
    this.form.patchValue({
      subSector: '',
    });

    this.subSectorsList$ = of({ data: [], totalCount: 0, groupCount: 0 });
  }
}
