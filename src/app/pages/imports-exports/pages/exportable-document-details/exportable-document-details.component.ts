import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { ImportExport } from '@core/models/import-export.model';
import { LanguageService } from '@core/services/language.service';
import { ManageTransactionsService } from '@pages/transactions/services/manage-transactions.service';
import { Attachment, RelatedRequestScrollableTable } from '@core/models/request.model';
import { RequestStatus } from '@core/enums/request-status.enum';
import { ExportableDocument } from '@core/models/exportable-document.model';
import { map, Observable, tap } from 'rxjs';
import { Transaction } from '@core/models/transaction.model';
import { Location } from '@angular/common';
import printJS from 'print-js';
import {
  base64ToArrayBuffer,
  convertEnglishToArabicNumbers,
  formatDateToYYYYMMDD,
  isSmallDeviceWidthForPopup,
  padToFourDigits,
} from '@shared/helpers/helpers';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ExportedDocumentStatus } from '@core/enums/exported-document-status.enum';
import { getBarcodeWithOUTBackground } from '@pages/imports-exports/statics/barcode-background';
import { PrintBarcodeModalComponent } from '@pages/imports-exports/modals/print-barcode-modal/print-barcode-modal.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { MatDialog } from '@angular/material/dialog';
// import { Observable } from 'tinymce';
import { DomSanitizer } from '@angular/platform-browser';

import { PDFSource } from 'ng2-pdf-viewer';
import { AddAttachmentComponent } from '@features/components/pending-request/pending-request-view/add-attachment/add-attachment.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { AddExportDocumentComponent } from '@pages/imports-exports/components/add-export-document/add-export-document.component';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ViewAttachmentsModalComponent } from '@shared/components/view-attachments-modal/view-attachments-modal.component';
import { AddBarcodeExportableDocumentComponent } from '@pages/imports-exports/components/add-barcode-exportable-document/add-barcode-exportable-document.component';
import { PlaceHolder } from '@core/models/placeHolder.model';
import { DeletePopupComponent } from '@shared/new-components/delete-popup/delete-popup.component';
import { ViewImageModalComponent } from '@shared/components/view-image-modal/view-image-modal.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-exportable-document-details',
  templateUrl: './exportable-document-details.component.html',
  styleUrls: ['./exportable-document-details.component.scss'],
})
export class ExportableDocumentDetailsComponent implements OnInit {
  elementId: string = '';
  destroyRef = inject(DestroyRef);
  exportableDocumentDetails!: ExportableDocument | null;
  importsExports: any[] = [];
  relatedRequests: RelatedRequestScrollableTable[] = [];
  lang: string = 'ar';
  RequestContainerStatus = RequestContainerStatus;
  RequestStatus = RequestStatus;

  ExportedDocumentType = ExportedDocumentType;
  ExportedDocumentStatus = ExportedDocumentStatus;
  exportableDocument: {
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    fileBlob: Blob | undefined;
  } = {
    pdfSrc: undefined,
    fileBlob: undefined,
  };
  isLoading: boolean = false;

  tabsLoading: {
    tab1: boolean;
    tab2: boolean;
  } = {
    tab1: true,
    tab2: true,
  };

  constructor(
    private manageImportsExportsService: ManageImportsExportsService,
    private manageTransactionsService: ManageTransactionsService,
    private activatedRoute: ActivatedRoute,
    private languageService: LanguageService,
    private translateService: TranslateService,
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.activatedRoute.params.subscribe((params) => {
      this.elementId = this.activatedRoute.snapshot.params['id'];
      this.intializePageData();
    });
  }

  intializePageData(): void {
    this.isLoading = true;

    this.manageTransactionsService.exportableDocumentService
      .getExportableDocumentById(this.elementId)
      .subscribe((res) => {
        this.exportableDocumentDetails = res;
        this.isLoading = false;
      });
  }

  onChangeUrlOfRequestId(requestId: string): void {
    this.router.navigateByUrl(this.router.url.replace(this.elementId, requestId));
  }

  onViewFile(clickType: 'leftClick' | 'rightClick'): void {
    if (clickType === 'leftClick') {
      this.router.navigateByUrl(
        `imports-exports/${this.exportableDocumentDetails?.document.id}/viewer?name=${this.exportableDocumentDetails?.document.name}`
      );
      return;
    }

    //rightClick
    window.open(
      `${window.location.origin}/imports-exports/${this.exportableDocumentDetails?.document.id}/viewer?name=${this.exportableDocumentDetails?.document.name}`,
      '_blank'
    );
  }

