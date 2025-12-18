import { Component, DestroyRef, EventEmitter, Inject, inject, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { compareFn } from '@shared/helpers/helpers';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, finalize } from 'rxjs';
import { FoundationDto } from '@pages/home/interfaces/policy.interface';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { SingleSelectComponent } from '@shared/components/single-select/single-select.component';
import { Entity } from '@core/models/entity.model';
import { PendingRequestsFiltersForm } from '@core/models/pending-request.model';
import { RequestsFiltersForm } from '@core/models/request.model';

@Component({
  selector: 'app-policies-filter',
  standalone: true,
  imports: [
    MatDialogModule,
    SingleSelectComponent,

    ReactiveFormsModule,
    TranslateModule,
    CommonModule,
  ],
  templateUrl: './policies-filter.component.html',
  styleUrls: ['./policies-filter.component.scss'],
})
export class PoliciesFilterComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  @Output() filtersChange: EventEmitter<any> = new EventEmitter<any>();
  items: FoundationDto[] = [];
  form!: FormGroup;
  compareFn = compareFn;
  @Output() resetRequested = new EventEmitter<void>();
  private isResetting = false;
  filtersData!: RequestsFiltersForm;
  readonly manageHomeService = inject(ManageHomeService);
  lang!: string;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      lang: string;
      filtersData: RequestsFiltersForm;
    },
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.filtersData && this.filtersData.isExportDocument) {
      this.form.patchValue(
        {
          categoryId: null,
        },
        {
          emitEvent: false,
        }
      );
    }

    if (this.form && this.filtersData && !this.filtersData.isExportDocument) {
      this.form.patchValue(
        {
          categoryId: null,
        },
        {
          emitEvent: false,
        }
      );
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.getCategoriesDropdown();
    this.filtersData = this.data.filtersData;
    this.lang = this.data.lang;
    if (this.filtersData) {
      this.form.patchValue(this.filtersData);
    }
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.isResetting) {
        this.emitDialogFiltersChange();
      }
    });
  }
  emitDialogFiltersChange() {
    this.filtersChange.emit(this.form.value);
  }
  initForm() {
    this.form = this.fb.group({
      categoryId: [null],
    });
  }
  getCategoriesDropdown() {
    this.manageHomeService
      .getCategories()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((res) => {
          this.items = res.data;
        }),
        catchError((err) => {
          return [];
        }),
        finalize(() => {})
      )
      .subscribe();
  }

  reset() {
    this.isResetting = true;
    this.form.reset();
    this.filtersChange.emit({});
    this.isResetting = false;
  }
}
