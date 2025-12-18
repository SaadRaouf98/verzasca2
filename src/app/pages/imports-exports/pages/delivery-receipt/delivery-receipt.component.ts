import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DeliveryReceiptAttachmentType } from '@core/enums/delivery-receipt-attachment-type.enum';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { DeliveryReceiptPrinter } from '@core/models/delivery-receipt-printer.model';
import {
  AllDeliveryReceipt,
  DeliveryReceiptBasicRow,
  UpdateDeliveryReceiptsRowsCommand,
} from '@core/models/delivery-receipt.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { LanguageService } from '@core/services/language.service';
import { DeliveryReceiptFormModalComponent } from '@pages/imports-exports/components/delivery-receipt-form-modal/delivery-receipt-form-modal.component';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';

@Component({
  selector: 'app-delivery-receipt',
  templateUrl: './delivery-receipt.component.html',
  styleUrls: ['./delivery-receipt.component.scss'],
})
export class DeliveryReceiptComponent implements OnInit {
  documentsIds: string[] = [];
  deliveryReceiptBasicRowsSource: MatTableDataSource<DeliveryReceiptBasicRow> =
    new MatTableDataSource<DeliveryReceiptBasicRow>([]);
  ExportedDocumentType = ExportedDocumentType;
  DeliveryReceiptAttachmentType = DeliveryReceiptAttachmentType;
  currentStep: number = 1;
  isLoading: boolean = false;
  htmlStr: SafeHtml = '';
  lang: string = 'ar';

  constructor(
    private activatedRoute: ActivatedRoute,
    private langugaeService: LanguageService,
    private manageImportsExportsService: ManageImportsExportsService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.currentStep = 1;
    this.lang = this.langugaeService.language;
    this.documentsIds = this.activatedRoute.snapshot.queryParams['ids']?.split(',');
    this.initializeTable();
  }

  initializeTable(): void {
    this.isLoading = true;
    this.manageImportsExportsService.deliveryReceiptsService
      .getDeliveryReceiptsBasicRows(this.documentsIds)
      .subscribe((res) => {
        this.isLoading = false;
        this.deliveryReceiptBasicRowsSource = new MatTableDataSource(res);
      });
  }

  onEditRow(element: DeliveryReceiptBasicRow): void {
    const dialogRef = this.dialog.open(DeliveryReceiptFormModalComponent, {
      width: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: false,
      data: element,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
        element = dialogResult.data;

        /* */

        const cloneRowsData: DeliveryReceiptBasicRow[] = JSON.parse(
          JSON.stringify(this.deliveryReceiptBasicRowsSource.data)
        );
        for (let ele of cloneRowsData) {
          if (ele.id === dialogResult.data.id) {
            ele.attachmentType = dialogResult.data.attachmentType;
            ele.otherAttachmentType = dialogResult.data.otherAttachmentType;
            ele.attachments = dialogResult.data.attachments;
            ele.subFoundation = dialogResult.data.subFoundation;
            ele.foundationDescription = dialogResult.data.foundationDescription;
          }
        }

        this.deliveryReceiptBasicRowsSource = new MatTableDataSource(cloneRowsData);
      }
    });
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['autoNumber', 'actions'];
    } else {
      return [
        'rowNumber',
        'autoNumber',
        'date',
        'type',
        'attachments',
        'foundation',
        'subFoundation',
        'actions',
      ];
    }
  }

  private getHTMLString(data: AllDeliveryReceipt[]): void {
    this.htmlStr = this.sanitizer.bypassSecurityTrustHtml(
      DeliveryReceiptPrinter.getHTMLString(data)
    );
  }

  onPrint(): void {
    let w = window.open();
    w!.document.write(document.getElementById('receipt')!.innerHTML);
    w!.print();
    w!.close();
  }

  onDownload(): void {
    html2canvas(document.getElementById('receipt')!).then((canvas) => {
      const contentDataURL = canvas.toDataURL('image/png');
      let pdf = new jspdf({
        orientation: 'l',
        unit: 'pt',
        format: [canvas.width, canvas.height], // set needed dimensions for any element
      }); // A4 size page of PDF
      let position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, canvas.width, canvas.height);

      pdf.save('بيان التسليم.pdf'); // Generated PDF
    });
  }

  onEditDetails(): void {
    const data: UpdateDeliveryReceiptsRowsCommand[] = [];

    for (const [index, value] of this.deliveryReceiptBasicRowsSource.data.entries()) {
      /*  if (!value.subFoundation && !value.foundationDescription) {
        this.toastr.error(
          '  يجب تحديد الجهة الثانوية المرسل اليها للصف رقم' + (index + 1)
        );
        return;
      } */
      data.push({
        id: value.id,
        attachmentType: value.attachmentType,
        otherAttachmentType: value.otherAttachmentType,
        attachments: value.attachments,
        foundationDescription: value.foundationDescription,
        subFoundationId: value.subFoundation?.id,
      });
    }

    this.manageImportsExportsService.deliveryReceiptsService
      .updateDeliveryReceiptsBasicRows(data)
      .subscribe((res) => {
        this.currentStep = 2;

        this.getHTMLString(res);
      });
  }
}
