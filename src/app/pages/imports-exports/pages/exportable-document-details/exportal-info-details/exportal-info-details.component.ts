import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { RequestDetails, Action, RequestExportRecommendation } from '@core/models/request.model';
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
import {
  ExportedDocumentStatus,
  ExportedDocumentStatusTranslationMap,
} from '@core/enums/exported-document-status.enum';
import { TransactionNumberPipe } from '@shared/pipes/transaction-number.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { RecordType, recordTypeTranslationMap } from '@core/enums/record-type.enum';
import { approvedAmountMechanismTranslationMap } from '@core/enums/approved-amount-mechanism.enum';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { ExportableDocument } from '@core/models/exportable-document.model';

@Component({
  selector: 'app-exportal-info-details',
  templateUrl: './exportal-info-details.component.html',
  styleUrls: ['./exportal-info-details.component.scss'],
})
export class ExportalInfoDetailsComponent {
  PermissionsObj = PermissionsObj;
  // @Input() requestDetails!: RequestDetails;
  // @Input() requestContainerDetails!: Transaction;
  @Input() requestDetails: any;
  @Input() requestContainerDetails;
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
  ExportedDocumentStatus = ExportedDocumentStatus;
  ExportedDocumentStatusTranslationMap = ExportedDocumentStatusTranslationMap;
  RecordType = RecordType;
  recordTypeTranslationMap = recordTypeTranslationMap;
  environment = environment;

  approvedAmountMechanismTranslationMap = approvedAmountMechanismTranslationMap;
  basicInfoState: boolean = false;
  importDataState: boolean = false;
  costState: boolean = false;
  proposalState: boolean = false;
  ngOnInit() {
    console.log(this.requestDetails);
  }
  get isBasicInfoEmpty(): boolean {
    const req = this.requestDetails?.request;
    return !(
      req?.title ||
      req?.autoNumber ||
      req?.sector?.title ||
      req?.requestType?.title ||
      req?.foundation?.title ||
      (Array.isArray(req?.concernedFoundations) && req.concernedFoundations.length > 0) ||
      req?.subFoundation?.title
    );
  }
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
  // Add stubs for event handlers if needed
  updateAssignedUser() {}
  deleteAssignedUser() {}
  // Returns true if all basic info values are null or empty
}
