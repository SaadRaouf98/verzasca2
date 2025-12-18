import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { RequestStatus } from '@core/enums/request-status.enum';
import { Entity } from '@core/models/entity.model';
import { RequestsFiltersForm } from '@core/models/request.model';
import { DocumentTypesSearchService } from '@core/services/search-services/document-types-search.service';
import { FoundationsSearchService } from '@core/services/search-services/foundations-search.service';
import { FromDateToDateSearchService } from '@core/services/search-services/from-date-to-date-search.service';
import { UsersSearchService } from '@core/services/search-services/users-search.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { allRequestStatus, compareFn, removeSpecialCharacters } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { map, debounceTime, take, Subscription } from 'rxjs';

@Component({
  selector: 'app-exports-filters',
  templateUrl: './exports-filters.component.html',
  styleUrls: [
    './exports-filters.component.scss',
    '../../../../features/components/pending-request/pending-request-list/filters-dialog/filters-dialog.component.scss',
  ],
  providers: [UsersSearchService, FoundationsSearchService, FromDateToDateSearchService],
})
export class ExportsFiltersComponent implements OnInit, OnChanges, OnDestroy {
  @Input() lang: string = 'ar';
  @Input() filtersData!: RequestsFiltersForm;

  @Output()
  filtersChange: EventEmitter<RequestsFiltersForm> = new EventEmitter();

  filtersForm!: FormGroup;

  prioritiesList: Entity[] = [];

  allRequestStatus: { id: RequestStatus; name: string }[] = [];

  private subscriptions: Subscription[] = [];

  ExportedDocumentType = ExportedDocumentType;
  documentTypeOptions = [
    {
      id: this.ExportedDocumentType.Letter,
      title: this.translateService.instant('TransactionsModule.ExportDocumentComponent.letter'),
    },
    {
      id: this.ExportedDocumentType.Note,
      title: this.translateService.instant('TransactionsModule.ExportDocumentComponent.note'),
    },
    {
      id: this.ExportedDocumentType.Record,
      title: this.translateService.instant('TransactionsModule.ExportDocumentComponent.record'),
    },
    {
      id: this.ExportedDocumentType.Other,
      title: this.translateService.instant('shared.other'),
    },
  ];
  organizationUnitsList: {
    id: string;
    title: string;
    titleEn: string;
    committeeSymbol: string;
  }[] = [];

  private _lastSerializedFilters = '';

  compareFn = compareFn;
  readonly usersSearchService = inject(UsersSearchService);
  readonly foundationsSearchService = inject(FoundationsSearchService);
  readonly fromDateToDateSearchService = inject(FromDateToDateSearchService);
  readonly documentTypesSearchService = inject(DocumentTypesSearchService);

  constructor(
    private manageImportsExportsService: ManageImportsExportsService,
    private translateService: TranslateService,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnChanges(changes: { filtersData: SimpleChange }): void {
    if (
      this.filtersForm &&
      changes.filtersData &&
      changes.filtersData.currentValue.isExportDocument
    ) {
      this.filtersForm.patchValue(
        {
          requestType: null,
          isExportDocument: true,
        },
        {
          emitEvent: false,
        }
      );
    }
  }

  getAllFoundations() {
    this.foundationsSearchService.foundationsList$
      .pipe(take(1)) // or takeUntil(...)
      .subscribe((res) => {
        const foundations = res?.data || [];
        foundations.forEach((foundation) => {
          // do something
        });
      });
  }

  ngOnInit(): void {
    this.initializeFiltersForm();
    this.setFilters();
    this.initializeDropDownLists();
    this.detectFiltersChanges();
    this.getAllFoundations();
    const sub = this.manageSharedService.searchFormValue.subscribe((filters: any) => {
      this.filtersForm.patchValue({ ...filters }, { emitEvent: false });
      if (filters?.foundationId)
        this.filtersForm.controls['foundation'].setValue(filters?.foundationId, {
          emitEvent: false,
        });
    });
    this.subscriptions.push(sub);

    // Clean up filters when component is destroyed
    this.subscriptions.push(
      new Subscription(() => {
        this.manageSharedService.searchFormValue = null;
      })
    );
  }

  initializeFiltersForm(): void {
    this.filtersForm = new FormGroup({
      foundation: new FormControl(null),
      requestType: new FormControl(null),
      documentType: new FormControl(null),
      priority: new FormControl(null),
      committee: new FormControl(null),
      // consultant: new FormControl(null),
      status: new FormControl(null),
      fromDate: new FormControl(null),
      toDate: new FormControl(''),
      hijriFromDate: new FormControl(''),
      hijriToDate: new FormControl(''),
      searchKeyword: new FormControl(''),
      isExportDocument: new FormControl(''),
    });
  }

  setFilters(): void {
    if (this.filtersData) {
      this.filtersForm.patchValue(this.filtersData);
    }
  }

  initializeDropDownLists(): void {
    this.foundationsSearchService.searchOnFoundations();
    this.usersSearchService.searchOnUsers();
    this.documentTypesSearchService.searchOnDocumentTypes(undefined, 100);
    //The priorities list won't exceed 20 items,so I made it this way
    this.manageImportsExportsService.prioritiesService
      .getPrioritiesList(
        {
          pageSize: 100,
          pageIndex: 0,
        },
        undefined,
        undefined,
        ['id', 'title', 'titleEn']
      )
      .subscribe({
        next: (res) => {
          this.prioritiesList = res.data;
        },
      });

    this.allRequestStatus = allRequestStatus.map((status) => ({
      id: status.id,
      name: this.translateService.instant(status.name),
    }));

    this.manageImportsExportsService.organizationUnitsService
      .getOrganizationUnitsList(
        {
          pageSize: 50,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
        },
        undefined,
        ['id', 'committeeSymbol']
      )
      .subscribe({
        next: (res) => {
          this.organizationUnitsList = res.data;
        },
      });
  }

  private serializeFilters(filters: RequestsFiltersForm): string {
    const normalized: any = {};
    Object.keys(filters || {}).forEach((key) => {
      const v = (filters as any)[key];
      if (v !== undefined && v !== null && v !== '') {
        normalized[key] = v;
      }
    });
    return JSON.stringify(normalized, Object.keys(normalized).sort());
  }

  detectFiltersChanges(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          this.filtersData = {
            priority: value.priority,
            status: value.status,
            committee: value.committee,
            fromDate: value.fromDate,
            toDate: value.toDate,
            hijriFromDate: value.hijriFromDate,
            hijriToDate: value.hijriToDate,
            foundationId: value.foundation?.id || value.foundation,
            documentType: value.documentType,
            requestType: undefined,
            isExportDocument: true,
          };
          return this.filtersData;
        })
      )
      .subscribe((fd) => {
        const serialized = this.serializeFilters(fd);
        if (serialized !== this._lastSerializedFilters) {
          this._lastSerializedFilters = serialized;
          this.manageSharedService.searchFormValue = fd;
          this.filtersChange.emit(fd);
        }
      });
  }

  reset() {
    this.filtersForm.reset();
    this.manageSharedService.searchFormValue = null;
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  get hasActiveFilters(): boolean {
    const formValue = this.filtersForm?.value;
    if (!formValue) return false;

    return Object.keys(formValue).some((key) => {
      const value = formValue[key];
      return (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        (!Array.isArray(value) || value.length > 0)
      );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
