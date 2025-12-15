import { NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { arabicDays, arabicMonths } from '@core/constants/days-months.constant';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { MeetingStatus } from '@core/enums/meeting-status.enum';
import { AuthService } from '@core/services/auth/auth.service';
import { MY_FORMATS } from '@core/utils/date-picker-format';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import moment from 'moment';
import { debounceTime, map } from 'rxjs';

@Component({
  selector: 'app-events-timeline-modal',
  templateUrl: './events-timeline-modal.component.html',
  styleUrls: ['./events-timeline-modal.component.scss'],
  providers: [{ provide: NGX_MAT_DATE_FORMATS, useValue: MY_FORMATS }],
})
export class EventsTimelineModalComponent implements OnInit {
  userSelectedDate: FormControl = new FormControl(new Date());

  events: {
    parentDay: {
      dayStr: string;
      dayNum: number;
      monthStr: string;
      monthNum: number;
      year: number;
    };
    meeings: {
      id: string;
      time: string;
      title: string;
      status: MeetingStatus;
    }[];
  }[] = [];

  isweeklyControl = new FormControl(true);

  isLoadingData: boolean = true;

  @ViewChildren('dayColumn') dayColumns!: QueryList<ElementRef>;

  constructor(
    private dialogRef: MatDialogRef<EventsTimelineModalComponent>,
    private manageHomeService: ManageHomeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getWeeklyMeetings();
    this.detectSelectedDateChanges();
    this.detectWeeklyControlChanges();
  }

  detectSelectedDateChanges(): void {
    this.userSelectedDate.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          if (this.isweeklyControl.value) {
            //Weekly
            this.getWeeklyMeetings();
          } else {
            //monthly
            this.getMonthlyMeetings();
          }
        })
      )
      .subscribe();
  }

  detectWeeklyControlChanges(): void {
    this.isweeklyControl.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          if (value) {
            //Weekly
            this.getWeeklyMeetings();
          } else {
            //monthly
            this.getMonthlyMeetings();
          }
        })
      )
      .subscribe();
  }

  getWeeklyMeetings(): void {
    this.isLoadingData = true;
    const months = arabicMonths;
    const days = arabicDays;

    const userSelectedDate = this.userSelectedDate.value;
    const { saturday, friday } = this.getWeekDays(new Date(userSelectedDate));

    const startFormattedDate = `${saturday.getFullYear()}-${
      saturday.getMonth() + 1
    }-${saturday.getDate()}`;

    const endFormattedDate = `${friday.getFullYear()}-${
      friday.getMonth() + 1
    }-${friday.getDate()}`;

    const weekDays = Object.values(
      this.getWeekDays(new Date(userSelectedDate))
    );

    this.events = [];

    for (const day of weekDays) {
      this.events.push({
        parentDay: {
          dayStr: days[new Date(day).getDay()],
          dayNum: new Date(day).getDate(),
          monthStr: months[new Date(day).getMonth()],
          monthNum: new Date(day).getMonth() + 1,
          year: new Date(day).getFullYear(),
        },
        meeings: [],
      });
    }

    this.manageHomeService.meetingsService
      .getActiveMeetings(startFormattedDate, endFormattedDate)
      .subscribe({
        next: (res) => {
          this.isLoadingData = false;

          res.forEach((item) => {
            this.events.forEach((eventDay) => {
              if (new Date(item.date).getDate() === eventDay.parentDay.dayNum) {
                item.meetings.forEach((meeting) => {
                  eventDay.meeings.push({
                    id: meeting.id,
                    time: meeting.meetingDateTime,
                    title: meeting.title,
                    status: meeting.status,
                  });
                });
              }
            });
          });

          //Scroll to Sunday
          setTimeout(() => {
            let htmlElement: HTMLInputElement = this.dayColumns.filter(
              (ele, i) => i === 1
            )[0].nativeElement;

            htmlElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'start',
            });
          }, 0);
        },
      });
  }

  getMonthlyMeetings(): void {
    this.isLoadingData = true;
    const userSelectedDate = this.userSelectedDate.value;
    const { saturday } = this.getWeekDays(new Date(userSelectedDate));
    var lastDayOfMonth = new Date(
      saturday.getFullYear(),
      saturday.getMonth() + 1,
      0
    );

    //First day of month
    const startFormattedDate = `${saturday.getFullYear()}-${
      saturday.getMonth() + 1
    }-${1}`;

    //Last day of month
    const endFormattedDate = `${saturday.getFullYear()}-${
      saturday.getMonth() + 1
    }-${lastDayOfMonth.getDate()}`;

    this.events = [];
    const months = arabicMonths;
    const days = arabicDays;

    this.manageHomeService.meetingsService
      .getActiveMeetings(startFormattedDate, endFormattedDate)
      .subscribe({
        next: (res) => {
          this.isLoadingData = false;

          res.forEach((day) => {
            this.events.push({
              parentDay: {
                dayStr: days[new Date(day.date).getDay()],
                dayNum: new Date(day.date).getDate(),
                monthStr: months[new Date(day.date).getMonth()],
                monthNum: new Date(day.date).getMonth() + 1,
                year: new Date(day.date).getFullYear(),
              },
              meeings: [],
            });
            day.meetings.forEach((meeting) => {
              this.events[this.events.length - 1].meeings.push({
                id: meeting.id,
                time: meeting.meetingDateTime,
                title: meeting.title,
                status: meeting.status,
              });
            });
          });
        },
      });
  }

  goPreviousWeekOrMonth(): void {
    const userSelectedDate = new Date(this.userSelectedDate.value);

    userSelectedDate.setDate(
      userSelectedDate.getDate() - this.getDifferenceNumberOfDays()
    );
    this.userSelectedDate.setValue(userSelectedDate);
  }

  goNextWeekOrMonth(): void {
    const userSelectedDate = new Date(this.userSelectedDate.value);

    userSelectedDate.setDate(
      userSelectedDate.getDate() + this.getDifferenceNumberOfDays()
    );
    this.userSelectedDate.setValue(userSelectedDate);
  }

  onGoRightScroll(): void {
    let htmlElement: HTMLInputElement = this.dayColumns.filter(
      (ele, i) => i === 0
    )[0]?.nativeElement;

    if (htmlElement) {
      htmlElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }

  onGoLeftScroll(): void {
    let htmlElement: HTMLInputElement = this.dayColumns.filter(
      (ele, i) => i === this.events.length - 1
    )[0]?.nativeElement;

    if (htmlElement) {
      htmlElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }

  private getDifferenceNumberOfDays(): number {
    if (this.isweeklyControl.value) {
      return 7;
    } else {
      return 30;
    }
  }

  getParentDaysNumber(): number {
    let parentDays = 0;
    this.events.forEach((event) => {
      parentDays++;
    });

    return parentDays;
  }

  isSelectedDate(date: {
    dayStr: string;
    dayNum: number;
    monthStr: string;
    monthNum: number;
    year: number;
  }): boolean {
    const userSelectedDate = new Date(this.userSelectedDate.value);

    return (
      userSelectedDate.getFullYear() === date.year &&
      userSelectedDate.getMonth() + 1 === date.monthNum &&
      userSelectedDate.getDate() === date.dayNum
    );
  }

  getWeekDays(d: Date) {
    var first = d.getDate() - d.getDay() - 1; // First day is the day of the month - the day of the week
    var saturday = new Date(d.setDate(first));
    var sunday = moment(saturday).add(1, 'd').toDate();
    var monday = moment(saturday).add(2, 'd').toDate();
    var tuesday = moment(saturday).add(3, 'd').toDate();
    var wednesday = moment(saturday).add(4, 'd').toDate();
    var thursday = moment(saturday).add(5, 'd').toDate();
    var friday = moment(saturday).add(6, 'd').toDate();

    return {
      saturday: saturday,
      sunday: sunday,
      monday: monday,
      tuesday: tuesday,
      wednesday: wednesday,
      thursday: thursday,
      friday: friday,
    };
  }

  onCancel(): void {
    this.dialogRef.close({
      status: 'Cancelled',
      statusCode: ModalStatusCode.Cancel,
    });
  }

  onNavToMeetingDetails(element: {
    id: string;
    time: string;
    title: string;
    status: MeetingStatus;
  }): void {
    const currentUserPermissions = this.authService.userPermissions;
    if (
      element.status === MeetingStatus.Scheduled &&
      currentUserPermissions.includes(PermissionsObj.UpdateMeeting)
    ) {
      this.router.navigate([`manage-meetings/${element.id}/attend`]);
    } else if (
      element.status === MeetingStatus.Closed &&
      currentUserPermissions.includes(PermissionsObj.ConfirmMeetingAttendance)
    ) {
      this.router.navigate([`manage-meetings/${element.id}/confirm`]);
    } else {
      this.router.navigate([`manage-meetings/${element.id}`]);
    }

    this.onCancel();
  }
}

