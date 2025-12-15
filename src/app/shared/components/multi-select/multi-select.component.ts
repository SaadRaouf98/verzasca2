import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Option } from '@shared/components/form/form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    TranslateModule,
    MatRadioModule,
    MatCheckboxModule,
  ],
})
export class MultiSelectComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() bindLabel = 'title';
  @Input() bindValue = 'id';
  @Input() multiple: boolean = false;
  @Input() searchable: boolean = false;
  @Input() disabled = false;
  @Input() showSelected = false;
  @Input() placeholder = '';
  @Input() appendTo = '';
  selectedOption = '';
  @Output() selectionChange = new EventEmitter<any>();
  @Output() searchChange = new EventEmitter<string>(); // <-- New Output!
  selectedCounter: number = 0;
  internalValue: any;
  internalValueToSHow = [];
  searchTerm: string = '';

  writeValue(value: any): void {
    this.internalValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onChangeTriggered(val) {
    this.internalValueToSHow = val;
    this.onChange(this.internalValue);
    this.selectionChange.emit(this.internalValue);
  }

  onSearchInput(term: any) {
    this.searchTerm = term;
    this.searchChange.emit(term); // <--- Emit live search term
  }
  clear(item) {}
  isChecked(item: any): boolean {
    if (this.multiple) {
      // If internalValue is array of values (IDs)
      return Array.isArray(this.internalValue) && this.internalValue.includes(item[this.bindValue]);
    } else {
      // For single selection, internalValue is the value (ID)
      return this.internalValue === item[this.bindValue];
    }
  }

  onChange: any = () => {};
  onTouched: any = () => {};
}
