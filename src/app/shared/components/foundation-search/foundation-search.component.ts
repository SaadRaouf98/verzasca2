import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { FoundationsService } from '@core/services/backend-services/foundations.service';
import { compareFn } from '@shared/helpers/helpers';

@Component({
  selector: 'app-foundation-search',
  templateUrl: './foundation-search.component.html',
  styleUrls: ['./foundation-search.component.scss'],
})
export class FoundationSearchComponent {
  foundationsList: { id: string; title: string }[] = [];

  dropDownValue!:
    | { id: string; title: string }
    | { id: string; title: string }[];
  compareFn = compareFn;

  foundationFormControl: FormControl = new FormControl();
  @Input('multiple') multiple: boolean = false;
  @Input('placeholder') placeholder!: string;
  @Input('value') value!: string | null;

  @Output() emitValue: EventEmitter<object> = new EventEmitter();
  @Output() touched: EventEmitter<boolean> = new EventEmitter();
  @Output() clear: EventEmitter<void> = new EventEmitter();
  @Output() remove: EventEmitter<{ id: string; title: string }> =
    new EventEmitter();

  constructor(private foundationsService: FoundationsService) {}

  ngOnInit(): void {
    this.searchOnFoundations();
  }

  ngOnChanges(changes: { value: SimpleChange }): void {
    this.foundationFormControl.setValue(changes.value.currentValue);
    if (this.foundationFormControl.value) {
      if (
        Array.isArray(this.foundationFormControl.value) &&
        this.foundationFormControl.value.length
      ) {
        this.foundationsList.push(...this.foundationFormControl.value);
      } else if (
        !Array.isArray(this.foundationFormControl.value) &&
        !this.isExistInList(this.foundationFormControl.value.id)
      ) {
        this.foundationsList.push(this.foundationFormControl.value);
      }
    }
  }

  searchOnFoundations(
    event?: { term: string; items: any[] },
    pageSize = 20
  ): void {
    let searchKeyword = undefined;

    if (event) {
      pageSize = 10;
      searchKeyword = event.term;
    }

    this.foundationsService
      .getFoundationsList(
        {
          pageSize,
          pageIndex: 0,
        },
        {
          parentId: null,
          searchKeyword: searchKeyword || '',
        },
        undefined,
        ['id', 'title']
      )
      .subscribe({
        next: (res) => {
          this.foundationsList = res.data;
        },
      });
  }

  onSelectionChange(e: any): void {
    this.emitValue.emit(e);
  }

  onBlur(): void {
    this.touched.emit(this.foundationFormControl.touched);
  }

  onClearFoundations(): void {
    this.clear.emit();
  }

  onRemoveSingleFoundation(event: { id: string; title: string }): void {
    this.remove.emit(event);
  }

  isExistInList(foundationId: string): boolean {
    return this.foundationsList.find((ele) => ele.id === foundationId)
      ? true
      : false;
  }
}


