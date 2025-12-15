import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { Entity } from '@core/models/entity.model';
import { RequestContainersFiltersForm2 } from '@core/models/transaction.model';
import { FoundationsSearchService } from '@core/services/search-services/foundations-search.service';
import { FromDateToDateSearchService } from '@core/services/search-services/from-date-to-date-search.service';
import { SectorsSearchService } from '@core/services/search-services/sectors-search.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { compareFn, removeSpecialCharacters } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import moment from 'moment';
import { debounceTime, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-transactions-filters',
  templateUrl: './transactions-filters.component.html',
  styleUrls: [
    './transactions-filters.component.scss',
    '../../../../features/components/pending-request/pending-request-list/filters-dialog/filters-dialog.component.scss',
  ],
  providers: [FoundationsSearchService, SectorsSearchService, FromDateToDateSearchService],
})
export class TransactionsFiltersComponent implements OnInit {
  @Input() lang: string = 'ar';
  // @Input() filtersData!: RequestContainersFiltersForm2;

  destroyRef = inject(DestroyRef);
  @Output() filtersChange: EventEmitter<RequestContainersFiltersForm2> =
    new EventEmitter<RequestContainersFiltersForm2>();

  filtersForm!: FormGroup;
  RequestContainerStatus = RequestContainerStatus;

  compareFn = compareFn;

  prioritiesList: Entity[] = [];

  readonly foundationsSearchService = inject(FoundationsSearchService);
  readonly sectorsSearchService = inject(SectorsSearchService);
  readonly fromDateToDateSearchService = inject(FromDateToDateSearchService);
  private subscriptions: Subscription[] = [];
  transactionStatusOptions: { id: number; label: string }[] = [];
  private translate = inject(TranslateService);
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      lang: string;
      filtersData: RequestContainersFiltersForm2;
    },
    private dialogRef: MatDialogRef<TransactionsFiltersComponent>,
    private manageImportsExportsService: ManageImportsExportsService,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnInit(): void {
    this.initializeFiltersForm();
    this.setFilters();
    this.intializeDropDownLists();
    this.transactionStatusOptions = [
      {
        id: RequestContainerStatus.Open,
        label: this.translate.instant('TransactionsModule.TransactionsListComponent.open'),
      },
      {
        id: RequestContainerStatus.Held,
        label: this.translate.instant('shared.held'),
      },
      {
        id: RequestContainerStatus.Scheduled,
        label: this.translate.instant('TransactionsModule.TransactionsListComponent.scheduled'),
      },
      {
        id: RequestContainerStatus.Reset,
        label: this.translate.instant('TransactionsModule.TransactionsListComponent.reset'),
      },
      {
        id: RequestContainerStatus.Close,
        label: this.translate.instant('TransactionsModule.TransactionsListComponent.close'),
      },
      {
        id: RequestContainerStatus.ForceClose,
        label: this.translate.instant('TransactionsModule.TransactionsListComponent.forceClose'),
      },
    ];

    this.filtersForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.detectFiltersChanges();
    });

    const sub = this.manageSharedService.searchFormValue.subscribe((filters: any) => {
      console.log('Received filters in NotesFiltersComponent:', filters);
      this.filtersForm.patchValue({ ...filters }, { emitEvent: false });
      // if(filters?.priorityId)
      //   this.filtersForm.controls['priority'].setValue(filters?.priorityId, { emitEvent: false });
    });
    this.subscriptions.push(sub);

    // Clean up filters when dialog closes
    this.dialogRef.afterClosed().subscribe(() => {
      this.manageSharedService.searchFormValue = null;
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    });
  }

  initializeFiltersForm(): void {
    this.filtersForm = new FormGroup({
      foundation: new FormControl(null),
      sector: new FormControl(null),
      fromDate: new FormControl(''),
      toDate: new FormControl(''),
      hijriFromDate: new FormControl(''),
      hijriToDate: new FormControl(''),

      containerStatus: new FormControl(null),
      priority: new FormControl(null),
    });
  }

  setFilters(): void {
    if (this.data?.filtersData) {
      this.filtersForm.patchValue(this.data.filtersData, { emitEvent: false });
    }
  }

  intializeDropDownLists(): void {
    this.foundationsSearchService.searchOnFoundations(undefined, 100);
    this.sectorsSearchService.searchOnSectors(undefined, 100);
    //The priorities list won't exceed 20 items,so I made it this way
    this.manageImportsExportsService.prioritiesService
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
  }

  reset() {
    this.filtersForm.reset();
    this.manageSharedService.searchFormValue = null;
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.dialogRef.close();
  }
  detectFiltersChanges(): void {
    this.filtersChange.emit(this.filtersForm.value as RequestContainersFiltersForm2);
    this.manageSharedService.searchFormValue = this.filtersForm.value;
  }
}
