import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageHomeService } from '../services/manage-home.service';
import { Router } from '@angular/router';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { EventsTimelineModalComponent } from '../components/events-timeline-modal/events-timeline-modal.component';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';
import { arabicDays, arabicMonths } from '@core/constants/days-months.constant';
import { VisibleNewsPost } from '@core/models/news-posts.model';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth/auth.service';
import { MeetingStatus } from '@core/enums/meeting-status.enum';
import { HijriCalendarModalComponent } from '../components/hijri-calendar-modal/hijri-calendar-modal.component';
import { StatisticsOpenStatus } from '../enums/statistics-open-status-enum';
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartData,
  ChartEvent,
  ChartOptions,
  ChartType,
  ChartTypeRegistry,
} from 'chart.js';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { RequestStatus } from '@core/enums/request-status.enum';
import { TransactionsStatusStatistics } from '@core/models/transactions-statistics-status.model';
import { DocumentsStatistics } from '@core/models/documents-statistics-summary';
import { CommitteeRecordsStatistics } from '@core/models/committee-records-statistics.model';
import { ChartDataset } from 'chart.js';
import { MeetingGroup } from '@pages/home/components/home-next-events/home-next-events.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomeComponent {
  lang: string = 'ar';
  PermissionsObj = PermissionsObj;
  currentDay!: {
    dayStr: string;
    dayNum: number;
    month: string;
    year: number;
  };
  // replace this with however you actually fetch or receive the payload

  currentDayEvents: {
    id: string;
    time: string;
    title: string;
    status: MeetingStatus;
  }[] = [];

  latestNews: VisibleNewsPost[] = [];
  apiUrl = environment.apiUrl;
  token: string = '';

  currentUser!: {
    nameid: string;
    unique_name: string;
    role: string[];
    nbf: number;
    exp: number;
    iat: number;
    iss: string;
    aud: string;
  };

  ///////////////////////////
  expandedStatistics: {
    transactions: StatisticsOpenStatus;
    notesLetters: StatisticsOpenStatus;
    records: StatisticsOpenStatus;
  } = {
    transactions: StatisticsOpenStatus.Closed,
    notesLetters: StatisticsOpenStatus.Closed,
    records: StatisticsOpenStatus.Closed,
  };

  StatisticsOpenStatus = StatisticsOpenStatus;
  ///////// PIE CHART DATA ////////////

  // Chart options
  public pieChartOptions: ChartConfiguration['options'] = {
    plugins: {
      legend: {
        display: false,
        position: 'bottom',
      },

      /* title: {
        display: true,
        text: 'Employee Details',
      }, */
    },
    color: '#fff',
  };

  // Chart type
  public pieChartType: keyof ChartTypeRegistry = 'pie';
  startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]; // January 1st
  endOfYear = new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]; // December 31st

  /////////////////////////
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  transactionsPieData: any = null;
  transactionsSummay: TransactionsStatusStatistics | null = null;

  documentsStatisticsSummary: DocumentsStatistics | null = null;
  committeeRecordsStatistics: CommitteeRecordsStatistics | null = null;

  ////////////////// Stacked bar committee records ///////////////////////////////
  stackedBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        reverse: true,
      },
      y: {
        position: 'right',
      },
    },
    plugins: {
      legend: {
        display: false,
        // position: 'bottom',
      },
    },
    color: '#20545F',
  };
  stackedBarChartLabels: string[] = ['أ', 'ب', 'ج'];
  stackedBarChartType: ChartType = 'bar';
  stackedBarChartLegend = true;
  stackedBarChartPlugins = [];

  stackedBarChartData: ChartDataset[] = [];

  ////////////////// Grouped bar committee records ///////////////////////////////

  groupedBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        reverse: true,
      },
      y: {
        position: 'right',
      },
    },
    plugins: {
      legend: {
        //  position: 'bottom',
        display: false,
      },
    },
    color: '#20545F',
  };
  groupedBarChartLabels: string[] = ['أ', 'ب', 'ج'];
  groupedBarChartType: ChartType = 'bar';
  groupedBarChartLegend = true;
  groupedBarChartPlugins = [];

  groupedBarChartData: ChartDataset[] = [];

  constructor(
    private languageService: LanguageService,
    private manageHomeService: ManageHomeService,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.user;
    this.getStatistics();
  }

  getStatistics(): void {
    this.manageHomeService.statisticsService
      .getTransactionsStatus(this.startOfYear, this.endOfYear)
      .subscribe((res: TransactionsStatusStatistics) => {
        this.transactionsSummay = res;
        this.transactionsPieData = {
          labels: ['معاملات منجزة', 'معاملات مجدولة', 'معاملات تحت الإجراء'],
          datasets: [
            {
              label: '',
              data: [
                res.values.find((ele) => ele.status === RequestStatus.Done)?.count || 0,

                res.values.find((ele) => ele.status === RequestStatus.Scheduled)?.count || 0,
                res.values.find((ele) => ele.status === RequestStatus.InProgress)?.count || 0,
              ],
              backgroundColor: ['#00FADD', '#00A390', '#23615A'],
              borderColor: ['#00FADD', '#00A390', '#23615A'],
              borderWidth: 1,
            },
          ],
        };
      });

    /////////////////
    this.manageHomeService.statisticsService
      .getNotesAndLettersStatistics(this.startOfYear, this.endOfYear)
      .subscribe((res: DocumentsStatistics) => {
        this.documentsStatisticsSummary = res;
      });

    ///////////////////
    this.manageHomeService.statisticsService
      .getCommitteeRecordsStatistics(this.startOfYear, this.endOfYear)
      .subscribe((res: CommitteeRecordsStatistics) => {
        this.committeeRecordsStatistics = res;

        this.stackedBarChartData = [
          {
            data: [
              ...res.committees.filter((ele) => ele.symbol === 'أ').map((ele) => ele.activeCount),
              ...res.committees.filter((ele) => ele.symbol === 'ب').map((ele) => ele.activeCount),
              ...res.committees.filter((ele) => ele.symbol === 'ج').map((ele) => ele.activeCount),
            ],
            label: '',
            stack: 'a',
            backgroundColor: ['#23615A'],
            borderColor: ['#23615A'],
          },
          {
            data: [
              ...res.committees.filter((ele) => ele.symbol === 'أ').map((ele) => ele.inActiveCount),
              ...res.committees.filter((ele) => ele.symbol === 'ب').map((ele) => ele.inActiveCount),
              ...res.committees.filter((ele) => ele.symbol === 'ج').map((ele) => ele.inActiveCount),
            ],
            label: '',
            stack: 'a',
            backgroundColor: ['#4C8E86'],
            borderColor: ['#4C8E86'],
          },
        ];

        this.groupedBarChartData = [
          {
            data: [
              ...res.committees
                .filter((ele) => ele.symbol === 'أ')
                .map((ele) => ele.handoverRecordsCount),
              ...res.committees
                .filter((ele) => ele.symbol === 'ب')
                .map((ele) => ele.handoverRecordsCount),
              ...res.committees
                .filter((ele) => ele.symbol === 'ج')
                .map((ele) => ele.handoverRecordsCount),
            ],
            label: '',
            stack: 'a',
            backgroundColor: ['#23615A'],
            borderColor: ['#23615A'],
          },
          {
            data: [
              ...res.committees
                .filter((ele) => ele.symbol === 'أ')
                .map((ele) => ele.meetingRecordsCount),
              ...res.committees
                .filter((ele) => ele.symbol === 'ب')
                .map((ele) => ele.meetingRecordsCount),
              ...res.committees
                .filter((ele) => ele.symbol === 'ج')
                .map((ele) => ele.meetingRecordsCount),
            ],
            label: '',
            stack: 'b',
            backgroundColor: ['#6F9E99'],
            borderColor: ['#6F9E99'],
          },
        ];
      });
  }
  ngOnInit(): void {
    this.lang = this.languageService.language;

    const date = new Date();
    const months = arabicMonths;
    const days = arabicDays;

    this.currentDay = {
      dayStr: days[date.getDay()],
      dayNum: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear(),
    };

    this.token = this.authService.getToken();
    this.getNewsPosts();
  }

  getNewsPosts(): void {
    this.manageHomeService.latestNewsService
      .getVisibleNewsPostsList({ pageIndex: 0, pageSize: 10 })
      .subscribe({
        next: (res) => {
          this.latestNews = res.data
            .map((post) => ({
              ...post,
              createdOn: post.createdOn ?? '',
            }))
            .reverse();
        },
      });
  }

  onViewAllEvents(): void {
    this.dialog.open(EventsTimelineModalComponent, {
      minWidth: window.innerWidth < 1430 ? '95vw' : '1430px', //'1430px'
      autoFocus: false,
      disableClose: false,
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
  }

  onOpenHijriCalendar(): void {
    this.dialog.open(HijriCalendarModalComponent, {
      minWidth: window.innerWidth < 1430 ? '95vw' : '1430px', //'1430px'
      autoFocus: false,
      disableClose: false,
    });
  }

  onExpandStatisticsArrow(category: 'transactions' | 'notesLetters' | 'records'): void {
    this.expandedStatistics[category] =
      this.expandedStatistics[category] === StatisticsOpenStatus.Opened
        ? StatisticsOpenStatus.Closed
        : StatisticsOpenStatus.Opened;
  }
  getActiveRecordsCount(): number {
    return (
      this.committeeRecordsStatistics?.committees
        .map((ele) => ele.activeCount)
        .reduce((total, num) => {
          return total + num;
        }, 0) || 0
    );
  }

  getInActiveRecordsCount(): number {
    return (
      this.committeeRecordsStatistics?.committees
        .map((ele) => ele.inActiveCount)
        .reduce((total, num) => {
          return total + num;
        }, 0) || 0
    );
  }

  getHandOverRecordsCount(): number {
    return (
      this.committeeRecordsStatistics?.committees
        .map((ele) => ele.handoverRecordsCount)
        .reduce((total, num) => {
          return total + num;
        }, 0) || 0
    );
  }

  getMeetingsRecordsCount(): number {
    return (
      this.committeeRecordsStatistics?.committees
        .map((ele) => ele.meetingRecordsCount)
        .reduce((total, num) => {
          return total + num;
        }, 0) || 0
    );
  }
  addNewMeeting(): void {
    this.router.navigate(['/manage-meetings/add']);
  }
}
