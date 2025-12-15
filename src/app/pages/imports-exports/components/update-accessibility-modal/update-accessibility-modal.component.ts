import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { compareFn, isTouched, removeSpecialCharacters } from '@shared/helpers/helpers';

import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { AllAllowedUsers, User } from '@core/models/request.model';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

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
      requestId: string;
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
    if (!data.isExportDocument) {
      this.importUsersAccessibilityForList();
    } else {
      this.exportUsersAccessibilityForList();
    }
  }

  /**
   * Fetches the list of users with accessibility for a specific request (import or export).
   * Allows optional filtering by a search keyword.
   * @param type - 'import' or 'export' to determine the request type.
   * @param trim - Optional search keyword to filter users.
   * @param pageSize - Number of users to fetch per page (default is 0).
   */
  private fetchUsersAccessibilityList(
    type: 'import' | 'export',
    trim?: string,
    pageSize: number = 0
  ): void {
    const searchKeyword = trim ? removeSpecialCharacters(trim) : '';
    const requestService = this.manageImportsExportsService.requestsService;
    const requestServiceMethod =
      type === 'import'
        ? requestService.getImportUsersAccessibilityList.bind(requestService)
        : requestService.getExportUsersAccessibilityList.bind(requestService);

    of({})
      .pipe(
        switchMap(() =>
          requestServiceMethod(
            {
              pageSize: trim ? 0 : pageSize,
              pageIndex: 0,
            },
            {
              searchText: searchKeyword,
            },
            undefined,
            [],
            this.data.requestId
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
   * Wrapper to fetch import users.
   */
  importUsersAccessibilityForList(trim?: string, pageSize: number = 0): void {
    this.fetchUsersAccessibilityList('import', trim, pageSize);
  }

  /**
   * Wrapper to fetch export users.
   */
  exportUsersAccessibilityForList(trim?: string, pageSize: number = 0): void {
    this.fetchUsersAccessibilityList('export', trim, pageSize);
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
      const requestType: 'import' | 'export' = this.data.isExportDocument ? 'export' : 'import';

      const updateMethod =
        requestType === 'import'
          ? this.manageImportsExportsService.requestsService.updateImportsUsersAccessibility
          : this.manageImportsExportsService.requestsService.updateExportsUsersAccessibility;

      updateMethod
        .call(this.manageImportsExportsService.requestsService, this.data.requestId, usersIds)
        .subscribe({
          next: () => {
            this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
            this.dialogRef.close({
              status: 'Succeed',
              statusCode: ModalStatusCode.Success,
            });
          },
          error: (err) => {
            console.error('Failed to update users accessibility:', err);
            this.toastr.error(this.translateService.instant('shared.updateFailed'));
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
