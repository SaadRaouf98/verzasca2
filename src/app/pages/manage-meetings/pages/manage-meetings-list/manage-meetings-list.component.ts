import { Component, Injector, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { Observable, tap } from 'rxjs';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { Location } from '@angular/common';
import { AllMeetings, Meeting, MeetingsFilterForm } from '@core/models/meeting.model';
import { MeetingType } from '@core/enums/meeting-type.enum';
import { ManageMeetingsService } from '@pages/manage-meetings/services/manage-meetings.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { AuthService } from '@core/services/auth/auth.service';
import { MeetingStatus } from '@core/enums/meeting-status.enum';
import { AbstractTable } from '@core/abstract-classes/abstract-table.abstract';

@Component({
  selector: 'app-manage-meetings-list',
  templateUrl: './manage-meetings-list.component.html',
  styleUrls: ['./manage-meetings-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ManageMeetingsListComponent extends AbstractTable implements OnInit {
  meetingsSource: MatTableDataSource<Meeting> = new MatTableDataSource<Meeting>([]);
  override expandedElement!: Meeting | null;

  filtersData: MeetingsFilterForm = {} as {
    searchKeyword?: string;
    fromDate?: string;
    toDate?: string;
    hijriFromDate?: string;
    hijriToDate?: string;
  };

  meetingType = MeetingType;
  PermissionsObj = PermissionsObj;

  constructor(
    private dialog: MatDialog,
    private manageTimeTableService: ManageMeetingsService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private location: Location,
    private authService: AuthService,
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.initializeTable().subscribe();
  }

  initializeTable(): Observable<AllMeetings> {
    this.isLoading = true;

    return this.manageTimeTableService.meetingsService
      .getMeetingsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.meetingsSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  onFiltersChange(filtersData: MeetingsFilterForm): void {
    this.filtersData = filtersData;
    this.pageIndex = 0;
    this.initializeTable().subscribe();
  }

  onViewElement(element: Meeting): void {
    const currentUserPermissions = this.authService.userPermissions;

    if (
      element.status === MeetingStatus.Scheduled &&
      currentUserPermissions.includes(PermissionsObj.UpdateMeeting)
    ) {
      this.router.navigate([`${element.id}/attend`], {
        relativeTo: this.activatedRoute,
      });
    } else if (
      element.status === MeetingStatus.Closed &&
      currentUserPermissions.includes(PermissionsObj.ConfirmMeetingAttendance)
    ) {
      this.router.navigate([`${element.id}/confirm`], {
        relativeTo: this.activatedRoute,
      });
    } else {
      this.router.navigate([`${element.id}`], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  onEditElement(elementId: string): void {
    this.router.navigate([`${elementId}/edit`], {
      relativeTo: this.activatedRoute,
    });
  }

  onDeleteElement(element: Meeting): void {
    const lang = this.langugaeService.language;

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        headerTranslationRef: this.translateService.instant(
          'ManageMeetingsModule.ManageMeetingsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'ManageMeetingsModule.ManageMeetingsListComponent.deleteSectorWarning'
        )}  '${element.title}' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageTimeTableService.meetingsService.deleteMeeting(element.id).subscribe({
            next: (res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.initializeTable().subscribe();
            },
          });
        },
      },
    });
  }

  onNavigateBack(): void {
    this.location.back();
  }

  onGoToDetails(elementId: string): void {
    this.router.navigate([`${elementId}`], {
      relativeTo: this.activatedRoute,
    });
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['committee', 'actions'];
    } else {
      return [
        'committee',
        'title',
        'containersCount',
        'memberCount',
        'meetingType',
        'isVirtual',
        'attendanceCount',
        'durationInMinutes',
        'meetingDateTime',
        'actions',
      ];
    }
  }
}
