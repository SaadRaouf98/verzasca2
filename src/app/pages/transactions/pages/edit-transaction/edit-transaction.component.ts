import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Location } from '@angular/common';
import { Observable, of } from 'rxjs';
import { LanguageService } from '@core/services/language.service';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { AllEntities, Entity } from '@core/models/entity.model';
import { TransactionForm } from '@core/models/transaction.model';
import { Priority } from '@core/models/priority.model';
import { Classification } from '@core/models/classification.model';
import { OrganizationUnit } from '@core/models/organization-unit.model';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { ClassificationLevel } from '@core/enums/classification-level.enum';
import { SectorPayload } from '@pages/imports-exports/pages/add-transaction/add-transaction.component';

@Component({
  selector: 'app-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.scss'],
})
export class EditTransactionComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  foundationsList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();
  subFoundationsList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();
  concernedFoundationsList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();
  subSectorsList$: Observable<AllEntities> = new Observable();

  benefitTypesList$: Observable<AllEntities> = new Observable();
  sectorsList$: Observable<AllEntities> = new Observable();
  lang: string = 'ar';
  disableImportButton = true;
  elementId: string = '';
  prioritiesList: Priority[] = [];
  classificationsList: Classification[] = [];
  referralJustificationsList: Entity[] = [];
  organizationUnitsList: OrganizationUnit[] = [];
  showAccessUsers: boolean = false;
  usersList$: Observable<{
    data: { id: string; name: string }[];
    totalCount: number;
  }> = new Observable();
  concernedFoundationsList: { id: string; title: string; titleEn: string }[] = [];
  sectorId = '';
  requestContainerId: string = '';
  subFoundationParentId: string = '';
  compareFn = compareFn;
  transactionNumber: number = 0;
  readonly dropDownProperties = ['id', 'title', 'titleEn'];
  readonly dropDownPropertiesClass = ['id', 'title', 'titleEn', 'classificationLevel'];
  foundationsListArray: any[] = [];
  subFoundationsListArray: any[] = [];
  constructor(
    private location: Location,
    private manageTransactionsService: ManageTransactionsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeDropDownLists();
    this.lang = this.languageService.language;
    this.elementId = this.activatedRoute.snapshot.params['id'];
    if (this.elementId) {
      this.manageTransactionsService.requestContainersService
        .getTransactionById(this.elementId)
        .subscribe({
          next: (res) => {
            this.transactionNumber = res.transactionNumber;
            this.patchForm({
              id: res.id,
              autoNumber: res.autoNumber,
              transactionNumber: res.transactionNumber,
              title: res.title || null,
              description: res.description || null,
              descriptionEn: res.descriptionEn || null,
              foundation: res.foundation.id || null,
              subFoundation: res.subFoundation?.id || null,
              referralJustificationId: res.referralJustification?.id || null,
              concernedFoundations: res.concernedFoundations.map((cf) => cf.id),
              benefitType: res.benefitType?.id || null,
              sector: res.sector?.title || null,
              subSector: res.subSector?.title || null,
              priorityId: res.priority?.id || null,
              classificationId: res.classification?.id || null,
              committeeId: res.committee?.id || null,
              year: res.year,
            });

            if (res.foundation) {
              this.subFoundationParentId = res.foundation.id;
              // Load sub-foundations for the selected foundation
              if (this.subFoundationParentId) {
                this.subFoundationsList$ =
                  this.manageTransactionsService.foundationsService.getFoundationsList(
                    {
                      pageSize: 20,
                      pageIndex: 0,
                    },
                    {
                      parentId: this.subFoundationParentId,
                    },
                    undefined,
                    this.dropDownProperties
                  );

                this.subFoundationsList$.subscribe((res) => {
                  if (res && Array.isArray(res.data)) {
                    this.subFoundationsListArray = res.data;
                  }
                });
              }
              // Don't override foundationsList$ - keep the full list
              // Just patch the form with the selected foundation
              this.form.patchValue({
                foundation: res.foundation.id,
              });
            }

            if (res.users) {
              // Don't override usersList$ - keep the full list
              // Just patch the form with the selected users
              setTimeout(() => {
                this.form.patchValue({
                  users: res.users.map((u: any) => u.id),
                });
              });
            }

            if (res.classification) {
              // Patch the form with the classification ID first
              this.form.patchValue({
                classificationId: res.classification.id,
              });
              // Then call onClassificationChanges to load users and set access flag
              this.onClassificationChanges();
            }
          },
          error: (err) => {
            if (err.status === 403) {
              this.router.navigate(['transactions']);
            }
          },
        });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        id: new FormControl(null, [Validators.required]),
        autoNumber: new FormControl(null, [Validators.required]),
        transactionNumber: new FormControl(null, []),
        title: new FormControl(null, [Validators.required]),
        description: new FormControl(null, []),
        foundation: new FormControl(null, [Validators.required]),
        subFoundation: new FormControl(null, []),
        concernedFoundations: new FormControl(null, [Validators.required]),

        benefitType: new FormControl(null, []),
        sector: new FormControl({ value: null, disabled: true }, []),
        subSector: new FormControl({ value: null, disabled: true }, []),

        committeeId: new FormControl(null, []),
        priorityId: new FormControl(null, [Validators.required]),
        classificationId: new FormControl(null, [Validators.required]),
        users: new FormControl(null, []),
        year: new FormControl(null, []),
        referralJustificationId: new FormControl(null, []),
      },
      {
        validators: this.validateUsersBasedOnClassification(),
      }
    );
  }

  x() {}
  private validateUsersBasedOnClassification(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const usersVal = form.get('users')?.value;
      if (this.showAccessUsers && (!usersVal || usersVal.length === 0)) {
        return {
          usersRequired: true,
        };
      }
      return null;
    };
  }

  patchForm(data: any): void {
    this.form.patchValue(data);
  }

  initializeDropDownLists(): void {
    this.foundationsList$ = this.manageTransactionsService.foundationsService.getFoundationsList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      {
        parentId: null,
      },
      undefined,
      this.dropDownProperties
    );

    this.foundationsList$.subscribe((res) => {
      if (res && Array.isArray(res.data)) {
        this.foundationsListArray = res.data;
      }
    });

    this.subFoundationsList$ = of({ data: [], totalCount: 0 });

    this.concernedFoundationsList$ =
      this.manageTransactionsService.foundationsService.getFoundationsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          parentId: null,
        },
        undefined,
        this.dropDownProperties
      );

    this.concernedFoundationsList$.subscribe((res) => {
      if (res && Array.isArray(res.data)) {
        this.concernedFoundationsList = res.data;
      }
    });

    this.benefitTypesList$ = this.manageTransactionsService.benefitTypesService.getBenefitTypesList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      undefined,
      undefined,
      this.dropDownProperties
    );

    this.benefitTypesList$.subscribe((res) => {
      if (res && Array.isArray(res.data)) {
        // Cache benefit types
      }
    });

    this.sectorsList$ = this.manageTransactionsService.sectorsService.getSectorsList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      {
        parentId: null,
      },
      undefined,
      this.dropDownProperties
    );

    this.sectorsList$.subscribe((res) => {
      if (res && Array.isArray(res.data)) {
        // Cache sectors
      }
    });

    this.manageTransactionsService.classificationsService
      .getClassificationsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        this.dropDownPropertiesClass
      )
      .subscribe((res) => {
        this.classificationsList = res.data;
      });

    this.manageTransactionsService.prioritiesService
      .getPrioritiesList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        this.dropDownProperties
      )
      .subscribe((res) => {
        this.prioritiesList = res.data;
      });

    this.manageTransactionsService.organizationUnitsService
      .getOrganizationUnitsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
        }
      )
      .subscribe((res) => {
        this.organizationUnitsList = res.data;
      });

    this.manageTransactionsService.referralJustificationsService
      .getReferralJustificationsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        this.dropDownProperties
      )
      .subscribe((res) => {
        this.referralJustificationsList = res.data;
      });

    this.usersList$ = this.manageTransactionsService.usersService.getUsersList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      undefined,
      undefined,
      ['id', 'name']
    );

    this.usersList$.subscribe((res) => {
      if (res && Array.isArray(res.data)) {
        // Cache users
      }
    });
  }
  getSectorsByFoundation(): void {
    this.manageTransactionsService.foundationsService
      .getSectorsByFoundationsId(this.form.get('foundation')?.value)
      .subscribe((res) => {
        this.setSector(res);
      });
  }
  setSector(sectorPayload: SectorPayload): void {
    // alert('sadsa')
    const timestamp = new Date().getTime();
    this.form.controls['sector'].setValue(sectorPayload.sector);
    this.form.controls['subSector'].setValue(sectorPayload.subSector);
    this.sectorId = sectorPayload.subSector?.id
      ? sectorPayload.subSector.id
      : sectorPayload.sector?.id;
    setTimeout(() => {}, 2000);
  }

  onSelectedFoundationChanged(): void {
    const foundation = this.form.value.foundation;
    if (!foundation) {
      // Handle clear: reset dependent fields, lists, etc.
      this.onFoundationCleared();
      return;
    }
    if (foundation) {
      this.getSectorsByFoundation();
      //Reset subFoundation field
      this.form.patchValue({
        subFoundation: null,
      });

      this.subFoundationsList$ =
        this.manageTransactionsService.foundationsService.getFoundationsList(
          {
            pageSize: 20,
            pageIndex: 0,
          },
          {
            parentId: foundation,
          },
          undefined,
          this.dropDownProperties
        );

      this.subFoundationsList$.subscribe((res) => {
        if (res && Array.isArray(res.data)) {
          this.subFoundationsListArray = res.data;
        }
      });
    }
  }

  onFoundationCleared(): void {
    //Reset subFoundation field
    this.form.patchValue({
      subFoundation: '',
    });
    this.subFoundationParentId = '';
    this.clearSectors();
    this.subFoundationsList$ = of({ data: [], totalCount: 0, groupCount: -1 });
  }
  clearSectors() {
    this.form.controls['sector'].setValue(null);
    this.form.controls['subSector'].setValue(null);
  }

  onClassificationChanges(): void {
    const classificationId = this.form.get('classificationId')!.value;
    if (!classificationId) {
      this.showAccessUsers = null;
      return;
    }
    // Instead of using res.classificationLevel, get the classification object from the list
    const classificationObj = this.classificationsList.find((c) => c.id === classificationId);
    this.manageTransactionsService.classificationsService
      .getClassificationUsersById(classificationId)
      .subscribe((res) => {
        this.showAccessUsers =
          classificationObj?.classificationLevel === ClassificationLevel.Restricted ? true : false;

        this.usersList$ = of({
          data: res,
          totalCount: res.length,
        });

        this.form.patchValue({
          users: res.map((u) => u.id),
        });
      });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let {
      id,
      title,
      description,
      descriptionEn,
      foundation,
      subFoundation,
      concernedFoundations,
      benefitType,
      sector,
      priorityId,
      classificationId,
      users,
      // committeeId,
      referralJustificationId,
    } = this.form.value;

    this.manageTransactionsService.requestContainersService
      .updateTransaction({
        id,
        title,
        description,
        descriptionEn,
        foundationId: foundation,
        subFoundationId: subFoundation ? subFoundation : null,
        concernedFoundationsIds: concernedFoundations,
        benefitTypeId: benefitType ? benefitType : null,
        sectorId: this.sectorId,
        priorityId,
        classificationId,
        // committeeId: committeeId ? committeeId : null,
        usersIds: users,
        referralJustificationId,
      })
      .subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));
          this.disableImportButton = false;
          this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
  }

  onCancel(): void {
    this.form.reset();
    this.navigateToTablePage();
  }

  navigateToTablePage(): void {
    this.location.back();
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  searchOnFoundations(event: { term: string; items: any[] }) {
    this.foundationsList$ = this.manageTransactionsService.foundationsService.getFoundationsList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        parentId: null,
        searchKeyword: event.term,
      },
      undefined,
      this.dropDownProperties
    );
  }

  searchOnBenefitTypes(event: { term: string; items: any[] }) {
    this.benefitTypesList$ = this.manageTransactionsService.benefitTypesService.getBenefitTypesList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: event.term,
      },
      undefined,
      this.dropDownProperties
    );
  }

  searchOnSectors(event: { term: string; items: any[] }) {
    this.sectorsList$ = this.manageTransactionsService.sectorsService.getSectorsList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        parentId: null,
        searchKeyword: event.term,
      },
      undefined,
      this.dropDownProperties
    );
  }

  onSelectedSectorChanged(): void {
    const sector = this.form.get('sector')?.value;

    if (sector) {
      //Reset subSector field
      this.form.patchValue({
        subSector: '',
      });

      this.subSectorsList$ = this.manageTransactionsService.sectorsService.getSectorsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          parentId: sector.id,
        },
        undefined,
        this.dropDownProperties
      );
    }
  }

  onSectorCleared(): void {
    //Reset subSector field
    this.form.patchValue({
      subSector: '',
    });
    this.subSectorsList$ = of({ data: [], totalCount: 0, groupCount: -1 });
  }

  searchOnSubFoundations(event: { term: string; items: any[] }) {
    if (this.subFoundationParentId) {
      this.subFoundationsList$ =
        this.manageTransactionsService.foundationsService.getFoundationsList(
          {
            pageSize: 10,
            pageIndex: 0,
          },
          {
            parentId: this.subFoundationParentId,
            searchKeyword: event.term,
          },
          undefined,
          this.dropDownProperties
        );
    }
  }

  searchOnConcernedFoundations(event: { term: string; items: any[] }) {
    this.concernedFoundationsList$ =
      this.manageTransactionsService.foundationsService.getFoundationsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          parentId: null,
          searchKeyword: event.term,
        },
        undefined,
        this.dropDownProperties
      );
  }

  searchOnSubSectors(event: { term: string; items: any[] }) {
    const sector = this.form.get('sector')?.value;
    if (sector) {
      this.subSectorsList$ = this.manageTransactionsService.sectorsService.getSectorsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          parentId: sector.id,
          searchKeyword: event.term,
        },
        undefined,
        this.dropDownProperties
      );
    }
  }

  searchOnUsers(event: { term: string; items: any[] }) {
    this.usersList$ = this.manageTransactionsService.usersService.getUsersList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: event.term,
      }
    );
  }

  onSetIfFoundationIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('foundation')?.markAsTouched();
    } else {
      this.form.get('foundation')?.markAsUntouched();
    }
  }

  onSetIfSubFoundationIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('subFoundation')?.markAsTouched();
    } else {
      this.form.get('subFoundation')?.markAsUntouched();
    }
  }

  onSetIfConcernedFoundationsIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('concernedFoundations')?.markAsTouched();
    } else {
      this.form.get('concernedFoundations')?.markAsUntouched();
    }
  }
  goToLastPage(): void {
    this.location.back();
  }
}
