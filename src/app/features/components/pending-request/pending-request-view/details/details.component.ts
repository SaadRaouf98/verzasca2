import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import {
  RequestDetails,
  Action,
  RequestExportRecommendation,
  Attachment,
} from '@core/models/request.model';
import { Transaction } from '@core/models/transaction.model';
import { RequestStatus, RequestStatusTranslationMap } from '@core/enums/request-status.enum';
import {
  RequestContainerStatus,
  statusTranslationMap,
} from '@core/enums/request-container-status.enum';
import { environment } from 'src/environments/environment';
import { MemberApprovalType } from '@core/enums/member-approval-type.enum';
import {
  ExportedDocumentType,
  exportedDocumentTypeTranslationMap,
} from '@core/enums/exported-docuemnt-type.enum';
import { TransactionNumberPipe } from '@shared/pipes/transaction-number.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { RecordType, recordTypeTranslationMap } from '@core/enums/record-type.enum';
import { approvedAmountMechanismTranslationMap } from '@core/enums/approved-amount-mechanism.enum';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { MatDialog } from '@angular/material/dialog';
import { ViewAttachmentsModalComponent } from '@shared/components/view-attachments-modal/view-attachments-modal.component';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { EditFileWithBarcodeModalComponent } from '@pages/imports-exports/modals/edit-file-with-barcode-modal/edit-file-with-barcode-modal.component';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    CurrencyPipe,
    TransactionNumberPipe,
    MatExpansionModule,
    NgxPermissionsModule,
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent {
  PermissionsObj = PermissionsObj;
  @Input() requestDetails!: RequestDetails;
  @Input() requestContainerDetails!: Transaction;
  @Input() lang!: string;
  @Input() RequestStatus = RequestStatus;
  @Input() RequestContainerStatus = RequestContainerStatus;
  @Input() statusTranslationMap = statusTranslationMap;
  @Input() RequestStatusTranslationMap = RequestStatusTranslationMap;
  @Input() currentUser: any;
  @Input() requestExportRecommendation: any;

  @Input() data!: RequestExportRecommendation;
  @Input() requestId!: string;

  ExportedDocumentType = ExportedDocumentType;
  exportedDocumentTypeTranslationMap = exportedDocumentTypeTranslationMap;
  RecordType = RecordType;
  recordTypeTranslationMap = recordTypeTranslationMap;
  environment = environment;

  approvedAmountMechanismTranslationMap = approvedAmountMechanismTranslationMap;
  basicInfoState: boolean = true;
  importDataState: boolean = true;
  costState: boolean = true;
  proposalState: boolean = true;
  private dialog = inject(MatDialog);
  private manageImportsExportsService = inject(ManageImportsExportsService);
  // Utility method for formatting foundations
  formatConcernedFoundations(
    concernedFoundations: { id: string; title: string; titleEn: string }[] = []
  ): string {
    return concernedFoundations
      .map((ele) => (this.lang === 'ar' ? ele.title : ele.titleEn))
      .join(' ,');
  }
  formatProcessTypeJustifications(
    processTypeJustifications: { id: string; title: string; titleEn: string }[]
  ): string {
    if (this.lang === 'ar') {
      return processTypeJustifications.map((ele) => ele.title).join(' ,');
    }
    return processTypeJustifications.map((ele) => ele.titleEn).join(' ,');
  }
  onViewAttachments(file: any): void {
    console.log('application/pdf', file.contentType);
    let fileType = file.fileType || file.contentType || '';

    // Convert to .pdf if contentType contains 'pdf'
    if (fileType.toLowerCase().includes('pdf')) {
      fileType = '.pdf';
    }

    const attachment = {
      fileBlob: file.fileBlob || file.file || null,
      fileType: fileType,
      fileName: file.fileName || file.name || '',
      fileId: file.fileId || file.id || '',
      filePath: file.filePath || file.path || '',
    };
    console.log(attachment.fileType);
    if (attachment.fileType === '.pdf') {
      //We need to fetch pdf file from server
      this.manageImportsExportsService.wopiFilesService
        .getTemporaryFile(attachment.fileId)
        .subscribe({
          next: (res) => {
            this.dialog
              .open(EditFileWithBarcodeModalComponent, {
                minWidth: '62.5rem',
                maxWidth: '62.5rem',
                maxHeight: '95vh',
                height: '95vh',
                panelClass: ['action-modal', 'float-footer'],
                autoFocus: false,
                disableClose: true,
                data: {
                  fileBlob: res,
                  fileType: attachment.fileType, //.pdf
                  fileName: attachment.fileName,
                  fileId: attachment.fileId,
                  filePath: attachment.filePath,
                  requestId: this.requestId,
                  showBarcode: false,
                },
              })
              .afterClosed()
              .subscribe((res) => {});
          },
        });
    } else {
      //The file is not pdf,Just open the dialog
      this.dialog
        .open(EditFileWithBarcodeModalComponent, {
          minWidth: '62.5rem',
          maxWidth: '62.5rem',
          maxHeight: '95vh',
          height: '95vh',
          panelClass: ['action-modal', 'float-footer'],
          autoFocus: false,
          disableClose: true,
          data: {
            fileBlob: attachment.fileBlob,
            fileType: attachment.fileType, //.doc
            fileName: attachment.fileName,
            fileId: attachment.fileId,
            filePath: attachment.filePath,
            requestId: this.requestId,
          },
        })
        .afterClosed()
        .subscribe((res) => {});
    }
  }
  // Add stubs for event handlers if needed
  updateAssignedUser() {}
  deleteAssignedUser() {}
}
