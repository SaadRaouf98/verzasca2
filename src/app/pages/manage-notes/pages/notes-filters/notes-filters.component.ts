import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RequestContainerStatus } from '@core/enums/request-container-status.enum';
import { Entity } from '@core/models/entity.model';
import { NotesFiltersForm } from '@core/models/note.model';
import { FoundationsSearchService } from '@core/services/search-services/foundations-search.service';
import { FromDateToDateSearchService } from '@core/services/search-services/from-date-to-date-search.service';
import { SectorsSearchService } from '@core/services/search-services/sectors-search.service';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { compareFn, removeSpecialCharacters } from '@shared/helpers/helpers';
import { Observable, Subscription } from 'rxjs';
import { ExportedDocumentType } from '@core/enums/exported-docuemnt-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { ManageSharedService } from '@shared/services/manage-shared.service';

@Component({
  selector: 'app-notes-filters',
  templateUrl: './notes-filters.component.html',
  styleUrls: [
    './notes-filters.component.scss',
    '../../../../features/components/pending-request/pending-request-list/filters-dialog/filters-dialog.component.scss',
  ],
  providers: [FoundationsSearchService, SectorsSearchService, FromDateToDateSearchService],
})
export class NotesFiltersComponent implements OnInit, OnChanges {
  isSignedOptions: { id: string | boolean; name: string }[] = [];
  ExportedDocumentType = ExportedDocumentType;
  documentTypeOptions = [
    {
      id: this.ExportedDocumentType.Letter,
      title: this.translateService.instant('TransactionsModule.ExportDocumentComponent.letter'),
      value: this.ExportedDocumentType.Letter,
    },
    {
      id: this.ExportedDocumentType.Note,
      title: this.translateService.instant('TransactionsModule.ExportDocumentComponent.note'),
      value: this.ExportedDocumentType.Note,
    },
  ];
  @Input() lang: string = 'ar';
  // @Input() filtersData!: NotesFiltersForm;

  destroyRef = inject(DestroyRef);
  @Output() filtersChange: EventEmitter<NotesFiltersForm> = new EventEmitter<NotesFiltersForm>();
  @Output() resetRequested = new EventEmitter<void>();
  filtersForm!: FormGroup;
  usersList$: Observable<{
    data: {
      id: string;
      name: string;
    }[];
    totalCount: number;
    groupCount: number;
  }> = new Observable();
  classificationsList$: Observable<{
    data: {
      id: string;
      title: string;
      titleEn: string;
    }[];
    totalCount: number;
    groupCount: number;
  }> = new Observable();
  RequestContainerStatus = RequestContainerStatus;
  private subscriptions: Subscription[] = [];
  compareFn = compareFn;
  private dialogClosed = false;

  prioritiesList: Entity[] = [];

