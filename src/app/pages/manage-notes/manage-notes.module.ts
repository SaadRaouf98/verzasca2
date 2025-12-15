import { SingleSelectComponent } from '@shared/components/single-select/single-select.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageNotesRoutingModule } from './manage-notes-routing.module';
import { NotesListComponent } from './pages/notes-list/notes-list.component';
import { SharedModule } from '@shared/shared.module';
import { NoteFileViewerComponent } from './pages/note-file-viewer/note-file-viewer.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NoteDetailsComponent } from './pages/note-details/note-details.component';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_FORMATS } from '@core/utils/date-picker-format';
import { RangeGregorianCalendarComponent } from '@shared/components/calendar/range-gregorian-calendar/range-gregorian-calendar.component';
import { RangeHijriCalendarComponent } from '@shared/components/calendar/range-hijri-calendar/range-hijri-calendar.component';
import { TelephoneConsentModalComponent } from '@pages/manage-notes/components/telephone-consent-modal/telephone-consent-modal.component';
import { TransactionNumberPipe } from '../../shared/pipes/transaction-number.pipe';
import { FiltersComponent } from '@features/components/pending-request/pending-request-list/filters/filters.component';
import { NotesFiltersComponent } from './pages/notes-filters/notes-filters.component';

@NgModule({
  declarations: [
    NotesListComponent,
    NoteFileViewerComponent,
    NoteDetailsComponent,
    TelephoneConsentModalComponent,
    NotesFiltersComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PdfViewerModule,
    ManageNotesRoutingModule,
    RangeGregorianCalendarComponent,
    RangeHijriCalendarComponent,
    TransactionNumberPipe,
    FiltersComponent,
    SingleSelectComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Ensure the locale matches the desired format
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ManageNotesModule {}
