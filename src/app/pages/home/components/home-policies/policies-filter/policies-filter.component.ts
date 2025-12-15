import { Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { compareFn } from '@shared/helpers/helpers';
import { ManageHomeService } from '@pages/home/services/manage-home.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, finalize } from 'rxjs';
import { FoundationDto } from '@pages/home/interfaces/policy.interface';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { SingleSelectComponent } from '@shared/components/single-select/single-select.component';

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

  readonly manageHomeService = inject(ManageHomeService);

  ngOnInit(): void {
    this.initForm();
    this.getCategoriesDropdown();
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
