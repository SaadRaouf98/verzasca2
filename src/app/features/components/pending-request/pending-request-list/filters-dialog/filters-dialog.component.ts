import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Entity } from '@core/models/entity.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ManagePendingTransactionsService } from '@pages/pending-transactions/services/manage-pending-transactions.service';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { DatePickerComponent } from '@shared/components/date-picker/date-picker.component';
import { allExportTypes } from '@shared/helpers/helpers';
import { SingleSelectComponent } from '@shared/components/single-select/single-select.component';
import { CommonModule } from '@angular/common';
import { PendingRequestsFiltersForm } from '@core/models/pending-request.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FromDateToDateSearchService } from '@core/services/search-services/from-date-to-date-search.service';
import { DatePickerHijriComponent } from '@shared/components/date-picker-hijri/date-picker-hijri.component';

@Component({
  selector: 'app-filters-dialog',
  templateUrl: './filters-dialog.component.html',
  styleUrls: ['./filters-dialog.component.scss'],
  imports: [
    MatDialogModule,
    MultiSelectComponent,
    SingleSelectComponent,
    DatePickerComponent,
    DatePickerHijriComponent,
    ReactiveFormsModule,
    TranslateModule,
    CommonModule,
  ],
  standalone: true,
})
export class FiltersDialogComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  protected translate = inject(TranslateService);
  private managePendingTransactionsService = inject(ManagePendingTransactionsService);
  form!: FormGroup;
  prioritiesList: Entity[] = [];
  nextStepsList: any[] = [];
  foundationsList: any[] = [];
  usersList: any[] = [];
  requestTypesList: any[] = [];
  studyProposals: any[] = [];
  @Input() selectedValues: any[] = [];
  @Output() selectionRemoved = new EventEmitter<any>();
  @Output() dialogFiltersChange = new EventEmitter<PendingRequestsFiltersForm>();
  removeSelection(item: any) {
    this.selectionRemoved.emit(item);
  }
  readonly fromDateToDateSearchService = inject(FromDateToDateSearchService);
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      prioritiesList: Entity[];
      nextStepsList: string[];
      foundationsList: any[];
      usersList: any[];
      requestTypesList: any[];
      filterData: PendingRequestsFiltersForm;
    }
  ) {}

  ngOnInit() {
    this.initForm();

    // Position SVG arrow relative to dialog
    setTimeout(() => {
      const dialogContainer = document.querySelector(
        '.filters-dialog-panel .mat-mdc-dialog-container'
      );
      const svg = document.querySelector('svg[width="26"]') as HTMLElement;

      if (dialogContainer && svg) {
        const rect = dialogContainer.getBoundingClientRect();
        const dialogCenterX = rect.left + rect.width / 2;
        const viewportCenterX = window.innerWidth / 2;
        const offset = dialogCenterX - viewportCenterX;

        // Calculate left percentage for fixed positioning
        const leftPercent = 50 + (offset / window.innerWidth) * 100;
        svg.style.left = `${leftPercent}%`;
      }
    }, 100);

    this.prioritiesList = this.data?.prioritiesList ?? [];
    this.nextStepsList = this.data?.nextStepsList.map((step) => ({
      id: step,
      title: step,
    }));
    this.foundationsList = this.data?.foundationsList ?? [];
    this.usersList = this.data?.usersList ?? [];
    this.requestTypesList = this.data?.requestTypesList ?? [];
    this.studyProposals = allExportTypes.map((item) => ({
      ...item,
      name: this.translate.instant(item.name),
    }));

    // Patch form with previous filter data if it exists
    if (this.data.filterData) {
      this.form.patchValue(this.data.filterData);
    }

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.emitDialogFiltersChange();
    });
  }

  initForm() {
    this.form = this.fb.group({
      requestType: [null],
      foundation: [null],
      priority: [null],
      nextStep: [null],
      proposal: [null],
      consultant: [null],
      fromDate: [null],
      toDate: [null],
      hijriFromDate: [null],
      hijriToDate: [null],
    });
  }

  private mapIdsToObjects(ids: any[], sourceList: any[]): any[] {
    return (ids || [])
      .map((id: any) => sourceList.find((item: any) => item.id === id))
      .filter(Boolean);
  }

  private removeSelectionFromForm(controlName: string, id: any) {
    const current = this.form.get(controlName)?.value || [];
    this.form.get(controlName)?.setValue(current.filter((v: any) => v !== id));
  }

  get selectedTypes() {
    return this.mapIdsToObjects(this.form?.get('requestType')?.value, this.requestTypesList);
  }

  get selectedFoundations() {
    return this.mapIdsToObjects(this.form?.get('foundation')?.value, this.foundationsList);
  }

  get selectedPriority() {
    const id = this.form?.get('priority')?.value;
    return id ? this.prioritiesList.find((item) => item.id === id) : null;
  }

  get selectedNextStep() {
    const id = this.form?.get('nextStep')?.value;
    return id ? this.nextStepsList.find((item) => item.id === id) : null;
  }

  get selectedProposal() {
    const id = this.form?.get('proposal')?.value;
    return id ? this.studyProposals.find((item) => item.id === id) : null;
  }

  get selectedConsultant() {
    const id = this.form?.get('consultant')?.value;
    return id ? this.usersList.find((item) => item.id === id) : null;
  }

  get selectedFromDate() {
    const date = this.form?.get('fromDate')?.value;
    return date ? this.formatDate(date) : null;
  }

  get selectedToDate() {
    const date = this.form?.get('toDate')?.value;
    return date ? this.formatDate(date) : null;
  }

  private formatDate(date: any): string {
    if (!date) return '';
    try {
      // If it's a moment object
      if (date._isAMomentObject) {
        return date.format('YYYY/MM/DD');
      }
      // If it's already a string
      if (typeof date === 'string') {
        return date;
      }
      // If it's a Date object
      if (date instanceof Date) {
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
          .getDate()
          .toString()
          .padStart(2, '0')}`;
      }
    } catch (error) {
      return '';
    }
    return '';
  }

  removeFromDate() {
    this.form.get('fromDate')?.setValue(null);
  }

  removeToDate() {
    this.form.get('toDate')?.setValue(null);
  }

  removeType(id: any) {
    this.removeSelectionFromForm('requestType', id);
  }

  removeFoundation(id: any) {
    this.removeSelectionFromForm('foundation', id);
  }

  removePriority() {
    this.form.get('priority')?.setValue(null);
  }

  removeNextStep() {
    this.form.get('nextStep')?.setValue(null);
  }

  removeProposal() {
    this.form.get('proposal')?.setValue(null);
  }

  removeConsultant() {
    this.form.get('consultant')?.setValue(null);
  }
  @Output() resetRequested = new EventEmitter<void>(); // Add this line

  get hasActiveFilters(): boolean {
    const formValue = this.form?.value;
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

  reset() {
    this.form.reset();
    this.resetRequested.emit(); // Add this line to emit reset event
  }

  emitDialogFiltersChange() {
    this.dialogFiltersChange.emit(this.form.value as PendingRequestsFiltersForm);
  }
}
