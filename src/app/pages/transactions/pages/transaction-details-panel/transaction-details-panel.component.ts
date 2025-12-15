import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import {
  RequestDetails,
  Action,
  RequestExportRecommendation,
} from '@core/models/request.model';
import { Transaction } from '@core/models/transaction.model';
import {
  RequestStatus,
  RequestStatusTranslationMap,
} from '@core/enums/request-status.enum';
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
import {
  RecordType,
  recordTypeTranslationMap,
} from '@core/enums/record-type.enum';
import { approvedAmountMechanismTranslationMap } from '@core/enums/approved-amount-mechanism.enum';
import { NgxPermissionsModule } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { TransactionInfoPanelComponent } from './transaction-info-panel/transaction-info-panel.component';

@Component({
  selector: 'app-transaction-details-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    CurrencyPipe,
    TransactionNumberPipe,
    MatExpansionModule,
    NgxPermissionsModule,
    TransactionInfoPanelComponent,
  ],
  templateUrl: './transaction-details-panel.component.html',
  styleUrls: ['./details.component.scss'],
})
export class TransactionDetailsPanelComponent {
  PermissionsObj = PermissionsObj;
  @Input() requestDetails!: RequestDetails;
  @Input() requestContainerDetails!: Transaction;
  @Input() lang: string = localStorage.getItem('lang') || 'ar';
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
  basicInfoState: boolean = false;
  importDataState: boolean = false;
  costState: boolean = false;
  proposalState: boolean = false;

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
}
