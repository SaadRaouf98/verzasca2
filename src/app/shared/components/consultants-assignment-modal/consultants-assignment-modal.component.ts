import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AllConsultantGroups } from '@core/models/consultant-group.model';
import { AllUsers, User } from '@core/models/user.model';
import { ConsultantType } from '@pages/system-settings/modals/consultant-types.modal.enum';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import {
  compareFn,
  isTouched,
  removeSpecialCharacters,
} from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-consultants-assignment-modal',
  templateUrl: './consultants-assignment-modal.component.html',
  styleUrls: ['./consultants-assignment-modal.component.scss'],
})
export class ConsultantsAssignmentModalComponent implements OnInit {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;
  consultanGroupsList$: Observable<AllConsultantGroups> = new Observable();
  usersList$: Observable<{
    data: {
      id: string;
      name: string;
      isMain?: boolean;
    }[];
    totalCount: number;
    groupCount: number;
  }> = new Observable();

  usersList: User[] = [];
  mainConsultantList: User[] = [];
  coordinatingSubList: User[] = [];
  participatingSubList: User[] = [];

  compareFn = compareFn;

  constructor(
    private dialogRef: MatDialogRef<ConsultantsAssignmentModalComponent>,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.intializeDropDownList();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      consultantGroup: new FormControl(null, []),
      // consultants: new FormControl('', [
      //   Validators.required,
      //   Validators.min(1),
      // ]),
      // mainConsultantId: new FormControl('', [Validators.required]),

      mainConsultant: new FormControl(null, [Validators.required]),
      coordinatingSubConsultants: new FormControl(null),
      participatingSubConsultants: new FormControl(null),
    });
  }

  intializeDropDownList(): void {
    this.consultanGroupsList$ =
      this.manageSharedService.consultantGroupsService.getConsultantGroupsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        undefined,
        undefined,
        ['id', 'title']
      );

    this.usersList$ = this.manageSharedService.usersService
      .getUsersList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        undefined,
        undefined
        // ['id', 'name']
      )
      .pipe(
        tap((res) => {
          if (res && res.data) {
            this.usersList = res.data as User[];
            // Initialize all lists with full usersList
            this.mainConsultantList = this.usersList;
            this.coordinatingSubList = this.usersList;
            this.participatingSubList = this.usersList;
          }
        })
      );
  }

  updateAvailableUsers(): void {
    const selectedMainConsultant = this.form.get('mainConsultant')?.value;
    const selectedCoordinating =
      this.form.get('coordinatingSubConsultants')?.value || [];
    const selectedParticipating =
      this.form.get('participatingSubConsultants')?.value || [];

    const selectedIds = new Set<string>([
      ...(selectedMainConsultant ? [selectedMainConsultant] : []),
      ...(Array.isArray(selectedCoordinating) ? selectedCoordinating : []),
      ...(Array.isArray(selectedParticipating) ? selectedParticipating : []),
    ]);

    // Main consultant list: exclude coordinating and participating
    this.mainConsultantList = this.usersList.filter(
      (u) =>
        !selectedCoordinating.includes(u.id) &&
        !selectedParticipating.includes(u.id)
    );

    // Coordinating sub list: exclude main and participating
    this.coordinatingSubList = this.usersList.filter(
      (u) =>
        u.id !== selectedMainConsultant && !selectedParticipating.includes(u.id)
    );

    // Participating sub list: exclude main and coordinating
    this.participatingSubList = this.usersList.filter(
      (u) =>
        u.id !== selectedMainConsultant && !selectedCoordinating.includes(u.id)
    );
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.disableSubmitBtn = true;
    const {
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
    if (
      coordinatingSubConsultants &&
      Array.isArray(coordinatingSubConsultants)
    ) {
      coordinatingSubConsultants.forEach((id: string) => {
        mappedConsultants.push({
          id,
          type: ConsultantType.CoordinatingSubConsultant,
        });
      });
    }

    // Add participating sub consultants
    if (
      participatingSubConsultants &&
      Array.isArray(participatingSubConsultants)
    ) {
      participatingSubConsultants.forEach((id: string) => {
        mappedConsultants.push({
          id,
          type: ConsultantType.ParticipatingSubConsultant,
        });
      });
    }

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        ConsultantsIds: mappedConsultants,
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onSelectConsultantGroup(): void {
    const { consultantGroup } = this.form.value;
    this.manageSharedService.consultantGroupsService
      .getConsultantGroupById(consultantGroup)
      .subscribe({
        next: (res) => {
          const mainCons =
            res?.consultants
              .filter((c: any) => c.type === ConsultantType.MainConsultant)
              .map((c: any) => c.id) || [];

          const coordSubs =
            res?.consultants
              .filter(
                (c: any) => c.type === ConsultantType.CoordinatingSubConsultant
              )
              .map((c: any) => c.id) || [];

          const partSubs =
            res?.consultants
              .filter(
                (c: any) => c.type === ConsultantType.ParticipatingSubConsultant
              )
              .map((c: any) => c.id) || [];

          this.form.patchValue({
            mainConsultant: mainCons[0],
            coordinatingSubConsultants: coordSubs,
            participatingSubConsultants: partSubs,
            consultants: res.consultants,
            mainConsultantId: res.consultants.find((ele) => ele.isMain === true)
              ?.id,
          });

          // Update available lists after patching
          this.updateAvailableUsers();
        },
      });
  }

  onClearConsultants(): void {
    this.form.patchValue({
      mainConsultant: null,
      coordinatingSubConsultants: null,
      participatingSubConsultants: null,
    });
  }

  onRemoveSingleConsultant(event: { id: string; name: string }): void {
    // Handle removal if needed
  }

  onSelectionChange(): void {
    this.updateAvailableUsers();
  }

  searchOnConsultantGroups(event: { term: string; items: any[] }) {
    this.consultanGroupsList$ =
      this.manageSharedService.consultantGroupsService.getConsultantGroupsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          searchKeyword: removeSpecialCharacters(event.term),
        },
        undefined,
        ['id', 'title']
      );
  }

  searchOnUsers(event: { term: string; items: any[] }) {
    this.usersList$ = this.manageSharedService.usersService.getUsersList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: removeSpecialCharacters(event.term),
      }
    );
  }
}

