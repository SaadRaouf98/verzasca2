import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsListComponent } from './pages/transactions-list/transactions-list.component';
import { SharedModule } from '@shared/shared.module';
import { NgxAngularMaterialHijriAdapterModule } from 'ngx-angular-material-hijri-adapter';
import { TransactionDetailsComponent } from './pages/transaction-details/transaction-details.component';
import { EditAmountsModalComponent } from './components/edit-amounts-modal/edit-amounts-modal.component';
import { EditTransactionComponent } from './pages/edit-transaction/edit-transaction.component';
import { RelatedContainersScrollableTableComponent } from './components/related-containers-scrollable-table/related-containers-scrollable-table.component';
import { UpdateAccessibilityModalComponent } from './components/update-accessibility-modal/update-accessibility-modal.component';
import { AdvancedSearchModalComponent } from './components/advanced-search-modal/advanced-search-modal.component';
import { TransactionsFiltersComponent } from './components/transactions-filters/transactions-filters.component';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_FORMATS } from '@core/utils/date-picker-format';
import { RangeGregorianCalendarComponent } from '@shared/components/calendar/range-gregorian-calendar/range-gregorian-calendar.component';
import { RangeHijriCalendarComponent } from '@shared/components/calendar/range-hijri-calendar/range-hijri-calendar.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { SingleSelectComponent } from '@shared/components/single-select/single-select.component';
import { TransactionNumberPipe } from '../../shared/pipes/transaction-number.pipe';
import { TableListComponent } from '@shared/new-components/table-list/table-list.component';
import { FiltersComponent } from '@features/components/pending-request/pending-request-list/filters/filters.component';
import { TransactionDetailsPanelComponent } from './pages/transaction-details-panel/transaction-details-panel.component';
import { TimelineComponent } from '@features/components/pending-request/pending-request-view/timeline/timeline.component';
import { TransactionInfoPanelComponent } from './pages/transaction-details-panel/transaction-info-panel/transaction-info-panel.component';
import { TransactionDetailsImportExportComponent } from './pages/transaction-details-import-export/transaction-details-import-export.component';
import { InputComponent } from '@shared/components/input/input.component';
import { AuthorizationPopupComponent } from '@shared/new-components/authorization-popp/authorization-popup.component';

@NgModule({
  declarations: [
    TransactionsListComponent,
    TransactionDetailsComponent,
    EditAmountsModalComponent,
    EditTransactionComponent,
    RelatedContainersScrollableTableComponent,
    UpdateAccessibilityModalComponent,
    AdvancedSearchModalComponent,
    TransactionsFiltersComponent,
    TransactionDetailsImportExportComponent,
  ],
  imports: [
    CommonModule,
    NgxAngularMaterialHijriAdapterModule,
    SharedModule,
    TransactionsRoutingModule,
    RangeGregorianCalendarComponent,
    RangeHijriCalendarComponent,
    MultiSelectComponent,
    SingleSelectComponent,
    TransactionNumberPipe,
    TableListComponent,
    TransactionDetailsPanelComponent,
    FiltersComponent,
    TimelineComponent,
    TransactionInfoPanelComponent,
    InputComponent,
    AuthorizationPopupComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Ensure the locale matches the desired format
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class TransactionsModule {}
