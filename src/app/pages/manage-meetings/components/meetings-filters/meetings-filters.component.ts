import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MeetingsFilterForm } from '@core/models/meeting.model';
import { FromDateToDateSearchService } from '@core/services/search-services/from-date-to-date-search.service';
import moment from 'moment';
import { debounceTime, map } from 'rxjs';

@Component({
  selector: 'app-meetings-filters',
  templateUrl: './meetings-filters.component.html',
  styleUrls: ['./meetings-filters.component.scss'],
})
export class MeetingsFiltersComponent implements OnInit {
  @Input() lang: string = 'ar';

  @Output()
  filtersChange: EventEmitter<{
    searchKeyword?: string;
    fromDate?: string;
    toDate?: string;
    hijriFromDate?: string;
    hijriToDate?: string;
  }> = new EventEmitter();

  filtersForm!: FormGroup;
  filtersData: MeetingsFilterForm = {} as MeetingsFilterForm;

  readonly fromDateToDateSearchService = inject(FromDateToDateSearchService);

  ngOnInit(): void {
    this.initializeFiltersForm();
    this.detectFiltersChanges();
  }

  initializeFiltersForm(): void {
    this.filtersForm = new FormGroup({
      fromDate: new FormControl(null),
      toDate: new FormControl(''),
      hijriFromDate: new FormControl(''),
      hijriToDate: new FormControl(''),
      searchKeyword: new FormControl(''),
    });
  }

  detectFiltersChanges(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          this.filtersData = {
            searchKeyword: value.searchKeyword,
            fromDate: value.fromDate,
            toDate: value.toDate,
            hijriFromDate: value.hijriFromDate,
            hijriToDate: value.hijriToDate,
          };

          this.filtersChange.emit(this.filtersData);
        })
      )
      .subscribe();
  }
}
