import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isTouched } from '@shared/helpers/helpers';

import { map, Observable, of } from 'rxjs';
import { ManageNotesService } from '@pages/manage-notes/services/manage-notes.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-telephone-consent-modal',
  templateUrl: './telephone-consent-modal.component.html',
  styleUrls: ['./telephone-consent-modal.component.scss'],
})
export class TelephoneConsentModalComponent implements OnInit {
  form!: FormGroup;
  lang: string = 'ar';
  isLoading = false;
  compareFn = compareFn;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      noteId: string;
      users: {
        id: string;
        name: string;
      }[];
    },
    private dialogRef: MatDialogRef<TelephoneConsentModalComponent>,
    private manageTransactionsService: ManageTransactionsService,
    private toastr: CustomToastrService,
    private manageNotesService: ManageNotesService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.patchForm();
    this.getUsers();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      users: new FormControl('', [Validators.required]),
      comment: new FormControl('', [Validators.required]),
    });
  }

  usersList$!: Observable<{ id: string; name: string }[]>;

  getUsers() {
    this.manageNotesService.notesService.getSignatureUsers(this.data.noteId).subscribe({
      next: (res) => {
        this.usersList$ = of(res);
      },
      error: (err) => {},
    });
  }

  patchForm(): void {
    this.form.patchValue({
      users: this.data.users,
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      const body = {
        userId: this.form.value.users['id'],
        comment: this.form.value['comment'],
      };
      this.manageNotesService.notesService
        .signaturePhoneApproval(this.data.noteId, body)
        .subscribe({
          next: (res) => {
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
            this.isLoading = false;
            this.dialogRef.close({
              status: 'Succeed',
              statusCode: ModalStatusCode.Success,
            });
          },
          error: (err) => {
            this.isLoading = false;
          },
        });
    }
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

  onSetIfUserIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('users')?.markAsTouched();
    } else {
      this.form.get('users')?.markAsUntouched();
    }
  }
}
