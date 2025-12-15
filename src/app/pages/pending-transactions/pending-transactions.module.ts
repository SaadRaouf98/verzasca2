import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PendingTransactionsRoutingModule } from './pending-transactions-routing.module';
import { PendingTransactionsListPage } from './pages/pending-transactions-list/pending-transactions-list.page';
import { SharedModule } from '@shared/shared.module';
import { PendingTransactionsFiltersComponent } from './components/pending-transactions-filters/pending-transactions-filters.component';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MY_FORMATS } from '@core/utils/date-picker-format';
import { SingleGregorianCalendarComponent } from '@shared/components/calendar/single-gregorian-calendar/single-gregorian-calendar.component';
import { SingleHijriCalendarComponent } from '@shared/components/calendar/single-hijri-calendar/single-hijri-calendar.component';
import { RangeGregorianCalendarComponent } from '@shared/components/calendar/range-gregorian-calendar/range-gregorian-calendar.component';
import { RangeHijriCalendarComponent } from '@shared/components/calendar/range-hijri-calendar/range-hijri-calendar.component';

@NgModule({
  declarations: [
    PendingTransactionsListPage,
    PendingTransactionsFiltersComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PendingTransactionsRoutingModule,
    SingleGregorianCalendarComponent,
    SingleHijriCalendarComponent,
    RangeGregorianCalendarComponent,
    RangeHijriCalendarComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Ensure the locale matches the desired format
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PendingTransactionsModule {}
