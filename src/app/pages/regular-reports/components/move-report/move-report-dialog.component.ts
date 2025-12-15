import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { isTouched, sharePointFileNameRegularExpression } from '@shared/helpers/helpers';

import { Location } from '@angular/common';
import { ManageRegularReportsService } from '@pages/regular-reports/services/manage-regular-reports.service';
import { RegularReportBoardType } from '@core/enums/regular-report-board-type.enum';
import { Observable } from 'rxjs';
import { AllRegularReports, RegularReport, Report } from '@core/models/regular-report.model';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth/auth.service';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { OrganizationUnit } from '@core/models/organization-unit.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-move-report-dialog',
  templateUrl: './move-report-dialog.component.html',
  styleUrls: ['./move-report-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveReportDialogComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  lang: string = 'ar';

  RegularReportBoardType = RegularReportBoardType;
  holdersList$: Observable<AllRegularReports> = new Observable();
  report!: Report;
  reportFolders: any[] = [];
  @Output() dataChanges: EventEmitter<boolean> = new EventEmitter<boolean>();
  folderTitle: string = '';
  organizationUnitsList: OrganizationUnit[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      node: RegularReport;
    },
    private dialogRef: MatDialogRef<MoveReportDialogComponent>,
    private manageRegularReportsService: ManageRegularReportsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    public authService: AuthService,
    private manageTransactionsService: ManageTransactionsService,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.manageRegularReportsService.regularReportsService
      .getReportPath(this.data.node?.parentId)
      .subscribe({
        next: (reportPath) => {
          if (reportPath && Array.isArray(reportPath) && reportPath.length > 0) {
            this.folderTitle = reportPath[0];
          } else if (reportPath && typeof reportPath === 'string') {
            this.folderTitle = reportPath;
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.cdr.markForCheck();
        },
      });
    this.initializeForm();

    this.lang = this.languageService.language;

    this.getRegularReportsFolders();
  }
  changeStatus(e: any) {
    console.log(e);
  }
  initializeForm(): void {
    this.form = new FormGroup({
      folderId: new FormControl(null, [Validators.required]),
      reportId: new FormControl(this.data.node?.id, []),
    });
  }

  getRegularReportsFolders() {
    this.manageTransactionsService.organizationUnitsService
      .getRegularReportsFolders()
      .subscribe((res) => {
        this.reportFolders = res.data;
        this.cdr.markForCheck();
      });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.disableSubmitBtn = true;

    const reportData = this.form.value;

    this.handleReportRequest(reportData);
  }

  private handleReportRequest(reportData: any) {
    this.manageRegularReportsService.regularReportsService
      .moveRegularReportFolder(reportData.reportId, reportData.folderId)
      .subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.reportMovedSuccessfully'));
          this.dataChanges.emit(true);
          this.dialogRef.close();
        },
        error: () => {
          this.disableSubmitBtn = false;
        },
      });
  }

  onCancel(): void {
    this.form.reset();
    this.dialogRef.close();
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  protected readonly environment = environment;
}
