import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  Input,
  ChangeDetectorRef,
  ElementRef,
  Renderer2,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputComponent } from '@shared/components/input/input.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PendingRequestsFiltersForm } from '@core/models/pending-request.model';
import { ActivatedRoute } from '@angular/router';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { FiltersDialogComponent } from '../filters-dialog/filters-dialog.component';
import { Entity } from '@core/models/entity.model';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, InputComponent],
})
export class FiltersComponent implements OnInit, OnChanges {
  @Input() prioritiesList: Entity[] = [];
  @Input() nextStepsList: string[] = [];
  @Input() foundationsList: any[] = [];
  @Input() usersList: any[] = [];
  @Input() requestTypesList: any[] = [];
  @Input() isPendingListFilters = false;
  @Input() selectedPriority;
  @Input() filterData;
  @Input() hasFiltersApplied = false;

  localFilterData: any = {};
  currentSearchFormValue: any = {};

  destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  protected translate = inject(TranslateService);

  private isResetting = false;
  private filtersDialogRef: MatDialogRef<FiltersDialogComponent> | null = null;
  private globalClickUnlisten: (() => void) | null = null;

  clicked = false;
  filtersForm!: FormGroup;
  _hasActiveFilters = false;

  @Output() filtersChange = new EventEmitter<PendingRequestsFiltersForm>();
  @Output() openDialog = new EventEmitter();
  @Output() resetFilters = new EventEmitter();

  get hasActiveFilters(): boolean {
    return this.hasFiltersApplied || this._hasActiveFilters;
  }

  set hasActiveFilters(value: boolean) {
    this._hasActiveFilters = value;
  }

  constructor(
    private dialog: MatDialog,
    private renderer: Renderer2,
    private el: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private manageSharedService: ManageSharedService
  ) {}

  ngOnInit() {
    this.initForm();

    this.filtersForm
      .get('searchKeyword')
      ?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.isResetting) return;

