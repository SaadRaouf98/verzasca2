import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageRecordsRoutingModule } from './manage-records-routing.module';
import { RecordsListComponent } from './pages/records-list/records-list.component';
import { SharedModule } from '@shared/shared.module';
import { ViewNoteModalComponent } from './components/view-note-modal/view-note-modal.component';
import { RecordDetailsComponent } from './pages/record-details/record-details.component';
import { RecordFileViewerComponent } from './pages/record-file-viewer/record-file-viewer.component';
import { TakeActionModalComponent } from './components/take-action-modal/take-action-modal.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { RecordsFiltersComponent } from './components/records-filters/records-filters.component';
import { MinutesCardsComponent } from '@pages/manage-records/components/minutes-cards/minutes-cards.component';
import { TransactionNumberPipe } from '../../shared/pipes/transaction-number.pipe';
import { FiltersComponent } from '@features/components/pending-request/pending-request-list/filters/filters.component';
import { TableListComponent } from '@shared/new-components/table-list/table-list.component';
import { AuthorizationPopupComponent } from '@shared/new-components/authorization-popp/authorization-popup.component';
import { TruncatePipe } from '@shared/pipes/truncate.pipe';

@NgModule({
  declarations: [
    RecordsListComponent,
    ViewNoteModalComponent,
    RecordDetailsComponent,
    RecordFileViewerComponent,
    TakeActionModalComponent,
    RecordsFiltersComponent,
    MinutesCardsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PdfViewerModule,
    ManageRecordsRoutingModule,
    TransactionNumberPipe,
    TruncatePipe,
    FiltersComponent,
    TableListComponent,
    AuthorizationPopupComponent,
  ],
})
export class ManageRecordsModule {}
