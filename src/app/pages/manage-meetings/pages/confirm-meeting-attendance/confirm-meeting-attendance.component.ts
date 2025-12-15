import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';

import { Location } from '@angular/common';
import { ManageMeetingsService } from '@pages/manage-meetings/services/manage-meetings.service';
import {
  ConfirmMeetingAttendanceCommand,
  MeetingDetails,
  MemberStatus,
} from '@core/models/meeting.model';
import { MeetingType } from '@core/enums/meeting-type.enum';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { MeetingStatus } from '@core/enums/meeting-status.enum';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-confirm-meeting-attendance',
  templateUrl: './confirm-meeting-attendance.component.html',
  styleUrls: ['./confirm-meeting-attendance.component.scss'],
})
export class ConfirmMeetingAttendanceComponent {
  elementId: string = '';
  meetingDetails!: MeetingDetails;
  MeetingType = MeetingType;
  disableSubmitBtn: boolean = false;
  MeetingStatus = MeetingStatus;
  PermissionsObj = PermissionsObj;
  passwordField: {
    type: 'text' | 'password';
    iconSrc: string;
  } = {
    type: 'password',
    iconSrc: 'assets/icons/eye-opened.png',
  };

  lang: string = 'ar';

  constructor(
    private toastr: CustomToastrService,
    private activatedRoute: ActivatedRoute,
    private languageService: LanguageService,
    private translateService: TranslateService,
    private router: Router,
    private manageMeetingsService: ManageMeetingsService,
    private location: Location,
    private clipboard: Clipboard,
    private dialog: MatDialog
  ) {}

  onNavigateBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.elementId = this.activatedRoute.snapshot.params['id'];
    this.lang = this.languageService.language;
    this.initializePageData();
  }

  initializePageData(): void {
    this.manageMeetingsService.meetingsService.getMeetingById(this.elementId).subscribe({
      next: (res) => {
        this.meetingDetails = res;
      },
    });
  }

  onCloseMeeting(): void {
    this.disableSubmitBtn = true;

    const dataToSend: ConfirmMeetingAttendanceCommand = {
      meetingId: this.meetingDetails.id,
      members: [],
      discussedContainersIds: [],
    };

    this.meetingDetails.committeeMembers.forEach((ele) => {
      dataToSend.members.push({
        memberId: ele.id,
        isAttended: ele.isAttended ? true : false,
        isOnVacation: ele.isOnVacation ? true : false,
      });
    });

    this.meetingDetails.members.forEach((ele) => {
      dataToSend.members.push({
        memberId: ele.id,
        isAttended: ele.isAttended ? true : false,
        isOnVacation: ele.isOnVacation ? true : false,
      });
    });

    this.meetingDetails.scheduledRequestContainers
      .filter((ele) => ele.isDiscussed)
      .forEach((ele) => {
        dataToSend.discussedContainersIds.push(ele.id);
      });

    this.meetingDetails.requestContainers
      .filter((ele) => ele.isDiscussed)
      .forEach((ele) => {
        dataToSend.discussedContainersIds.push(ele.id);
      });

    this.manageMeetingsService.meetingsService.confirmMeetingAttendance(dataToSend).subscribe({
      next: (res) => {
        this.disableSubmitBtn = true;
        this.toastr.success(
          this.translateService.instant(
            'ManageMeetingsModule.MeetingDetailsComponent.meetingClosedSuccessfully'
          )
        );
        this.router.navigate(['manage-meetings']);
      },
      error: (err) => {
        this.disableSubmitBtn = false;
      },
    });
  }

  onMemberPresenceChange(
    event: MatCheckboxChange,
    member: MemberStatus,
    status: 'isAttended' | 'isOnVacation'
  ) {
    if (event.checked) {
      if (member[status] === true) {
        member[status] = false;
      }
    }
  }

  onDeleteElement(): void {
    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'ManageMeetingsModule.ManageMeetingsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'ManageMeetingsModule.ManageMeetingsListComponent.deleteSectorWarning'
        )}  '${this.meetingDetails.title}' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageMeetingsService.meetingsService
            .deleteMeeting(this.meetingDetails.id)
            .subscribe({
              next: (res) => {
                this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
                this.router.navigate(['../../'], {
                  relativeTo: this.activatedRoute,
                });
              },
            });
        },
      },
    });
  }

  onCopyMeetingUrl(): void {
    this.clipboard.copy(this.meetingDetails.url);
    this.toastr.success('URL copied successfully');
  }

  onTogglePassword(): void {
    if (this.passwordField.type === 'password') {
      this.passwordField.type = 'text';
      this.passwordField.iconSrc = 'assets/icons/eye-closed.png';
    } else {
      this.passwordField.type = 'password';
      this.passwordField.iconSrc = 'assets/icons/eye-opened.png';
    }
  }
}
