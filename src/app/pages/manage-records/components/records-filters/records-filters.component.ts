import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
} from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Classification } from '@core/models/classification.model';
import { Priority } from '@core/models/priority.model';
import { RecordsFiltersForm, RecordsFiltersForm2 } from '@core/models/record.model';
import { ManageRecordsService } from '@pages/manage-records/services/manage-records.service';
import { removeSpecialCharacters } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { debounceTime, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-records-filters',
  templateUrl: './records-filters.component.html',
  styleUrls: [
    './records-filters.component.scss',
    '../../../../features/components/pending-request/pending-request-list/filters-dialog/filters-dialog.component.scss',
  ],
})
export class RecordsFiltersComponent implements OnInit, OnChanges {
  isInitiatedOptions = [];
  isExportedOptions = [];
  @Input() lang: string = 'ar';
  currentTab: 'Finance' | 'Preparatory' = 'Finance';
  viewMode: 'activeRecords' | 'allRecords' = 'activeRecords';
  @Input() filtersData!: RecordsFiltersForm2;

  @Output()
  filtersChange: EventEmitter<RecordsFiltersForm2> = new EventEmitter();
  @Output()
  resetRequested: EventEmitter<void> = new EventEmitter();
  private subscriptions: Subscription[] = [];
  filtersForm!: FormGroup;
  organizationUnitsList: {
    id: string;
    title?: string;
    titleEn?: string;
    committeeSymbol: string;
  }[] = [];
  prioritiesList: any[] = [];
  classificationsList: Classification[] = [];