  loadFile(id: string): void {
    let observ$: Observable<Blob> = new Observable();

    if (id) {
      observ$ = this.manageTransactionsService.exportableDocumentService.getExportablePdfDocument(
        id,
        true
      );
    }

    observ$.subscribe({
      next: (blobFile) => {
        this.exportableDocument.fileBlob = blobFile;

        this.exportableDocument.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(blobFile)
        );
      },
      error: (err) => {
        if (err.status === 404) {
          this.toastr.error('عفوا هذا الملف غير موجود');
        }
      },
    });
  }
  onPrintBarcode(withTemplate: boolean = true): void {
    const dialogRef = this.dialog.open(PrintBarcodeModalComponent, {
      width: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: {
        attachmentDescription: this.exportableDocumentDetails?.attachmentDescription,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe(
        (dialogResult: {
          status: string;
          statusCode: ModalStatusCode;
          data: { attachmentDescription: string };
        }) => {
          if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
            if (withTemplate) {
              //1- Call api
              this.sendAttachmentDescription(dialogResult).subscribe((res) => {
                //2- Print
                this.manageTransactionsService.exportableDocumentService
                  .getBarcode(this.elementId, withTemplate)
                  .subscribe((res) => {
                    printJS({
                      printable: window.URL.createObjectURL(
                        new File([base64ToArrayBuffer(res)], 'export-barcode.png')
                      ),
                      type: 'image',
                      base64: false,
                      documentTitle: 'export-barcode.png',
                    });
                  });
              });
              return;
            }

            ///////////////////////with out template////////////////////////////////

            //1-Call api
            this.sendAttachmentDescription(dialogResult).subscribe((res) => {
              const tempHijriDateArr = convertEnglishToArabicNumbers(res.hijriDate)
                .replaceAll('/', '-')
                .split('-');

              const hijriDate = `${tempHijriDateArr[2]}-${tempHijriDateArr[1]}-${tempHijriDateArr[0]}`;
              ///////////////

              const tempGregorianDateArr = convertEnglishToArabicNumbers(
                formatDateToYYYYMMDD(new Date(res.date))
              ).split('-');
              const gregorianDate = `${tempGregorianDateArr[2]}-${tempGregorianDateArr[1]}-${tempGregorianDateArr[0]}`;

              let exportNumberWithPriority = `${convertEnglishToArabicNumbers(
                padToFourDigits(res.autoNumber)
              )}`;
              if (res.priority) {
                exportNumberWithPriority += ` - ${res.priority}`;
              }

              const htmlToBePrinted = getBarcodeWithOUTBackground(
                exportNumberWithPriority,
                //'٠٠٧٨ - فورا',
                hijriDate,

                // '١٤٤٦/٦/٢٢',
                gregorianDate,
                // '٢٠٢٤/١٢/٢٦',
                convertEnglishToArabicNumbers(res.attachmentDescription?.trim()?.replace(/"/g, '')),
                // 'ًصادر'
                res.base64Barcode
              );

              //2- Print
              printJS({
                printable: htmlToBePrinted,
                type: 'raw-html',
                base64: false,
                documentTitle: 'export-barcode.png',
              });
            });
          }
        }
      );
  }

  private sendAttachmentDescription(dialogResult: {
    status: string;
    statusCode: ModalStatusCode;
    data: { attachmentDescription: string };
  }) {
    return this.manageTransactionsService.exportableDocumentService
      .updateExportableDocumentAttachment(this.elementId, dialogResult.data.attachmentDescription)
      .pipe(
        tap((res) => {
          this.exportableDocumentDetails!.attachmentDescription = res.attachmentDescription;
        })
      );
  }

  formatArrays(concernedFoundations: { id: string; title: string; titleEn: string }[]): string {
    return concernedFoundations
      .map((ele) => {
        return this.lang === 'ar' ? ele.title : ele.titleEn;
      })
      .join(' ,');
  }

  onNavigateBack(): void {
    this.location.back();
  }

  onTabClicked(event: MatTabChangeEvent): void {
    if (event.index === 0) {
      return;
    }

    if (event.index === 1) {
      this.loadFile(this.elementId);

      return;
    }
    if (event.index === 2) {
      this.tabsLoading.tab2 = true;
      //  this.tabsLoading.tab2 = true;

      this.manageTransactionsService.requestsService
        .getExportRequestImportsAndExports(this.elementId, {
          pageSize: 1000,
          pageIndex: 0,
        })
        .pipe(
          map((res) => {
            // const cloneData: ImportExport[] = [];
            // res.data.forEach((element: any) => {
            //   cloneData.push({
            //     id: element.id,
            //     number: element.number,
            //     requestType: {
            //       id: element.requestType?.id,
            //       title: element.requestType?.title,
            //       titleEn: element.requestType?.titleEn,
            //     },
            //     isExportDocument: element.isExportDocument,
            //     documentType: element.documentType,
            //     otherDocumentType: element.otherDocumentType,
            //     requestId: element.requestId,
            //     title: element.title,
            //     titleEn: element.titleEn,

            //     date: element.date,
            //     viewWatchButton: element.isRestricted ? false : true,
            //     isRestricted: element.isRestricted,
            //   });
            // });

            this.importsExports = res.data;
          })
        )
        .subscribe();
      this.tabsLoading.tab2 = false;
      return;
    }
  }

  formatUsers(users: { id: string; name: string }[]): string {
    return users
      .map((ele) => {
        return ele.name;
      })
      .join(' ,');
  }
  addAttachDialog() {
    const dialogRef = this.dialog.open(AddAttachmentComponent, {
      data: {},
      width: '38.75rem',
      scrollStrategy: new NoopScrollStrategy(),
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        const payload = {
          attachmentsIds: res,
        };
        this.manageTransactionsService.exportableDocumentService
          .addImportExportAttachement(this.elementId, payload.attachmentsIds)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            tap((resp: any) => {
              this.intializePageData();
              this.toastr.success(this.translateService.instant('shared.fileAddedSuccessfully'));
            })
          )
          .subscribe();
      }
    });
  }

  onViewAttachment(e?: any): void {
    // If a file is passed as parameter (from upload component), use it
    // Otherwise, get the main document file from form (for backward compatibility)
    const file: File & {
      id: string;
      name: string;
      path: string;
      contentType: string;
    } = e;

    if (!file) {
      this.toastr.error('No file selected to view');
      return;
    }

    if (file.id) {
      const fileName = file.name ? file.name.toLowerCase() : '';
      const filePath = file.path;

      if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i)) {
        // Fetch image using getFileByPath
        this.manageImportsExportsService.wopiFilesService.getFileByPath(filePath).subscribe({
          next: (res) => {
            const imageUrl = URL.createObjectURL(res);
            this.dialog
              .open(ViewImageModalComponent, {
                data: imageUrl,
                minWidth: '62.5rem',
                maxWidth: '62.5rem',
                maxHeight: '95vh',
                height: '95vh',
                panelClass: ['action-modal', 'float-footer'],
                autoFocus: false,
                disableClose: true,
              })
              .afterClosed()
              .subscribe(() => URL.revokeObjectURL(imageUrl));
          },
        });
      } else if (fileName.endsWith('.pdf')) {
        this.manageImportsExportsService.requestsService
          .getRequestSingleAttachment(file.id)
          .subscribe({
            next: (res) => {
              const newFile = new File([res], file.name);
              const dialogRef = this.dialog.open(AddBarcodeExportableDocumentComponent, {
                minWidth: '62.5rem',
                maxWidth: '62.5rem',
                maxHeight: '95vh',
                height: '95vh',
                panelClass: ['action-modal', 'float-footer'],
                autoFocus: false,
                disableClose: true,
                data: {
                  file: newFile,
                  attachmentId: file.id,
                  hideHint: true,
                  showBarcode: false,
                },
              });
            },
          });
      }
    }
  }
  selectedForDelete: boolean = false;
  onSelectDelete() {
    this.selectedForDelete = true;
  }
  deleteItem() {
    console.log(document);
    const filtersDialogRef = this.dialog.open(DeletePopupComponent, {
      data: {
        title: this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupTitle'
        ),
        message: `${this.translateService.instant(
          'RegularReportsModule.AddRegularReportComponent.deletePopupMessage'
        )} `,
      },
      disableClose: true,
    });

    filtersDialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.isLoading = true;

        this.manageImportsExportsService.exportableDocumentService
          .deleteExportableDocumentById(this.elementId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              // navigate to parent route (same URL without id)
              let url = this.router.url.split('/')[1];
              this.router.navigateByUrl(url);
            },
            error: (err) => {
              this.isLoading = false;
              this.toastr.error(
                this.translateService.instant('shared.deleteFailed') || 'Delete failed'
              );
            },
          });
      }
    });
  }
}
