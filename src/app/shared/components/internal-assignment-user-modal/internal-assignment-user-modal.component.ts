import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AllUsers } from '@core/models/user.model';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isTouched } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-internal-assignment-user-modal',
  templateUrl: './internal-assignment-user-modal.component.html',
  styleUrls: ['./internal-assignment-user-modal.component.scss'],
})
export class InternalAssignmentUserModalComponent {
  disableSubmitBtn: boolean = false;
  form!: FormGroup;
  usersList$: Observable<AllUsers> = new Observable();

  compareFn = compareFn;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      header: string;
      textAreaLabel: string;
      buttonLabel: string;
    },
    private dialogRef: MatDialogRef<InternalAssignmentUserModalComponent>,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeDropDownList();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      assignedTo: new FormControl('', [Validators.required]),
      comment: new FormControl('', []),
    });
  }

  initializeDropDownList(): void {
    this.usersList$ =
      this.manageSharedService.usersService.getUsersListToInternalAssignment({
        pageSize: 20,
        pageIndex: 0,
      });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { assignedTo, comment } = this.form.value;

    this.dialogRef.close({
      status: 'Succeeded',
      statusCode: ModalStatusCode.Success,
      data: {
        assignedToId: assignedTo.id,
        comment,
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

  searchOnUsers(event: { term: string; items: any[] }) {
    this.usersList$ = this.manageSharedService.usersService.getUsersList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword: event.term,
      }
    );
  }
}
