import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HomeComponent } from './home/home.page';
import { SharedModule } from '@shared/shared.module';
import { EventsTimelineModalComponent } from './components/events-timeline-modal/events-timeline-modal.component';
import { PostDetailsComponent } from './pages/post-details/post-details.component';
import { PostsListComponent } from './pages/posts-list/posts-list.component';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MY_FORMATS } from '@core/utils/date-picker-format';
import { BaseChartDirective } from 'ng2-charts';
import { StatisticsDetailedComponent } from './pages/statistics-detailed/statistics-detailed.component';
import { CalendarFilterModalComponent } from './components/calendar-filter-modal/calendar-filter-modal.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DoughnutChartDataPipe } from '@pages/home/pipes/doughnutChartData.pipe';
import { PriorityRecordsChartPipe } from '@pages/home/pipes/PriorityRecordsChartPipe.pipe';
import { CommitteeApprovalChartPipe } from '@pages/home/pipes/committeeApprovalChart.pipe';
import { HomeStatisticsSectionComponent } from '@pages/home/components/home-statistics-section/home-statistics-section.component';
import { HomeStatisticsRecordsComponent } from '@pages/home/components/home-statistics-records/home-statistics-records.component';
import { SingleHijriCalendarComponent } from '@shared/components/calendar/single-hijri-calendar/single-hijri-calendar.component';
import { HomeNewsComponent } from '@pages/home/components/home-news/home-news.component';
import { HomeNextEventsComponent } from '@pages/home/components/home-next-events/home-next-events.component';
import { MinutesToReadableTimePipe } from '../../shared/pipes/minutesToReadableTime.pipe';
import { InputComponent } from '@shared/components/input/input.component';
import { HomePoliciesComponent } from './components/home-policies/home-policies.component';

@NgModule({
  declarations: [
    HomeComponent,
    PostsListComponent,
    PostDetailsComponent,
    EventsTimelineModalComponent,
    PostDetailsComponent,
    StatisticsDetailedComponent,
    CalendarFilterModalComponent,
    HomeStatisticsSectionComponent,
    HomeStatisticsRecordsComponent,
    HomeNewsComponent,
    HomeNextEventsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    BaseChartDirective,
    NgbDatepickerModule,
    DoughnutChartDataPipe,
    PriorityRecordsChartPipe,
    CommitteeApprovalChartPipe,
    SingleHijriCalendarComponent,
    MinutesToReadableTimePipe,
    InputComponent,
    HomePoliciesComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Ensure the locale matches the desired format
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class HomeModule {}