  readonly dropDownProperties = ['id', 'title', 'titleEn'];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      lang: string;
      filtersData: RecordsFiltersForm2;
      prioritiesList: Priority[];
      selectedPriority: string;
      organizationUnitsList: [];
      classificationsList: Classification[];
      currentTab?: 'Finance' | 'Preparatory';
      viewMode?: 'activeRecords' | 'allRecords';
    },
    private manageRecordsService: ManageRecordsService,
    private cdr: ChangeDetectorRef,
    private manageSharedService: ManageSharedService
  ) {
    this.initializeFiltersForm();
    if (this.data.currentTab) {
      this.currentTab = this.data.currentTab;
    }
    if (this.data.viewMode) {
      this.viewMode = this.data.viewMode;
    }
  }
  get priorityId(): AbstractControl {
    return this.filtersForm.controls['priorityId'];
  }
  get classificationId(): AbstractControl {
    return this.filtersForm.controls['classificationId'];
  }
  get isInitiated(): AbstractControl {
    return this.filtersForm.controls['isInitiated'];
  }

  ngOnInit(): void {
    this.setFilters();
    this.initializeDropDownLists();
    this.detectFiltersChanges();
    this.isInitiatedOptions = [
      { id: true, name: this.lang === 'ar' ? 'نعم' : 'Yes' },
      { id: false, name: this.lang === 'ar' ? 'لا' : 'No' },
    ];
    this.isExportedOptions = [
      { id: false, name: this.lang === 'ar' ? 'نشط' : 'Active' },
      { id: true, name: this.lang === 'ar' ? 'غير نشط' : 'Inactive' },
    ];
    this.prioritiesList = this.data.prioritiesList;
    this.organizationUnitsList = this.data.organizationUnitsList;
    this.classificationsList = this.data.classificationsList;
  }

  validForm() {
    return !this.priorityId.value && !this.classificationId.value && !this.isInitiated.value;
  }

  ngOnChanges(changes: {
    currentTab: SimpleChange;
    lang: SimpleChange;
    filtersData?: SimpleChange;
  }): void {
    // Patch form when filtersData input changes (dialog reopen)
    if (
      changes.filtersData &&
      changes.filtersData.currentValue !== changes.filtersData.previousValue
    ) {
      this.setFilters();
    }

    // Handle currentTab changes
    if (changes.currentTab && changes.currentTab.currentValue === 'Finance') {
      this.organizationUnitsList = [
        {
          id: 'bfb23c24-c443-43c5-b411-aa5140273e06',
          title: 'اللجنة المالية',
          titleEn: 'Finance Committee',
          committeeSymbol: 'أ',
        },
        {
          id: '5284e50a-ecf2-456d-9483-470beeddb8ea',
          title: 'اللجنة التنسيقية',
          titleEn: 'Coordinating Committee',
          committeeSymbol: 'ب',
        },
      ];
    } else if (changes.currentTab && changes.currentTab.currentValue === 'Preparatory') {
      this.filtersForm.patchValue({
        isInitiated: null,
      });
      this.organizationUnitsList = [];
      this.cdr.detectChanges();
    }
    const sub = this.manageSharedService.searchFormValue.subscribe((filters: any) => {
      console.log('Received filters in NotesFiltersComponent:', filters);
      this.filtersForm.patchValue({ ...filters }, { emitEvent: false });
      // if(filters?.priorityId)
      //   this.filtersForm.controls['priority'].setValue(filters?.priorityId, { emitEvent: false });
    });
    this.subscriptions.push(sub);
    this.cdr.detectChanges();

    // Clean up filters when component is destroyed
    this.subscriptions.push(
      new Subscription(() => {
        this.manageSharedService.searchFormValue = null;
      })
    );
  }

  initializeFiltersForm(): void {
    this.filtersForm = new FormGroup({
      priorityId: new FormControl(null, []),
      classificationId: new FormControl(null, []),
      isInitiated: new FormControl(null, []),
      isExported: new FormControl(null, []),
    });
    let selectedItem =
      this.data.prioritiesList.filter((x) => x.id == this.data.selectedPriority)[0] || null;
    this.filtersForm.controls['priorityId'].setValue(this.data.selectedPriority);
  }

  setFilters(): void {
    // Use data.filtersData from dialog injection, fallback to @Input filtersData
    const filterData = this.data?.filtersData || this.filtersData;

    if (filterData) {
      this.filtersForm.patchValue(
        {
          ...filterData,
          // committeeId: filterData.committeeIds?.length === 1 ? filterData.committeeIds[0] : null, // Use null instead of empty string for proper placeholder display
        },
        { emitEvent: false }
      );
    }
  }
  initializeDropDownLists(): void {
    if (this.currentTab === 'Finance') {
      this.organizationUnitsList = this.data.organizationUnitsList;
    } else {
      this.organizationUnitsList = [];
    }
  }

  reset() {
    this.filtersForm.reset({
      priorityId: null,
      classificationId: null,
      isInitiated: null,
      isExported: null, // Will be set to default based on viewMode when filter is applied
    });
    this.manageSharedService.searchFormValue = null;
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    // Emit empty filters to notify parent that filters have been reset
    this.filtersChange.emit({});
    // Emit reset event for app-filters component to handle
    this.resetRequested.emit();
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

  detectFiltersChanges(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          // Create clean object with only non-null, non-empty values
          const cleanedValue: RecordsFiltersForm2 = {};

          // Transform committeeId (singular form field) to committeeIds (API format - array)
          // if (value.committeeId) {
          //   cleanedValue.committeeIds = [value.committeeId];
          // }

          // Include other filters only if they have values
          if (value.priorityId) {
            cleanedValue.priorityId = value.priorityId;
          }

          if (value.classificationId) {
            cleanedValue.classificationId = value.classificationId;
          }

          if (value.isInitiated !== null && value.isInitiated !== undefined) {
            cleanedValue.isInitiated = value.isInitiated;
          }

          if (value.isExported !== null && value.isExported !== undefined) {
            cleanedValue.isExported = value.isExported;
          }
          this.manageSharedService.searchFormValue = this.filtersForm.value;
          this.filtersChange.emit(cleanedValue);
        })
      )
      .subscribe();
  }
}
