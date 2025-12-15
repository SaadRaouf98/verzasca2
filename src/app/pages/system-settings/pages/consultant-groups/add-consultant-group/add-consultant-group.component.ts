import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';

import { Location } from '@angular/common';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { FormMode } from '@shared/enums/form-mode.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { ConsultantGroupDetails } from '@core/models/consultant-group.model';
import { Observable, of } from 'rxjs';
import { AllUsers, User } from '@core/models/user.model';
import { ConsultantType } from '@pages/system-settings/modals/consultant-types.modal.enum';
import { UsersService } from '@core/services/backend-services/users.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-consultant-group',
  templateUrl: './add-consultant-group.component.html',
  styleUrls: ['./add-consultant-group.component.scss'],
})
export class AddConsultantGroupComponent implements OnInit {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  FormMode = FormMode;
  formMode: FormMode = FormMode.View;
  public ConsultantType = ConsultantType;
  ConsultantTypeList = [
    {
      title: this.translateService.instant('ConsultantsTypeList.MainConsultant'),
      type: ConsultantType.MainConsultant,
    },
    {
      title: this.translateService.instant('ConsultantsTypeList.CoordinatingSubConsultant'),
      type: ConsultantType.CoordinatingSubConsultant,
    },
    {
      title: this.translateService.instant('ConsultantsTypeList.ParticipatingSubConsultant'),
      type: ConsultantType.ParticipatingSubConsultant,
    },
  ];
  usersList$: Observable<AllUsers> | Observable<{ data: { id: string; name: string }[] }> =
    new Observable();
  usersList: User[] = []; // Full list to display in dropdowns
  allUsersList: User[] = []; // Backup of all users
  availableUsersList: User[] = []; // Filtered list without selected items

  // Track selected consultants by type
  mainConsultants: User[] = [];
  coordinatingSubConsultants: User[] = [];
  participatingSubConsultants: User[] = [];

  compareFn = compareFn;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private manageActionsService: ManageSystemSettingsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    /*     this.intializeDropDownList();
     */ this.setFormMode();
    this.elementId = this.activatedRoute.snapshot.params['id'];

    // Load users first
    this.getUsers();

