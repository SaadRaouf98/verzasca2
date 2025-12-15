import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ImportsExportsRoutingModule } from './imports-exports-routing.module';
import { ImportsExportsListComponent } from './pages/imports-exports-list/imports-exports-list.component';
import { SharedModule } from '@shared/shared.module';
import { AddImportComponent } from './components/add-import/add-import.component';
import { RequestDetailsComponent } from './pages/request-details/request-details.component';
import { AddTransactionComponent } from './pages/add-transaction/add-transaction.component';
import { LinkTransactionComponent } from './components/link-transaction/link-transaction.component';
import { ExportableDocumentDetailsComponent } from './pages/exportable-document-details/exportable-document-details.component';
import { DocumentEditorModule } from '@txtextcontrol/tx-ng-document-editor';
import { RequestAttachmentViewerComponent } from './pages/request-attachment-viewer/request-attachment-viewer.component';
import { MatCardModule } from '@angular/material/card';
import { EditFileWithBarcodeModalComponent } from './modals/edit-file-with-barcode-modal/edit-file-with-barcode-modal.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AddTransactionAddImportComponent } from './pages/add-transaction-add-import/add-transaction-add-import.component';
import { AddImportAttachmentsComponent } from './components/add-import-attachments/add-import-attachments.component';
import { EditImportComponent } from './components/edit-import/edit-import.component';
import { AddExportDocumentComponent } from './components/add-export-document/add-export-document.component';
import { AddBarcodeExportableDocumentComponent } from './components/add-barcode-exportable-document/add-barcode-exportable-document.component';
import { ExportableDocumentViewerComponent } from './pages/exportable-document-viewer/exportable-document-viewer.component';
import { DeliveryReceiptComponent } from './pages/delivery-receipt/delivery-receipt.component';
import { DeliveryReceiptFormModalComponent } from './components/delivery-receipt-form-modal/delivery-receipt-form-modal.component';
import { DeliveryReceiptsListComponent } from './pages/delivery-receipts-list/delivery-receipts-list.component';
import { UpdateDeliveryReceiptModalComponent } from './components/update-delivery-receipt-modal/update-delivery-receipt-modal.component';
import { ImportsExportsFiltersComponent } from './components/imports-exports-filters/imports-exports-filters.component';
import { ResetRequestModalComponent } from './components/reset-request-modal/reset-request-modal.component';
import { EditorFullPageComponent } from './pages/editor-full-page/editor-full-page.component';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MY_FORMATS } from '@core/utils/date-picker-format';
import { SingleGregorianCalendarComponent } from '@shared/components/calendar/single-gregorian-calendar/single-gregorian-calendar.component';
import { SingleHijriCalendarComponent } from '@shared/components/calendar/single-hijri-calendar/single-hijri-calendar.component';
import { RangeGregorianCalendarComponent } from '@shared/components/calendar/range-gregorian-calendar/range-gregorian-calendar.component';
import { RangeHijriCalendarComponent } from '@shared/components/calendar/range-hijri-calendar/range-hijri-calendar.component';
import { TakeCommitteeMemberApprovalActionComponent } from './modals/take-committee-member-approval-action/take-committee-member-approval-action.component';
import { ViewCommitteeMembersApprovalComponent } from './modals/view-committee-members-approval/view-committee-members-approval.component';
import { PrintBarcodeModalComponent } from './modals/print-barcode-modal/print-barcode-modal.component';
import { ImportsListComponent } from '@pages/imports-exports/components/imports-list/imports-list.component';
import { ExportsListComponent } from '@pages/imports-exports/components/exports-list/exports-list.component';
import { ExportsFiltersComponent } from '@pages/imports-exports/components/exports-filters/exports-filters.component';
import { UpdateAccessibilityModalComponent } from '@pages/imports-exports/components/update-accessibility-modal/update-accessibility-modal.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { SingleSelectComponent } from '@shared/components/single-select/single-select.component';
import { TimelineComponent } from '@features/components/pending-request/pending-request-view/timeline/timeline.component';
import { DetailsComponent } from '@features/components/pending-request/pending-request-view/details/details.component';
import { TransactionNumberPipe } from '../../shared/pipes/transaction-number.pipe';
import { TableListComponent } from '@shared/new-components/table-list/table-list.component';
import { InputComponent } from '@shared/components/input/input.component';
import { MembersApprovalComponent } from '@features/components/pending-request/pending-request-view/members-approval/members-approval.component';
import { FiltersComponent } from '@features/components/pending-request/pending-request-list/filters/filters.component';
import { UploadAttachmentComponent } from '@shared/components/upload-attachment/upload-attachment.component';
import { ExportalInfoDetailsComponent } from './pages/exportable-document-details/exportal-info-details/exportal-info-details.component';
import { ExportalBasicInfoComponent } from './pages/exportable-document-details/exportal-basic-info/exportal-basic-info.component';
import { ExportImportDetailsComponent } from './pages/exportable-document-details/exporta-import-details/exporta-import-details.component';
import { AuthorizationPopupComponent } from '@shared/new-components/authorization-popp/authorization-popup.component';

@NgModule({
  declarations: [
    ImportsExportsListComponent,
    AddImportComponent,
    LinkTransactionComponent,
    RequestDetailsComponent,
    AddTransactionComponent,
    ExportableDocumentDetailsComponent,
    RequestAttachmentViewerComponent,
    EditFileWithBarcodeModalComponent,
    AddTransactionAddImportComponent,
    AddImportAttachmentsComponent,
    EditImportComponent,
    AddExportDocumentComponent,
    AddBarcodeExportableDocumentComponent,
    ExportableDocumentViewerComponent,
    DeliveryReceiptComponent,
    DeliveryReceiptFormModalComponent,
    DeliveryReceiptsListComponent,
    UpdateDeliveryReceiptModalComponent,
    ImportsExportsFiltersComponent,
    ResetRequestModalComponent,
    EditorFullPageComponent,
    RequestAttachmentViewerComponent,
    TakeCommitteeMemberApprovalActionComponent,
    ViewCommitteeMembersApprovalComponent,
    PrintBarcodeModalComponent,
    // DocumentEditorComponent,
    ImportsListComponent,
    ExportsListComponent,
    ExportsFiltersComponent,
    UpdateAccessibilityModalComponent,
    ExportalInfoDetailsComponent,
    ExportalBasicInfoComponent,
    ExportImportDetailsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DocumentEditorModule,
    ImportsExportsRoutingModule,
    MatCardModule,
    PdfViewerModule,
    SingleGregorianCalendarComponent,
    SingleHijriCalendarComponent,
    RangeGregorianCalendarComponent,
    RangeHijriCalendarComponent,
    MultiSelectComponent,
    SingleSelectComponent,
    TimelineComponent,
    DetailsComponent,
    TransactionNumberPipe,
    TableListComponent,
    InputComponent,
    MembersApprovalComponent,
    FiltersComponent,
    UploadAttachmentComponent,
    AuthorizationPopupComponent,
  ],
  providers: [
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Ensure the locale matches the desired format
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ImportsExportsModule {}
