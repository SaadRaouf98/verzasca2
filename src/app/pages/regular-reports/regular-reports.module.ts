import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegularReportsRoutingModule } from './regular-reports-routing.module';
import { RegularReportsListComponent } from './pages/regular-reports-list/regular-reports-list.component';
import { SharedModule } from '@shared/shared.module';
import { AddRegularReportComponent } from './pages/add-regular-report/add-regular-report.component';
import { ReportLogsDialogComponent } from '@pages/regular-reports/components/report-logs-dialog/report-logs-dialog.component';
import { InputComponent } from '@shared/components/input/input.component';
import { AddReportFolderDialogComponent } from './components/add-report-folder-dialog/add-report-folder-dialog.component';
import { UploadAttachmentComponent } from '@shared/components/upload-attachment/upload-attachment.component';
import { SlideToggleComponent } from '@shared/components/sidenav-toggle/sidenav-toggle.component';
import { MoveReportDialogComponent } from './components/move-report/move-report-dialog.component';

@NgModule({
  declarations: [
    RegularReportsListComponent,
    AddReportFolderDialogComponent,
    AddRegularReportComponent,
    ReportLogsDialogComponent,
    MoveReportDialogComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RegularReportsRoutingModule,
    InputComponent,
    UploadAttachmentComponent,
    SlideToggleComponent,
    
  ],
})
export class RegularReportsModule {}
