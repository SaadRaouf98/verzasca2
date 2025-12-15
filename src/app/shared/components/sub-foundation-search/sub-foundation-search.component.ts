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
  selector: 'app-sub-foundation-search',
  templateUrl: './sub-foundation-search.component.html',
  styleUrls: ['./sub-foundation-search.component.scss'],
})
export class SubFoundationSearchComponent {
  foundationsList: { id: string; title: string }[] = [];

  dropDownValue!:
    | { id: string; title: string }
    | { id: string; title: string }[];
  compareFn = compareFn;

  subFoundationFormControl: FormControl = new FormControl();
  @Input('placeholder') placeholder!: string;
  @Input('value') value!: string | null;
  @Input('subFoundationParentId') subFoundationParentId!:
    | string
    | null
    | undefined;

  @Output() emitValue: EventEmitter<object> = new EventEmitter();
  @Output() touched: EventEmitter<boolean> = new EventEmitter();
  @Output() clear: EventEmitter<void> = new EventEmitter();
  @Output() remove: EventEmitter<{ id: string; title: string }> =
    new EventEmitter();

  constructor(private foundationsService: FoundationsService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: {
    value: SimpleChange;
    subFoundationParentId: SimpleChange;
  }): void {
    if (changes.value) {
      this.subFoundationFormControl.setValue(changes.value.currentValue);
    }

    if (this.subFoundationFormControl.value) {
      this.foundationsList.push(this.subFoundationFormControl.value);
    }

    if (this.subFoundationParentId) {
      this.searchOnFoundations(undefined, 20);
    } else {
      this.subFoundationFormControl.setValue('');
      this.foundationsList = [];
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
          parentId: this.subFoundationParentId
            ? this.subFoundationParentId
            : null,
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
    this.touched.emit(this.subFoundationFormControl.touched);
  }

  onClearFoundations(): void {
    this.clear.emit();
  }

  onRemoveSingleFoundation(event: { id: string; title: string }): void {
    this.remove.emit(event);
  }
}

