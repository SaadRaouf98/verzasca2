import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { Location } from '@angular/common';
import { ManageMeetingsService } from '@pages/manage-meetings/services/manage-meetings.service';
import { MeetingDetails } from '@core/models/meeting.model';
import { MeetingType } from '@core/enums/meeting-type.enum';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { MeetingStatus } from '@core/enums/meeting-status.enum';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { TranslateService } from '@ngx-translate/core';

import { Clipboard } from '@angular/cdk/clipboard';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.scss'],
})
export class MeetingDetailsComponent implements OnInit {
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
    private activatedRoute: ActivatedRoute,
    private languageService: LanguageService,
    private manageMeetingsService: ManageMeetingsService,
    private location: Location,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private toastr: CustomToastrService,
    private router: Router,
    private clipboard: Clipboard
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
    this.manageMeetingsService.meetingsService.getMeetingById(this.elementId).subscribe((res) => {
      this.meetingDetails = res;
    });
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
            .subscribe((res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.router.navigate(['../../'], {
                relativeTo: this.activatedRoute,
              });
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
