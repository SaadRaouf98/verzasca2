import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { Entity } from '@core/models/entity.model';
import { PendingRequestsFiltersForm } from '@core/models/pending-request.model';
import { FoundationsSearchService } from '@core/services/search-services/foundations-search.service';
import { FromDateToDateSearchService } from '@core/services/search-services/from-date-to-date-search.service';
import { RequestTypesSearchService } from '@core/services/search-services/request-types-search.service';
import { UsersSearchService } from '@core/services/search-services/users-search.service';
import { ManagePendingTransactionsService } from '@pages/pending-transactions/services/manage-pending-transactions.service';
import {
  allExportTypes,
  compareFn,
  removeSpecialCharacters,
} from '@shared/helpers/helpers';
import moment from 'moment';
import { debounceTime, map } from 'rxjs';

@Component({
  selector: 'app-pending-transactions-filters',
  templateUrl: './pending-transactions-filters.component.html',
  styleUrls: ['./pending-transactions-filters.component.scss'],
  providers: [
    FoundationsSearchService,
    UsersSearchService,
    FromDateToDateSearchService,
  ],
})
export class PendingTransactionsFiltersComponent implements OnInit {
  @Input() lang: string = 'ar';

  @Output()
  filtersChange: EventEmitter<PendingRequestsFiltersForm> = new EventEmitter();

  filtersForm!: FormGroup;
  filtersData: PendingRequestsFiltersForm = {} as PendingRequestsFiltersForm;

  prioritiesList: Entity[] = [];
  nextStepsList: string[] = [];

  allExportTypes: { id: ExportedDocumentType; name: string }[] = [];

  compareFn = compareFn;

  readonly usersSearchService = inject(UsersSearchService);
  readonly foundationsSearchService = inject(FoundationsSearchService);
  readonly requestTypesSearchService = inject(RequestTypesSearchService);
  readonly fromDateToDateSearchService = inject(FromDateToDateSearchService);

  constructor(
    private managePendingTransactionsService: ManagePendingTransactionsService
  ) {}

  ngOnInit(): void {
    this.initializeFiltersForm();
    this.initializeDropDownLists();
    this.detectFiltersChanges();
  }

  initializeFiltersForm(): void {
    this.filtersForm = new FormGroup({
      foundation: new FormControl(null),
      requestType: new FormControl(null),
      priority: new FormControl(null),
      nextStep: new FormControl(null),
      consultant: new FormControl(null),
      exportType: new FormControl(null),
      fromDate: new FormControl(null),
      toDate: new FormControl(''),
      hijriFromDate: new FormControl(''),
      hijriToDate: new FormControl(''),
      searchKeyword: new FormControl(''),
    });
  }

  initializeDropDownLists(): void {
    this.foundationsSearchService.searchOnFoundations();
    this.usersSearchService.searchOnUsers();
    this.requestTypesSearchService.searchOnRequestTypes();

    //The priorities list won't exceed 20 items,so I made it this way
    this.managePendingTransactionsService.prioritiesService
      .getPrioritiesList(
        {
          pageSize: 50,
          pageIndex: 0,
        },
        undefined,
        undefined,
        ['id', 'title', 'titleEn']
      )
      .subscribe((res) => {
        this.prioritiesList = res.data;
      });

    this.managePendingTransactionsService.requestsService
      .getCurrentStepsList()
      .subscribe((res) => {
        this.nextStepsList = res;
      });

    this.allExportTypes = allExportTypes;
  }

  detectFiltersChanges(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          this.filtersData = {
            searchKeyword: removeSpecialCharacters(value.searchKeyword),
            foundationId: value.foundation?.id || '',
            requestTypeId: value.requestType?.id || '',
            priorityId: value.priority?.id || '',
            nextStepTitle: value.nextStep || '',
            consultantId: value.consultant?.id || '',
            exportTypeId: value.exportType?.id || '',
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
