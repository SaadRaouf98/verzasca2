import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { ManageRegularReportsService } from '@pages/regular-reports/services/manage-regular-reports.service';
import { finalize } from 'rxjs';
import { ManageUsersService } from '@pages/users/services/manage-users.service';

interface User {
  id: string;
  name: string;
}

// log.enums.ts
export enum LogCategory {
  None = 0,
  Reports = 1, // التقارير
  RequestActions = 2, // اجراء على معاملة
  RequestExternalActions = 3, // اجراء على معاملة
  RecordActions = 4, // اجراء محضر
  RecordActionReply = 5, // رد على اجراء
  RequestCommitteeApprovals = 6, // Request Committee Approvals (Workflow Step)
}

export enum LogActionType {
  View = 0,
  Create = 1,
  Update = 2,
  Delete = 3,
}

export interface userLog {
  /** Unique identifier for the log entry */
  id: string;
  /** ISO 8601 timestamp of the event */
  date: string;
  /** Category code of the event */
  category: LogCategory;
  action: LogActionType;
  /** IP address of the client, if available */
  ipAddress: string;
  /** User agent or device information string */
  deviceInfo: string;
  /** Application info or version, if available */
  appInfo: string;
  extraData?: string;
}

@Component({
  selector: 'app-user-logs-dialog',
  templateUrl: './user-logs-dialog.component.html',
  styleUrls: ['./user-logs-dialog.component.scss'],
})
export class UserLogsDialogComponent {
  searchTerm: string = '';
  data: userLog[] = [];
  filteredData: userLog[] = [];
  loader = false;
  // expose enums to the template
  LogCategory = LogCategory;
  LogActionType = LogActionType;

  constructor(
    @Inject(MAT_DIALOG_DATA) public document: { label: string; id: string },
    private dialogRef: MatDialogRef<UserLogsDialogComponent>,
    private manageUsersService: ManageUsersService,
    private toastr: CustomToastrService
  ) {}
  // Arabic labels lookup
  categoryLabels: Record<LogCategory, string> = {
    [LogCategory.None]: 'بدون',
    [LogCategory.Reports]: 'التقارير',
    [LogCategory.RequestActions]: 'إجراء على معاملة',
    [LogCategory.RequestExternalActions]: 'اجراء خارجي على معاملة',
    [LogCategory.RecordActions]: 'إجراء محضر',
    [LogCategory.RecordActionReply]: 'رد على إجراء',
    [LogCategory.RequestCommitteeApprovals]: 'موافقة الاعضاء',
  };

  actionLabels: Record<LogActionType, string> = {
    [LogActionType.View]: 'عرض',
    [LogActionType.Create]: 'إنشاء',
    [LogActionType.Update]: 'تعديل',
    [LogActionType.Delete]: 'حذف',
  };

  ngOnInit(): void {
    if (this.document.id) {
      this.getRegularReportLogs(this.document.id);
    }
  }

  getRegularReportLogs(id: string) {
    this.loader = true;
    // Logic to get regular report logs
    this.manageUsersService.usersService
      .getUserLogs(id)
      .pipe(finalize(() => (this.loader = false)))
      .subscribe((response) => {
        this.data = response.data;
        this.filteredData = [...this.data];
      });
  }
  onCopied() {
    this.toastr.success('تم نسخ المحتوى بنجاح');
  }

  // Format date for display
  // Filter data based on search term
  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredData = [...this.data];
      return;
    }
    this.filteredData = this.data.filter((item) => {
      // Search in ID, date, enum names, IP, deviceInfo, appInfo
      const categoryName = LogCategory[item.category] || '';
      const actionName = LogActionType[item.action] || '';
      return (
        item.id.toLowerCase().includes(this.searchTerm) ||
        item.date.toLowerCase().includes(this.searchTerm) ||
        categoryName.toLowerCase().includes(this.searchTerm) ||
        actionName.toLowerCase().includes(this.searchTerm) ||
        (item.ipAddress || '').toLowerCase().includes(this.searchTerm) ||
        item.deviceInfo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.appInfo || '').toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }
}
