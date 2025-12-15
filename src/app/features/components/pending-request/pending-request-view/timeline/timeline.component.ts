import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChange,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { RequestProgressType } from '@core/enums/request-progress-type.enum';
import { RequestAction } from '@core/models/request-action.model';
import { Attachment } from '@core/models/request.model';
import {
  ViewCommitteeMembersApprovalComponent,
} from '@pages/imports-exports/modals/view-committee-members-approval/view-committee-members-approval.component';
import {
  ViewAttachmentsModalComponent,
} from '@shared/components/view-attachments-modal/view-attachments-modal.component';
import {
  downloadBlobOrFile,
  isSmallDeviceWidthForPopup,
  formatDateToTimeInAMPM,
} from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { LanguageService } from '@core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MinutesToReadableTimePipe } from '@shared/pipes/minutesToReadableTime.pipe';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatChipsModule,
    MatTooltipModule,
    RouterModule,
    MinutesToReadableTimePipe,
  ],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnChanges {
  requestActions!: RequestAction[];
  lang: string = 'ar';
  RequestProgressType = RequestProgressType;

  @Input() data!: RequestAction[];

  groupedActions: {
    date: string;
    hijriDate: string;
    items: RequestAction[];
  }[] = [];
  visibleCardCount = 5;

  constructor(
    private langugaeService: LanguageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private manageSharedService: ManageSharedService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.groupActionsByDate();
  }

  ngOnChanges(changes: { data: SimpleChange }): void {
    this.requestActions = changes.data.currentValue;
    this.groupActionsByDate();
  }

  trackByCard(index: number, card: any) {
    return card.item?.id || index;
  }

  get flattenedCards() {
    const cards: { date: string; hijriDate: string; item: RequestAction }[] =
      [];
    for (const group of this.groupedActions) {
      for (const item of group.items) {
        cards.push({
          date: group.date,
          hijriDate: group.hijriDate,
          item,
        });
      }
    }
    return cards;
  }

  groupActionsByDate() {
    const datePipe = new DatePipe('en-US');
    const groups: {
      [key: string]: { hijriDate: string; items: RequestAction[] };
    } = {};

    for (const item of this.requestActions || []) {
      const dateStr = datePipe.transform(item.date, 'dd/MM/yyyy');
      const hijriDate = item.hijriDate;
      const key = `${dateStr}|${hijriDate}`;
      if (!groups[key]) {
        groups[key] = { hijriDate, items: [] };
      }
      groups[key].items.push(item);
    }
    this.groupedActions = Object.keys(groups).map((key) => {
      const [date, hijriDate] = key.split('|');
      return {
        date,
        hijriDate,
        items: groups[key].items,
      };
    });
  }

  onDownloadFile(file: Attachment): void {
    this.manageSharedService.requestsService
      .getRequestSingleAttachment(file.id)
      .subscribe({
        next: (res) => {
          downloadBlobOrFile(file.name, res);
        },
      });
  }

  onGoToViewAttachments(attachment: Attachment): void {
    this.router.navigate(['/imports-exports/attachments/' + attachment.id], {
      queryParams: { name: attachment.name },
    });
  }

  onViewAttachments(attachments: Attachment[]): void {
    this.dialog.open(ViewAttachmentsModalComponent, {
      width: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
      autoFocus: false,
      disableClose: true,
      data: {
        attachments,
      },
    });
  }

  formatHijriDate(hijriDate: string): string {
    if (hijriDate) {
      return `${hijriDate.split('/')[2]}/${hijriDate.split('/')[1]}/${
        hijriDate.split('/')[0]
      }`;
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

  showMoreCards() {
    this.visibleCardCount += 5;
  }
}
