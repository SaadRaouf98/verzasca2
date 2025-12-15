import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isTouched, removeSpecialCharacters } from '@shared/helpers/helpers';

import { User } from '@core/models/request.model';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-update-accessibility-modal',
  templateUrl: './update-accessibility-modal.component.html',
  styleUrls: ['./update-accessibility-modal.component.scss'],
})
export class UpdateAccessibilityModalComponent {
  lang: string = 'ar';
  userControl: FormControl = new FormControl([], Validators.required);
  users!: User[];

  compareFn = compareFn;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      requestContainerId: string;
      users: {
        id: string;
        name: string;
      }[];
      isExportDocument: boolean;
    },
    private dialogRef: MatDialogRef<UpdateAccessibilityModalComponent>,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private manageImportsExportsService: ManageImportsExportsService
  ) {
    this.fetchUsersAccessibilityList();
  }

  /**
   * Fetches the list of users with accessibility for a specific request (import or export).
   * Allows optional filtering by a search keyword.
   * @param type - 'import' or 'export' to determine the request type.
   * @param trim - Optional search keyword to filter users.
   * @param pageSize - Number of users to fetch per page (default is 0).
   */
  private fetchUsersAccessibilityList(trim?: string, pageSize: number = 0): void {
    const searchKeyword = trim ? removeSpecialCharacters(trim) : '';
    const requestService = this.manageImportsExportsService.requestContainersService;
    const requestServiceMethod = requestService.getUsersAccessibilityList.bind(requestService);
    of({})
      .pipe(
        switchMap(() =>
          requestServiceMethod(
            {
              searchText: searchKeyword,
              hasAccess: null,
            },
            this.data.requestContainerId
          )
        ),
        catchError((err) => {
          console.error('Failed to fetch users accessibility list:', err);
          return of({ data: [] });
        })
      )
      .subscribe((res: any) => {
        this.users = res.data;
        this.setSelectedUsers();
      });
  }

  /**
   * Sets the default selected users in the form control.
   * Filters users with access and maps their IDs to the control value.
   */
  setSelectedUsers(): void {
    const defaultSelected: (string | undefined)[] = this.users
      .filter((user) => user.hasAccess)
      .map((user) => user.id);

    this.userControl.setValue(defaultSelected);
  }

  /**
   * Handles the form submission to update users' accessibility based on request type.
   */
  onSubmit(): void {
    if (this.userControl.valid) {
      const usersIds = this.userControl.value;

      this.manageImportsExportsService.requestContainersService
        .updateContainerAccessibility(this.data.requestContainerId, usersIds)
        .subscribe({
          next: (res) => {
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));

            this.dialogRef.close({
              status: 'Succeed',
              statusCode: ModalStatusCode.Success,
            });
          },
          error: (err) => {},
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  isTouched(): boolean | undefined {
    return this.userControl.touched ?? false;
  }

  onSetIfUserIsTouched(touched: boolean): void {
    if (touched) {
      this.userControl?.markAsTouched();
    } else {
      this.userControl?.markAsUntouched();
    }
  }
}