  readonly foundationsSearchService = inject(FoundationsSearchService);
  readonly sectorsSearchService = inject(SectorsSearchService);
  readonly fromDateToDateSearchService = inject(FromDateToDateSearchService);

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      lang: string;
      filtersData: NotesFiltersForm;
      prioritiesList: Entity[];
      selectedPriority: string;
    },
    private dialogRef: MatDialogRef<NotesFiltersComponent>,
    private manageImportsExportsService: ManageImportsExportsService,
    private translateService: TranslateService,
    private manageSharedService: ManageSharedService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    let selectedPriority = this.prioritiesList.filter(
      (x) => x.id == this.data.filtersData.priorityId
    );

    this.filtersForm.controls['priority'].setValue(selectedPriority[0] || []);
  }
  ngOnInit(): void {
    // Set up signed options
    this.isSignedOptions = [
      // { id: '', name: this.lang === 'ar' ? 'الكل' : 'All' },
      { id: true, name: this.lang === 'ar' ? 'نعم' : 'Yes' },
      { id: false, name: this.lang === 'ar' ? 'لا' : 'No' },
    ];

    // Set priorities list from data
    this.prioritiesList = this.data?.prioritiesList || [];

    // Initialize form
    this.initializeFiltersForm();

    // Patch form with saved filter data
    this.setFilters();

    // Initialize dropdown lists
    this.initializeDropDownLists();

    // Listen to form changes
    this.filtersForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.detectFiltersChanges();
    });

    const sub = this.manageSharedService.searchFormValue.subscribe((filters: any) => {
      console.log('Received filters in NotesFiltersComponent:', filters);
      this.filtersForm.patchValue({ ...filters }, { emitEvent: false });
      if (filters?.priorityId)
        this.filtersForm.controls['priority'].setValue(filters?.priorityId, { emitEvent: false });
    });
    this.subscriptions.push(sub);

    // Clean up filters when dialog closes
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogClosed = true;
      this.subscriptions.forEach((sub) => sub.unsubscribe());
    });
  }

  initializeFiltersForm(): void {
    this.filtersForm = new FormGroup({
      priority: new FormControl(null),
      documentType: new FormControl(null),
      consultant: new FormControl(null),
      classification: new FormControl(null),
      isInitiated: new FormControl(null),
      isSigned: new FormControl(null),
      fromDate: new FormControl(null),
      toDate: new FormControl(''),
      hijriFromDate: new FormControl(''),
      hijriToDate: new FormControl(''),
      // searchKeyword: new FormControl(''),
    });
  }

  initializeDropDownLists(): void {
    //The priorities list won't exceed 20 items,so I made it this way

    this.usersList$ = this.manageImportsExportsService.usersService.getUsersList(
      {
        pageSize: 20,
        pageIndex: 0,
      },
      undefined,
      undefined,
      ['id', 'name']
    );

    this.classificationsList$ =
      this.manageImportsExportsService.classificationsService.getClassificationsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        undefined,
        undefined,
        ['id', 'title', 'titleEn']
      );
  }

  setFilters(): void {
    if (this.data?.filtersData) {
      // Use prioritiesList from data if available
      const prioritiesList = this.data.prioritiesList || this.prioritiesList;

      // Transform IDs back to objects for form patching
      const filtersToPatch = {
        ...this.data.filtersData,
        priority:
          this.data.filtersData.priorityId && prioritiesList
            ? prioritiesList.find((p) => p.id === this.data.filtersData.priorityId)
            : null,
        consultant: this.data.filtersData.consultantId || null,
        classification: this.data.filtersData.classificationId || null,
      };
      this.filtersForm.patchValue(filtersToPatch, { emitEvent: false });
    }
  }

  reset() {
    this.filtersForm.reset();
    this.manageSharedService.searchFormValue = null;
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.filtersChange.emit({} as NotesFiltersForm);
    this.resetRequested.emit();
    this.dialogRef.close();
  }

  get hasActiveFilters(): boolean {
    const formValue = this.filtersForm?.value;
    if (!formValue) return false;

    // Check only user-selectable fields, excluding documentType which is set automatically
    return Object.keys(formValue).some((key) => {
      // Skip documentType as it's set automatically by the parent component
      if (key === 'documentType') return false;

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
    let filteedData = {
      searchKeyword: this.filtersForm.value.searchKeyword,
      priorityId: this.filtersForm.value.priority?.id || this.filtersForm.value.priority || '',
      // documentType: this.filtersForm.value.documentType || '',
      consultantId:
        this.filtersForm.value.consultant?.id || this.filtersForm.value.consultant || '',
      classificationId:
        this.filtersForm.value.classification?.id || this.filtersForm.value.classification || '',
      isInitiated: this.filtersForm.value.isInitiated,
      isSigned: this.filtersForm.value.isSigned,
      fromDate: this.filtersForm.value.fromDate,
      toDate: this.filtersForm.value.toDate,
      hijriFromDate: this.filtersForm.value.hijriFromDate,
      hijriToDate: this.filtersForm.value.hijriToDate,
    };

    // Filter out null, undefined, and empty string values
    const filteredData = Object.keys(filteedData).reduce((acc: any, key: string) => {
      const value = filteedData[key as keyof typeof filteedData];
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    this.filtersChange.emit(filteredData as NotesFiltersForm);
    // Only update shared service if there are actual filter values
    if (Object.keys(filteredData).length > 0) {
      this.manageSharedService.searchFormValue = filteredData;
    }
  }
}
