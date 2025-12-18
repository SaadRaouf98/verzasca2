import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { ExportableDocumentActionType } from '@core/enums/exportable-document-action-type.enum';
import {
  RecordDetailedMember,
  RecordDetails,
  RecordMembersRealTime,
} from '@core/models/record.model';
import { LanguageService } from '@core/services/language.service';
import { ManageRecordsService } from '@pages/manage-records/services/manage-records.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import {
  b64toBlob,
  isSmallDeviceWidthForPopup,
  isSmallDeviceWidthForTable,
} from '@shared/helpers/helpers';
import { ApprovedAmountMechanism } from '@core/enums/approved-amount-mechanism.enum';
import { MatDialog } from '@angular/material/dialog';
import { ViewNoteModalComponent } from '@pages/manage-records/components/view-note-modal/view-note-modal.component';
import { Clipboard } from '@angular/cdk/clipboard';

import { PermissionsObj } from '@core/constants/permissions.constant';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { TakeActionModalComponent } from '@pages/manage-records/components/take-action-modal/take-action-modal.component';
import { RecordType } from '@core/enums/record-type.enum';
import { Observable, map, forkJoin, catchError, of } from 'rxjs';
import { PDFSource } from 'ng2-pdf-viewer';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { DeletePopupComponent } from '@shared/new-components/delete-popup/delete-popup.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-record-details',
  templateUrl: './record-details.component.html',
  styleUrls: [
    './record-details.component.scss',
    '../../../imports-exports/pages/request-details/request-details.component.scss',
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RecordDetailsComponent implements OnInit {
  viewedSection: 0 | 1 = 0;
  recordId: string = '';
  recordDetails!: RecordDetails;
  ExportableDocumentActionType = ExportableDocumentActionType;
  PermissionsObj = PermissionsObj;

  membersSource: MatTableDataSource<RecordDetailedMember> =
    new MatTableDataSource<RecordDetailedMember>([]);
  expandedElement!: RecordDetailedMember | null;

  ApprovedAmountMechanism = ApprovedAmountMechanism;
  isLoading: boolean = false;

  lang: string = 'ar';

  readonly commentDesiredLimit = 120;

  isRecordFileLoading: boolean = true;
  error: any;

  recordFile: {
    fileBase64: string | undefined;
    pdfSrc: string | Uint8Array | PDFSource | undefined;
    name: string;
  } = {
    fileBase64: undefined,
    pdfSrc: undefined,
    name: '',
  };

  RecordType = RecordType;
  pages: Array<{ thumbnail: string }> = [];
  detailsState: boolean = false;
  dateState: boolean = false;
  costState: boolean = false;
  costApprovedState: boolean = false;
  signaturesState: boolean = false;
  constructor(
    private langugaeService: LanguageService,
    private manageRecordsService: ManageRecordsService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private clipboard: Clipboard,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private location: Location,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.activatedRoute.params.subscribe((params) => {
      this.recordId = this.activatedRoute.snapshot.params['id'];
      this.intializePageData();
    });
  }

  goBack() {
    this.location.back();
  }

  intializePageData(): void {
    this.isLoading = true;

    let requests: Observable<any>[] = [];

    requests.push(
      this.getRecordDetails().pipe(
        catchError((error) => {
          // handle error
          this.isLoading = false;
          return of(error);
        })
      )
    );

    requests.push(
      this.loadRecordFile().pipe(
        catchError((error) => {
          // handle error
          this.isLoading = false;
          return of(error);
        })
      )
    );

    forkJoin({
      ...requests,
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.viewedSection = 0;
      },
    });
  }

  getRecordDetails(): Observable<void> {
    return this.manageRecordsService.recordsService.getRecordDetails(this.recordId).pipe(
      map((res) => {
        this.recordDetails = res;
        //Sort members based on action date in 'Ascending' order
        this.sortMembers(res.members);

        this.membersSource = new MatTableDataSource(res.members);
        this.initRealTime();
      })
    );
  }

  initRealTime(): void {
    this.manageRecordsService.notificationsHubService.registerMethod(
      'RecordReceiver',
      (data: RecordMembersRealTime) => {
        console.info('data received:', data);
        if (this.recordDetails.id === data.recordId) {
          //1)- Reload file
          this.loadRecordFile().subscribe();

          //2)- Update members
          const foundMember = this.membersSource.data.find(
            (ele) => ele.id === data.member.memberId
          );

          if (foundMember) {
            if (data.member.actionType === null) {
              foundMember.action = null;
            } else {
              foundMember.action = {
                id: foundMember!.action?.id || '',
                type: data.member.actionType,
                date: data.member.date,
                comment: data.member.comment,
                isPhoneAction: data.member.isPhoneAction,
                commentExpanded: foundMember!.action?.commentExpanded || false,
              };
            }

            this.sortMembers(this.membersSource.data);
            this.membersSource = new MatTableDataSource(this.membersSource.data);
          }
        }
      }
    );
  }

  onTabClicked(event: MatTabChangeEvent): void {
    this.viewedSection = event.index as 0 | 1;
  }

  onNavigateBack(): void {
    this.location.back();
  }
  loadRecordFile(): Observable<void> {
    this.isRecordFileLoading = true;

    return this.manageRecordsService.recordsService.getRecordFile(this.recordId).pipe(
      map((res) => {
        this.isRecordFileLoading = false;
        this.recordFile.name = res.name;
        this.recordFile.fileBase64 = res.file;
        this.recordFile.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(b64toBlob(this.recordFile.fileBase64, 'application/pdf'))
        );
      })
    );
  }

  view_hide_element(element: RecordDetailedMember): void {
    if (this.expandedElement == element) {
      this.expandedElement = null;
    } else {
      this.expandedElement = element;
    }
  }

  check_view_element(element: RecordDetailedMember): boolean {
    if (this.expandedElement == element) {
      return true;
    } else {
      return false;
    }
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['icon', 'name', 'date'];
    } else {
      return ['icon', 'name', 'comment', 'date'];
    }
  }

  isCommentLengthSuitable(comment: string | undefined): boolean {
    if (!comment) {
      return true;
    }

    if (comment.length <= this.commentDesiredLimit) {
      return true;
    }

    return false;
  }

  formatComment(element: RecordDetailedMember): string {
    if (!element.action || (element.action && !element.action.comment)) {
      return '';
    }

    if (
      (element.action!.comment && element.action!.comment.length < this.commentDesiredLimit) ||
      element.action!.commentExpanded
    ) {
      return element.action!.comment!;
    }

    return element.action.comment!.slice(0, this.commentDesiredLimit) + '...';
  }

  onExpandComment(element: RecordDetailedMember): void {
    if (element.action!.commentExpanded) {
      element.action!.commentExpanded = false;
    } else {
      element.action!.commentExpanded = true;
    }
  }

  onViewComment(comment: string): void {
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

  onCopyNote(comment: string): void {
    this.clipboard.copy(comment);
    this.toastr.success('Note copied successfully');
  }

  onTakeActionViaPhone(member: RecordDetailedMember): void {
    this.dialog.open(TakeActionModalComponent, {
      minWidth: '31.25rem',
      maxWidth: '31.25rem',
      maxHeight: '44.3125rem',
      panelClass: 'action-modal',
      autoFocus: false,
      disableClose: false,
      data: {
        recordId: this.recordDetails.id,
        memberId: member.id,
      },
    });
  }

  onDeleteAction2(member: RecordDetailedMember): void {
    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        headerTranslationRef: this.translateService.instant(
          'ManageRecordsModule.RecordDetailsComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'ManageRecordsModule.RecordDetailsComponent.deleteActionWarning'
        )}  '${member.name}' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageRecordsService.recordsService
            .deleteRecordAction(this.recordDetails.id, member.id)
            .subscribe({
              next: (res) => {
                this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              },
            });
        },
      },
    });
  }

  onDeleteAction(member: RecordDetailedMember): void {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      data: {
        title: this.translateService.instant(
          'ManageRecordsModule.RecordDetailsComponent.confirmDeletion'
        ),
        message: `${this.translateService.instant(
          'ManageRecordsModule.RecordDetailsComponent.deleteActionWarning'
        )}  '${member.name}' ${this.translateService.instant('shared.questionMark')}`,
      },
      width: '500px',
      scrollStrategy: new NoopScrollStrategy(),
    });
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.manageRecordsService.recordsService
          .deleteRecordAction(this.recordDetails.id, member.id)
          .subscribe({
            next: (res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
            },
          });
      }
    });
  }

  private sortMembers(members: RecordDetailedMember[]) {
    members.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      if (!a.action) {
        return 1; //[b,a]
      }

      if (!b.action) {
        return -1; //[a,b]
      }

      if (new Date(a.action.date) <= new Date(b.action.date)) {
        return -1; //[a,b]
      }
      return 1; //[b,a]
    });
  }

  onViewNoteFile(): void {
    if (this.recordDetails.noteFile) {
      window.open(
        `${window.location.origin}/imports-exports/attachments/${this.recordDetails.noteFile.id}?name=${this.recordDetails.noteFile.name}`,
        '_blank'
      );
    }
  }
}
