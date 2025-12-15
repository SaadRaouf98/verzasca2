import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Output } from '@angular/core';
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
  selector: 'app-add-report-folder-dialog',
  templateUrl: './add-report-folder-dialog.component.html',
  styleUrls: ['./add-report-folder-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddReportFolderDialogComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  lang: string = 'ar';

  RegularReportBoardType = RegularReportBoardType;
  holdersList$: Observable<AllRegularReports> = new Observable();
  report!: Report;

  @Output() dataChanges: EventEmitter<boolean> = new EventEmitter<boolean>();

  organizationUnitsList: OrganizationUnit[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      node: RegularReport;
      isForEdit?: boolean;
    },
    private location: Location,
    private dialogRef: MatDialogRef<AddReportFolderDialogComponent>,
    private manageRegularReportsService: ManageRegularReportsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    public authService: AuthService,
    private manageTransactionsService: ManageTransactionsService,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.lang = this.languageService.language;

    console.log('this.data', this.data);
    this.getCommitteeList();
    if (this.data.isForEdit) {
      this.getReportDetails(this.data.node?.id);
    }
  }
  changeStatus(e: any) {
    console.log(e);
  }
  initializeForm(): void {
    this.form = new FormGroup({
      title: new FormControl('', [Validators.required]),
      boardType: new FormControl('', []),
      parentId: new FormControl('', []),
      committeesIds: new FormControl('', [Validators.required]),
      isActive: new FormControl(true, [Validators.required]),
    });
    this.data.isForEdit && this.data.node
      ? this.form.get('parentId').setValue(this.data.node?.parentId)
      : this.form.get('parentId').setValue(this.data.node?.id);
    this.form.get('boardType').setValue(RegularReportBoardType.Holder);
  }
  getReportDetails(reportId: string) {
    this.manageRegularReportsService.regularReportsService.getReportDetails(reportId).subscribe({
      next: (report) => {
        this.report = report;
        this.form.patchValue(report);
        this.tryPatchCommittees();
      },
    });
  }
  tryPatchCommittees() {
    if (this.report && this.report.committees) {
      this.report.committees.forEach((x) => (x.committeeSymbol = x.symbol));
      setTimeout(() => {
        this.form.get('committeesIds')?.setValue(this.report.committees?.map((x) => x.id) ?? []);
      }, 10);
    }
  }

  getCommitteeList() {
    this.manageTransactionsService.organizationUnitsService
      .getOrganizationUnitsList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
        }
      )
      .subscribe((res) => {
        this.organizationUnitsList = res.data;
      });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.disableSubmitBtn = true;

    const reportData = this.form.value;

    const reportRequest$ = this.getReportRequestObservable(reportData);
    console.log('this.form.value', this.form.value);
    this.handleReportRequest(reportRequest$);
  }

  private getReportRequestObservable(reportData: any) {
    return this.data.isForEdit
      ? this.manageRegularReportsService.regularReportsService.updateRegularReport(
          this.report.id,
          reportData
        )
      : this.manageRegularReportsService.regularReportsService.addRegularReport(reportData);
  }

  private handleReportRequest(reportRequest$: Observable<any>) {
    reportRequest$.subscribe({
      next: (res) => {
        this.showSuccessMessage();
        this.dataChanges.emit(true);
        this.dialogRef.close();
      },
      error: () => {
        this.disableSubmitBtn = false;
      },
    });
  }

  private showSuccessMessage() {
    const successMessage = this.report?.id
      ? 'shared.dataUpdatedSuccessfully'
      : 'shared.dataCreatedSuccessfully';
    this.toastr.success(this.translateService.instant(successMessage));
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
