import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ModalStatusCode} from '@shared/enums/modal-status-code.enum';
import {ManageRegularReportsService} from "@pages/regular-reports/services/manage-regular-reports.service";
import {finalize} from "rxjs";

interface User {
  id: string;
  name: string;
}

interface ActivityRecord {
  id: string;
  date: string;
  agent: string;
  user: User;
}

@Component({
  selector: 'app-report-logs-dialog',
  templateUrl: './report-logs-dialog.component.html',
  styleUrls: ['./report-logs-dialog.component.scss'],
})
export class ReportLogsDialogComponent {
  searchTerm: string = '';
  data: ActivityRecord[] = [];
  filteredData: ActivityRecord[] = [];
  loader = false

  constructor(
    @Inject(MAT_DIALOG_DATA) public document: { label: string; id: string },
    private manageRegularReportsService: ManageRegularReportsService,
    private dialogRef: MatDialogRef<ReportLogsDialogComponent>
  ) {
  }

  ngOnInit(): void {
    if (this.document.id) {
      this.getRegularReportLogs(this.document.id);
    }
  }


  getRegularReportLogs(id: string) {
    this.loader = true;
    // Logic to get regular report logs
    this.manageRegularReportsService.regularReportsService
      .getReportLogs(id).pipe(finalize(() => this.loader = false))
      .subscribe((response) => {
        this.data = response.data;
        this.filteredData = [...this.data];
      });
  }

  // Extract browser and OS information from user agent string
  extractBrowserInfo(agent: string): { browser: string; os: string } {
    const browserMatch = agent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    const osMatch = agent.match(/Windows NT (\d+\.\d+)/);

    const browser = browserMatch ? `كروم ${browserMatch[1]}` : "غير معروف";
    const os = osMatch ? `ويندوز ${osMatch[1]}` : "غير معروف";

    return {browser, os};
  }

  // Extract IP address from agent string
  extractIpAddress(agent: string): string {
    const ipMatch = agent.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
    return ipMatch ? ipMatch[1] : "غير معروف";
  }

  // Format date for display
  // Filter data based on search term
  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredData = [...this.data];
      return;
    }

    this.filteredData = this.data.filter(
      (item) =>
        item.user.name.includes(this.searchTerm) ||
        item.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.agent.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }
}
