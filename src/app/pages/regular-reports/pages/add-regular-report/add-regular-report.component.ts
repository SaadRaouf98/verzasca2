import { ChangeDetectionStrategy, Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { compareFn, isTouched, sharePointFileNameRegularExpression } from '@shared/helpers/helpers';

import { Location } from '@angular/common';
import { ManageRegularReportsService } from '@pages/regular-reports/services/manage-regular-reports.service';
import { Observable, take, switchMap, Subject } from 'rxjs';
import { AllRegularReports, Report } from '@core/models/regular-report.model';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth/auth.service';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { REPORT_PERIOD_OPTIONS } from '@core/enums/report-period-type.enum';
import { ViewAttachmentsModalComponent } from '@shared/components/view-attachments-modal/view-attachments-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { RegularReportsService } from '@core/services/backend-services/regular-reports.service';
import { RegularReportBoardType } from '@core/enums/regular-report-board-type.enum';
import { SimplePdfModalComponent } from '@shared/components/simple-pdf-modal/simple-pdf-modal.component';
import { ViewImageModalComponent } from '@shared/components/view-image-modal/view-image-modal.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-regular-report',
  templateUrl: './add-regular-report.component.html',
  styleUrls: ['./add-regular-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRegularReportComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  lang: string = 'ar';
  isThumbnailImageDropZoneTouched: boolean = false;
  isReportFileDropZoneTouched: boolean = false;
  holdersList$: Observable<AllRegularReports> = new Observable();
  report!: Report;
  regularExpression = sharePointFileNameRegularExpression;
  reportPeriodOptions = REPORT_PERIOD_OPTIONS;
  reportID: string | null = null;
  parentIdToAdd: string | null = null;
  breadcrumbItems: string[] = [];
  checked: boolean = true;
  reportPath: string[] = [];
  private submitReport$ = new Subject<any>();
  @ViewChild('uploadAttachment') uploadAttachmentComponent: any;
  @ViewChild('uploadAttachmentThumbnail') uploadAttachmentThumbnail: any;
  protected readonly environment = environment;
  values = [];
  thumbnailpathValues = [];
  apiUrl = environment.apiUrl;
  compareFn = compareFn;
  constructor(
    private location: Location,
    private manageRegularReportsService: ManageRegularReportsService,
    private regularReportsService: RegularReportsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService,
    public authService: AuthService,
    private manageImportsExportsService: ManageImportsExportsService,
    private dialog: MatDialog,
    private route: ActivatedRoute, // Inject ActivatedRoute
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.lang = this.languageService.language;
    // Get parentId from query params
    this.reportID = this.route.snapshot.paramMap.get('id');
    this.parentIdToAdd = this.route.snapshot.queryParamMap.get('parentId');
    if (this.parentIdToAdd) {
      this.getReportPath();
    }
    if (this.reportID) {
      this.getBreadCrumbData(this.reportID);
      this.getReportDetails(this.reportID);
    }
  }

  initializeForm(): void {
    this.form = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      periodType: new FormControl(null, [Validators.required]),
      reportFile: new FormControl(null, [Validators.required]),
      thumbnailImage: new FormControl(null, []),
      isActive: new FormControl(true, []),
    });
  }
  getBreadCrumbData(id: string) {
    this.regularReportsService.getBreadCrumb(id).subscribe((data) => {
      this.breadcrumbItems = data;
      this.cdr.detectChanges();
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.disableSubmitBtn = true;

    const reportData = this.prepareReportData();
    const reportRequest$ = this.getReportRequestObservable(reportData);

    this.handleReportRequest(reportRequest$);
  }
  private prepareReportData() {
    const { title, periodType, reportFile, thumbnailImage, isActive } = this.form.value;
    return {
      title: title,
      parentId: this.parentIdToAdd,
      periodType: periodType,
      fileId: reportFile,
      thumbnailId: thumbnailImage,
      isActive: isActive,
      boardType: RegularReportBoardType.File,
    };
  }
  private handleReportRequest(reportRequest$: Observable<any>) {
    reportRequest$.subscribe({
      next: (res) => {
        this.showSuccessMessage();
        this.navigateToTablePage();
        this.disableSubmitBtn = false;
      },
      error: () => {
        this.disableSubmitBtn = false;
      },
    });
  }
  private getReportRequestObservable(reportData: any) {
    return this.reportID
      ? this.manageRegularReportsService.regularReportsService.updateRegularReport(
          this.reportID,
          reportData
        )
      : this.manageRegularReportsService.regularReportsService.addRegularReport(reportData);
  }

  getReportPath() {
    this.manageRegularReportsService.regularReportsService
      .getReportPath(this.parentIdToAdd)
      .subscribe({
        next: (reportPath) => {
          this.reportPath = reportPath;
          this.cdr.detectChanges();
        },
      });
  }
  getReportDetails(reportId: string) {
    this.manageRegularReportsService.regularReportsService.getReportDetails(reportId).subscribe({
      next: (report) => {
        this.report = report;
        this.parentIdToAdd = report.parent.id;
        this.getReportPath();
        this.form.patchValue(report);
        let valusesObj = {
          name: report.file.name,
          contentType: 'pdf',
          path: report.file.name,
        };
        this.values = report.file.name ? [valusesObj] : [];
        let thumbnailObj = {
          name: report.thumbnailPath,
          contentType: report.thumbnailPath.split('.').pop(),
          path: report.thumbnailPath,
        };
        this.thumbnailpathValues = report.file.name ? [thumbnailObj] : [];
        this.form.get('reportFile')?.clearValidators();
        this.form.get('reportFile')?.updateValueAndValidity();
      },
    });
  }
  private showSuccessMessage() {
    const successMessage =
      this.report?.id || this.reportID
        ? 'shared.dataUpdatedSuccessfully'
        : 'shared.dataCreatedSuccessfully';
    this.toastr.success(this.translateService.instant(successMessage));
  }

  onCancel(): void {
    this.form.reset();
    this.navigateToTablePage();
  }

  navigateToTablePage(): void {
    this.location.back();
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onSetThumbnailImage(files: FileList): void {
    this.isThumbnailImageDropZoneTouched = true;
    this.form.get('thumbnailImage')?.setValue(files?.[0]);
    this.form.get('thumbnailImage')?.markAsTouched();
  }

  onSetReportFile(files: FileList): void {
    this.isReportFileDropZoneTouched = true;
    this.form.get('reportFile')?.setValue(files?.[0]);
    this.form.get('reportFile')?.markAsTouched();
  }

  onAttachmentRemoved(fileId: string, typeImage: boolean): void {
    if (fileId) {
      const fieldName = typeImage ? 'reportFile' : 'thumbnailImage';
      this.form.patchValue({
        [fieldName]: null,
      });
      if (typeImage && this.reportID) {
        this.reportID ? this.form.get('reportFile')?.setValidators(Validators.required) : '';
        this.form.get(fieldName)?.updateValueAndValidity();
      }
    }
  }

  onViewAttachment(file?: File, isThumbnail?: boolean): void {
    const imageFile = file;
    let fileToView;
    isThumbnail ? (fileToView = 'thumbnailImage') : (fileToView = 'reportFile');
    // Check if it's a newly uploaded file from client side
    if (imageFile && imageFile instanceof File) {
      // Create a temporary object URL for the file
      const objectUrl = URL.createObjectURL(imageFile);

      // Determine if it's an image or PDF
      const fileType = imageFile.type;
      const fileName = imageFile.name.toLowerCase();

      if (fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) {
        // Show image in ViewImageModalComponent
        this.dialog
          .open(ViewImageModalComponent, {
            data: objectUrl,
            width: '80vw',
            maxWidth: '1200px',
            panelClass: 'custom-dialog-container',
          })
          .afterClosed()
          .subscribe(() => {
            // Clean up the object URL after modal closes
            URL.revokeObjectURL(objectUrl);
          });
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // Show PDF in modal
        const dialogRef = this.dialog.open(SimplePdfModalComponent, {
          data: objectUrl,
          width: '90vw',
          maxWidth: '1400px',
          height: '95vh',
          panelClass: 'custom-dialog-container',
        });

        dialogRef.afterClosed().subscribe(() => {
          URL.revokeObjectURL(objectUrl);
        });
      } else {
        this.toastr.warning(
          this.translateService.instant('shared.unsupportedFileType') || 'Unsupported file type'
        );
      }
    } else {
      // If no new file, fetch and stream the file from the URL (when editing)
      const imagePath = isThumbnail ? this.report?.thumbnailPath : this.report?.file?.name;

      if (!imagePath) {
        this.toastr.warning(
          this.translateService.instant('shared.noFileAvailable') || 'No file available to view'
        );
        return;
      }

      // Use the service method to get the file - getThumbnail returns image, viewReportByPath returns Blob
      if (isThumbnail) {
        this.manageRegularReportsService.regularReportsService.getThumbnail(imagePath).subscribe({
          next: (file: any) => {
            if (!file) {
              this.toastr.warning(
                this.translateService.instant('shared.noFileAvailable') ||
                  'No file available to view'
              );
              return;
            }

            try {
              // Determine expected MIME type from file extension
              const fileName = String(imagePath).toLowerCase();
              let expectedMime = 'image/jpeg'; // Default to JPEG for images

              if (fileName.match(/\.(jpg|jpeg)$/)) expectedMime = 'image/jpeg';
              else if (fileName.endsWith('.png')) expectedMime = 'image/png';
              else if (fileName.endsWith('.gif')) expectedMime = 'image/gif';
              else if (fileName.endsWith('.bmp')) expectedMime = 'image/bmp';
              else if (fileName.endsWith('.webp')) expectedMime = 'image/webp';
              else if (fileName.endsWith('.svg')) expectedMime = 'image/svg+xml';

              // getThumbnail returns File object, create blob with correct MIME type
              const blob = new Blob([file], { type: expectedMime });
              const objectUrl = URL.createObjectURL(blob);

              // Open image viewer
              this.dialog
                .open(ViewImageModalComponent, {
                  data: objectUrl,
                  width: '80vw',
                  maxWidth: '1200px',
                  panelClass: 'custom-dialog-container',
                })
                .afterClosed()
                .subscribe(() => URL.revokeObjectURL(objectUrl));
            } catch (error) {
              console.error('Error processing thumbnail:', error);
              this.toastr.error(
                this.translateService.instant('shared.errorLoadingFile') || 'Error loading file'
              );
            }
          },
          error: (err) => {
            console.error('getThumbnail error:', err);
            this.toastr.error(
              this.translateService.instant('shared.errorLoadingFile') || 'Error loading file'
            );
          },
        });
      } else {
        // For PDF files, use viewReportByPath
        this.manageRegularReportsService.regularReportsService
          .viewReportByPath(this.report?.id)
          .subscribe({
            next: (blob: Blob) => {
              if (!blob) {
                this.toastr.warning(
                  this.translateService.instant('shared.noFileAvailable') ||
                    'No file available to view'
                );
                return;
              }

              const objectUrl = URL.createObjectURL(blob);

              this.dialog
                .open(SimplePdfModalComponent, {
                  data: objectUrl,
                  width: '90vw',
                  maxWidth: '1400px',
                  height: '95vh',
                  panelClass: 'custom-dialog-container',
                })
                .afterClosed()
                .subscribe(() => URL.revokeObjectURL(objectUrl));
            },
            error: () => {
              this.toastr.error(
                this.translateService.instant('shared.errorLoadingFile') || 'Error loading file'
              );
            },
          });
      }
    }
  }

  onFileDropped(e: any, typeImage: boolean): void {
    for (const [key, value] of e.entries()) {
      if (value instanceof File) {
        this.manageImportsExportsService.wopiFilesService.createFile(value).subscribe((res) => {
          if (res) {
            const fieldName = typeImage ? 'thumbnailImage' : 'reportFile';
            this.form.patchValue({
              [fieldName]: res,
            });
            if (fieldName === 'reportFile') {
              if (this.uploadAttachmentComponent) {
                // Find the uploaded file object by name and pass its ID to completeUpload
                const uploadedFile = this.uploadAttachmentComponent.uploadedFiles.find(
                  (f: any) => (f.file.name || f.file?.originalName) === value.name
                );

                if (uploadedFile) {
                  this.uploadAttachmentComponent.completeUpload(uploadedFile.id);
                }
              }
            }
            if (fieldName === 'thumbnailImage') {
              if (this.uploadAttachmentThumbnail) {
                // Find the uploaded file object by name and pass its ID to completeUpload
                const uploadedFile = this.uploadAttachmentThumbnail.uploadedFiles.find(
                  (f: any) => (f.file.name || f.file?.originalName) === value.name
                );
                if (uploadedFile) {
                  this.uploadAttachmentThumbnail.completeUpload(uploadedFile.id);
                }
              }
            }
          }
        });
      }
    }
  }
}
