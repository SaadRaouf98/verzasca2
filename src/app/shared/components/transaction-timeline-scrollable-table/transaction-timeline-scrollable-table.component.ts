import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestAction } from '@core/models/request-action.model';
import { Attachment } from '@core/models/request.model';
import { LanguageService } from '@core/services/language.service';
import {
  downloadBlobOrFile,
  formatDateToTimeInAMPM,
  isSmallDeviceWidthForPopup,
} from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { ViewAttachmentsModalComponent } from '../view-attachments-modal/view-attachments-modal.component';
import { ViewCommitteeMembersApprovalComponent } from '@pages/imports-exports/modals/view-committee-members-approval/view-committee-members-approval.component';
import { RequestProgressType } from '@core/enums/request-progress-type.enum';

@Component({
  selector: 'app-transaction-timeline-scrollable-table',
  templateUrl: './transaction-timeline-scrollable-table.component.html',
  styleUrls: ['./transaction-timeline-scrollable-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TransactionTimelineScrollableTableComponent implements OnInit, OnChanges {
  requestActions!: RequestAction[];
  lang: string = 'ar';
  RequestProgressType = RequestProgressType;

  @Input() data!: RequestAction[];
  @Input() requestId!: string | undefined;

  constructor(
    private langugaeService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private manageSharedService: ManageSharedService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
  }

  ngOnChanges(changes: { data: SimpleChange }): void {
    this.requestActions = changes.data.currentValue;
  }

  onDownloadFile(file: Attachment): void {
    this.manageSharedService.requestsService.getRequestSingleAttachment(file.id).subscribe({
      next: (res) => {
        downloadBlobOrFile(file.name, res);
      },
    });
  }

  onViewAttachments(attachments: Attachment[]): void {
    this.dialog.open(ViewAttachmentsModalComponent, {
      width: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
      autoFocus: false,
      disableClose: false,
      data: {
        attachments,
      },
    });
  }

  onViewCommitteeApprovals(stepId: string, requestId?: string) {
    if (this.requestId || requestId) {
      this.dialog.open(ViewCommitteeMembersApprovalComponent, {
        width: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
        autoFocus: false,
        disableClose: false,
        data: {
          stepId,
          requestId: this.requestId || requestId,
        },
      });
    }
  }
  formatHijriDate(hijriDate: string): string {
    if (hijriDate) {
      return `${hijriDate.split('/')[2]}/${hijriDate.split('/')[1]}/${hijriDate.split('/')[0]}`;
    }
    return '';
  }

  getTime(date: string): string {
    return formatDateToTimeInAMPM(new Date(date));
  }

  getFileType(element: RequestAction): string {
    if (element.progressType === RequestProgressType.Recommendation) {
      return '(مقترح دراسة)';
    } else if (element.progressType === RequestProgressType.Statement) {
      return '(طلب إفادة)';
    }
    return '';
  }
}
