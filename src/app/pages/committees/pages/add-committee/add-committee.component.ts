import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { UpdateOrganizationUnitCommand } from '@core/models/organization-unit.model';
import { arabicRegex, englishRegex } from '@core/utils/regex';
import { TranslateService } from '@ngx-translate/core';
import { isTouched } from '@shared/helpers/helpers';

import { Location } from '@angular/common';
import { ManageCommitteesService } from '@pages/committees/services/manage-committees.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-committee',
  templateUrl: './add-committee.component.html',
  styleUrls: ['./add-committee.component.scss'],
})
export class AddCommitteeComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  sequencesList: { id: string; title: string }[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private manageCommitteesService: ManageCommitteesService,
    private toastr: CustomToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeDropDownLists();

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
              adminId: res.admin?.id,
              parentId: null,
              committeeSymbol: res.committeeSymbol!,
              committeeSequenceId: res.committeeSequence?.id,
              recordCompletionTimeInHours: res.recordCompletionTimeInHours!,
              recordPhoneApprovalsLimit: res.recordPhoneApprovalsLimit!,
            });
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
      committeeSymbol: new FormControl('', [Validators.required]),
      committeeSequenceId: new FormControl('', [Validators.required]),
      recordCompletionTimeInHours: new FormControl(24, [Validators.required, Validators.min(1)]),
      recordPhoneApprovalsLimit: new FormControl(null),
    });
  }

  initializeDropDownLists(): void {
    this.manageCommitteesService.committeeSequencesService
      .getCommitteeSequencesList({
        pageIndex: 0,
        pageSize: 100,
      })
      .subscribe({
        next: (res) => {
          this.sequencesList = res.data;
        },
      });
  }

  patchForm(data: UpdateOrganizationUnitCommand): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const {
      id,
      title,
      titleEn,
      description,
      descriptionEn,
      adminId,
      committeeSymbol,
      committeeSequenceId,
      recordCompletionTimeInHours,
      recordPhoneApprovalsLimit,
    } = this.form.value;
    if (this.elementId) {
      this.manageCommitteesService.organizationUnitsService
        .updateOrganizationUnit({
          id,
          title,
          titleEn,
          description,
          descriptionEn,
          adminId: null,
          parentId: null,
          committeeSymbol,
          committeeSequenceId,
          recordCompletionTimeInHours,
          recordPhoneApprovalsLimit,
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
          adminId: null,
          parentId: null,
          type: OrganizationUnitType.Committee,
          committeeSymbol,
          committeeSequenceId,
          recordCompletionTimeInHours,
          recordPhoneApprovalsLimit,
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
}