        const searchKeyword = this.filtersForm.get('searchKeyword')?.value;
        if (!searchKeyword || searchKeyword.trim().length >= 2) {
          this.hasActiveFilters = true;
          this.emitFiltersChange();
        }
      });

    this.manageSharedService.searchFormValue
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        if (this.isResetting) return;

        this.currentSearchFormValue = value || {};

        if (
          value &&
          Object.keys(value).some(
            (key) => value[key] !== null && value[key] !== undefined && value[key] !== ''
          )
        ) {
          this.hasActiveFilters = true;
          this.filtersChange.emit(value);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.localFilterData = this.filterData || {};

    if (
      changes['selectedPriority'] &&
      changes['selectedPriority'].currentValue !== changes['selectedPriority'].previousValue
    ) {
      if (this.selectedPriority) {
        const isString = typeof this.selectedPriority === 'string';
        this.filtersForm.controls['priority'].setValue(
          isString ? this.selectedPriority : this.selectedPriority.id
        );
      } else {
        this.filtersForm?.controls['priority']?.setValue(null);
      }
    }
  }

  initForm() {
    this.filtersForm = this.fb.group({
      priority: [null],
      searchKeyword: [''],
    });

    const searchKey = this.route.snapshot.queryParamMap.get('searchKeyword');
    this.filtersForm.controls['searchKeyword'].setValue(searchKey);
  }

  get hasFormValues(): boolean {
    const formValue = this.filtersForm.value;
    const hasSearchKeyword = formValue.searchKeyword && formValue.searchKeyword.trim().length > 0;
    const hasPriority = formValue.priority && formValue.priority !== null;

    return hasSearchKeyword || hasPriority;
  }

  openFiltersDialog(event: MouseEvent) {
    if (this.filtersDialogRef) return;

    this.clicked = true;

    const svgRect = (event.target as HTMLElement).getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const dialogWidth = 23.625 * rem;

    if (!this.isPendingListFilters) {
      this.openDialog.emit(event);
      return;
    }

    let top = svgRect.bottom + window.scrollY;
    let left = svgRect.left + window.scrollX + svgRect.width / 2 - dialogWidth / 2;

    this.filtersDialogRef = this.dialog.open(FiltersDialogComponent, {
      height: '558px',
      width: '23.625rem',
      hasBackdrop: false,
      position: { top: `${top}px`, left: `${left}px` },
      panelClass: 'filters-dialog-panel',
      data: {
        prioritiesList: this.prioritiesList,
        nextStepsList: this.nextStepsList,
        foundationsList: this.foundationsList,
        usersList: this.usersList,
        requestTypesList: this.requestTypesList,
        filterData: this.localFilterData,
      },
    });

    this.filtersDialogRef.afterOpened().subscribe(() => {
      const dialogComponent = this.filtersDialogRef!.componentInstance;

      dialogComponent.dialogFiltersChange.subscribe((dialogFilters: PendingRequestsFiltersForm) => {
        this.onDialogFiltersChanged(dialogFilters);
      });

      dialogComponent.resetRequested.subscribe(() => {
        this.resetAllFilters();
      });
    });

    setTimeout(() => {
      const dialogContainer = document.querySelector('.mat-mdc-dialog-container') as HTMLElement;

      if (dialogContainer) {
        const actualWidth = dialogContainer.offsetWidth;
        left = svgRect.left + window.scrollX + svgRect.width / 2 - actualWidth / 2;
        dialogContainer.style.left = `${left}px`;
        dialogContainer.style.top = `${top}px`;
      }

      this.globalClickUnlisten = this.renderer.listen(
        'document',
        'mousedown',
        (evt: MouseEvent) => {
          const dialogOverlay = document.querySelector('.cdk-overlay-container');
          const datepickerPopup = document.querySelector(
            '.mat-datepicker-content, .mat-mdc-datepicker-content'
          );
          const trigger = event.target as HTMLElement;

          if (
            (dialogOverlay && dialogOverlay.contains(evt.target as Node)) ||
            (datepickerPopup && datepickerPopup.contains(evt.target as Node)) ||
            trigger.contains(evt.target as Node)
          ) {
            return;
          }

          this.filtersDialogRef?.close();
        }
      );
    });

    this.filtersDialogRef.afterClosed().subscribe(() => {
      this.filtersDialogRef = null;
      this.clicked = false;
      this.changeDetectorRef.detectChanges();

      if (this.globalClickUnlisten) {
        this.globalClickUnlisten();
        this.globalClickUnlisten = null;
      }
    });
  }

  resetAllFilters() {
    this.isResetting = true;

    this.filtersForm.reset({ priority: null, searchKeyword: '' }, { emitEvent: false });

    this.localFilterData = {};
    this.currentSearchFormValue = {};

    this.hasActiveFilters = false;

    this.filtersChange.emit({} as PendingRequestsFiltersForm);

    setTimeout(() => (this.isResetting = false), 50);
  }

  reset() {
    this.isResetting = true;

    this.filtersForm.reset({ priority: null, searchKeyword: '' }, { emitEvent: false });

    this.localFilterData = {};
    this.currentSearchFormValue = {};
    this.hasActiveFilters = false;

    this.resetFilters.emit();
    this.filtersChange.emit({} as PendingRequestsFiltersForm);

    setTimeout(() => (this.isResetting = false), 50);
  }

  emitFiltersChange() {
    const formValue = this.filtersForm.value;
    const cleanedFilters: any = {};

    if (formValue.priority) cleanedFilters.priority = formValue.priority;
    if (formValue.searchKeyword && formValue.searchKeyword.trim())
      cleanedFilters.searchKeyword = formValue.searchKeyword.trim();

    this.hasActiveFilters = true;
    this.filtersChange.emit(cleanedFilters as PendingRequestsFiltersForm);
  }

  onDialogFiltersChanged(dialogFilters: PendingRequestsFiltersForm) {
    const mergedFilters = { ...this.filtersForm.value, ...dialogFilters };
    this.hasActiveFilters = true;
    this.filtersChange.emit(mergedFilters);
  }

  isSearchValid(reset?: boolean): boolean {
    if (reset) return false;

    const priority = this.filtersForm.get('priority')?.value;
    const searchKeyword = this.filtersForm.get('searchKeyword')?.value;

    const hasFilterData =
      this.localFilterData &&
      Object.keys(this.localFilterData).some((key) => {
        const value = this.localFilterData[key];
        return value !== null && value !== undefined && value !== '';
      });

    const hasSearchFormValue =
      this.currentSearchFormValue &&
      Object.keys(this.currentSearchFormValue).some((key) => {
        const value = this.currentSearchFormValue[key];
        return value !== null && value !== undefined && value !== '';
      });

    return !!(
      priority ||
      (searchKeyword && searchKeyword.trim()) ||
      hasFilterData ||
      hasSearchFormValue
    );
  }

  ngOnDestroy(): void {
    if (this.globalClickUnlisten) this.globalClickUnlisten();
    // Clear shared filters when component is destroyed to prevent filter leakage to other pages
    this.manageSharedService.searchFormValue = null;
  }
}