    // Then load consultant group data if editing
    if (this.elementId) {
      this.manageActionsService.consultantGroupsService
        .getConsultantGroupById(this.elementId)
        .subscribe({
          next: (res) => {
            this.patchForm(res);
          },
        });
    }
  }
  getUsers() {
    this.usersService
      .getUsersList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        ['id', 'name']
      )
      .subscribe({
        next: (res) => {
          this.allUsersList = [...res.data];
          this.usersList = [...res.data]; // Keep full list for dropdown display
          this.availableUsersList = [...res.data]; // This will be filtered

          // If we're editing, update available users after loading all users
          if (this.elementId) {
            this.updateAvailableUsers();
          }
        },
      });
  }
  initializeForm(): void {
    this.form = new FormGroup({
      id: new FormControl('', []),
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
      mainConsultant: new FormControl('', []),
      coordinatingSubConsultants: new FormControl('', []),
      participatingSubConsultants: new FormControl('', []),
      // mainConsultantId: new FormControl('', [Validators.required]),
    });
  }

  get selectedConsultants(): User[] {
    // Return combined list of all selected consultant IDs
    const mainId = this.form?.get('mainConsultant')?.value;
    const coordIds = this.form?.get('coordinatingSubConsultants')?.value || [];
    const partIds = this.form?.get('participatingSubConsultants')?.value || [];

    const allSelectedIds = [...(mainId ? [mainId] : []), ...coordIds, ...partIds];
    return this.allUsersList.filter((user) => allSelectedIds.includes(user.id));
  }

  patchForm(data: ConsultantGroupDetails): void {
    // Separate consultants by type
    const mainCons =
      data.consultants
        ?.filter((c: any) => c.type === ConsultantType.MainConsultant)
        .map((c: any) => c.id) || [];

    const coordSubs =
      data.consultants
        ?.filter((c: any) => c.type === ConsultantType.CoordinatingSubConsultant)
        .map((c: any) => c.id) || [];

    const partSubs =
      data.consultants
        ?.filter((c: any) => c.type === ConsultantType.ParticipatingSubConsultant)
        .map((c: any) => c.id) || [];
    this.form.patchValue({
      id: data.id,
      title: data.title,
      description: data.description,
      mainConsultant: mainCons[0],
      coordinatingSubConsultants: coordSubs,
      participatingSubConsultants: partSubs,
    });
  }

  onSetIfUserIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('consultants')?.markAsTouched();
    } else {
      this.form.get('consultants')?.markAsUntouched();
    }
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    const {
      id,
      title,
      description,
      mainConsultant,
      coordinatingSubConsultants,
      participatingSubConsultants,
    } = this.form.value;

    const mappedConsultants: { id: string; type: ConsultantType }[] = [];

    // Add main consultant
    if (mainConsultant) {
      mappedConsultants.push({
        id: mainConsultant,
        type: ConsultantType.MainConsultant,
      });
    }

    // Add coordinating sub consultants
    if (coordinatingSubConsultants && Array.isArray(coordinatingSubConsultants)) {
      coordinatingSubConsultants.forEach((id: string) => {
        mappedConsultants.push({
          id,
          type: ConsultantType.CoordinatingSubConsultant,
        });
      });
    }

    // Add participating sub consultants
    if (participatingSubConsultants && Array.isArray(participatingSubConsultants)) {
      participatingSubConsultants.forEach((id: string) => {
        mappedConsultants.push({
          id,
          type: ConsultantType.ParticipatingSubConsultant,
        });
      });
    }

    if (this.elementId) {
      this.manageActionsService.consultantGroupsService
        .updateConsultantGroup({
          id,
          title,
          description,
          consultants: mappedConsultants,
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
      this.manageActionsService.consultantGroupsService
        .addConsultantGroup({
          title,
          description,
          consultants: mappedConsultants,
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

    /*     this.router.navigateByUrl('system-management/system-settings/priorities');
     */
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onClearConsultants(): void {
    this.form.patchValue({
      mainConsultantId: '',
    });
  }
  consultants = [];
  onAdd(val: any, type: ConsultantType): void {
    if (!val) return;

    // Track the selection by type
    if (type === ConsultantType.MainConsultant) {
      this.mainConsultants = val ? [val] : [];
    } else if (type === ConsultantType.CoordinatingSubConsultant) {
      this.coordinatingSubConsultants = Array.isArray(val) ? val : val ? [val] : [];
    } else if (type === ConsultantType.ParticipatingSubConsultant) {
      this.participatingSubConsultants = Array.isArray(val) ? val : val ? [val] : [];
    }

    // Update usersList to exclude selected items
    this.updateAvailableUsers();
  }

  // Update the available users list by removing all selected items from other dropdowns
  updateAvailableUsers(): void {
    const selectedIds = new Set<string>();

    // Collect all selected IDs from all three form controls
    const mainConsultantValue = this.form.get('mainConsultant')?.value;
    const coordSubValue = this.form.get('coordinatingSubConsultants')?.value;
    const partSubValue = this.form.get('participatingSubConsultants')?.value;

    // Add ID if it's a string
    if (mainConsultantValue && typeof mainConsultantValue === 'string') {
      selectedIds.add(mainConsultantValue);
    }

    // Add IDs from array
    if (coordSubValue && Array.isArray(coordSubValue)) {
      coordSubValue.forEach((id: string) => selectedIds.add(id));
    }

    // Add IDs from array
    if (partSubValue && Array.isArray(partSubValue)) {
      partSubValue.forEach((id: string) => selectedIds.add(id));
    }

    // Filter the list to exclude selected users from availableUsersList
    this.availableUsersList = this.allUsersList.filter((user) => !selectedIds.has(user.id));
  }
  onRemoveSingleConsultant(event: any): void {
    if (event.id === this.form.get('mainConsultantId')!.value) {
      this.form.patchValue({
        mainConsultantId: '',
      });
    }
    // Update available users when item is removed
    this.updateAvailableUsers();
  }

  onSearchOnUsers(event: { term: string; items: any[] }) {
    this.usersList$ = this.manageActionsService.usersService.getUsersList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: event.term,
      }
    );
  }

  setFormMode(): void {
    if (
      this.authService.userPermissions.includes(PermissionsObj.CreateConsultantGroup) ||
      this.authService.userPermissions.includes(PermissionsObj.UpdateConsultantGroup)
    ) {
      this.formMode = FormMode.Modify;
    } else {
      this.form.disable();
    }
  }
}
