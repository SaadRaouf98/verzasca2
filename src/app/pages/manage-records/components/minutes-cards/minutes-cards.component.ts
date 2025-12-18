import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommitteeIds, TableRecord } from '@core/models/record.model';
import { ExportableDocumentActionType } from '@core/enums/exportable-document-action-type.enum';
import { Clipboard } from '@angular/cdk/clipboard';

import { ViewNoteModalComponent } from '@pages/manage-records/components/view-note-modal/view-note-modal.component';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { MatDialog } from '@angular/material/dialog';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-minutes-cards',
  templateUrl: './minutes-cards.component.html',
  styleUrls: ['./minutes-cards.component.scss'],
})
export class MinutesCardsComponent implements OnInit {
  constructor(
    private clipboard: Clipboard,
    private dialog: MatDialog,
    private toastr: CustomToastrService
  ) {}

  @Input() data: TableRecord[] = [];
  @Input() committeeId: string[] = [CommitteeIds.Finance, CommitteeIds.Coordinating];

  ngOnInit() {
    setTimeout(() => {}, 2000);
  }

  onViewComment(comment: any): void {
    this.dialog.open(ViewNoteModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '800px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: false,
      data: {
        comment,
      },
    });
  }

  get hasItemsForCommittee(): boolean {
    return (
      Array.isArray(this.data) &&
      this.data.some((item) => this.committeeId.includes(item.committee?.id))
    );
  }

  onCopyNote(comment: any): void {
    this.clipboard.copy(comment);
    this.toastr.success('تم النسخ بنجاح');
  }

  protected readonly ExportableDocumentActionType = ExportableDocumentActionType;
  // protected readonly it = it;
}
