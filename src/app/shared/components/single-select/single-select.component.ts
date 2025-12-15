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
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select',
  templateUrl: './single-select.component.html',
  styleUrls: ['./single-select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SingleSelectComponent),
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
    MatTooltipModule,
  ],
})
export class SingleSelectComponent implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() bindLabel = 'title';
  @Input() bindValue = 'id';
  @Input() multiple: boolean = false;
  @Input() searchable: boolean = false;
  @Input() disabled = false;
  @Input() readonly: boolean = false;
  @Input() hideSelected: boolean = false;
  @Input() showSelected = false;
  @Input() placeholder = '';
  @Input() appendTo = '';
  selectedOption = '';
  @Output() selectionChange = new EventEmitter<any>();
  @Output() searchChange = new EventEmitter<string>(); // <-- New Output!
  @Output() scrollToEnd = new EventEmitter<void>();
  selectedCounter: number = 0;
  internalValue: any;
  searchTerm: string = '';

  writeValue(value: any): void {
    // When multiple is true, ensure value is always an array
    if (this.multiple) {
      if (Array.isArray(value)) {
        this.internalValue = value;
      } else if (value) {
        this.internalValue = [value];
      } else {
        this.internalValue = [];
      }
    } else {
      this.internalValue = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onChangeTriggered() {
    this.onChange(this.internalValue);
    this.selectionChange.emit(this.internalValue);
  }

  onSearchInput(term: any) {
    this.searchTerm = term;
    this.searchChange.emit(term); // <--- Emit live search term
  }
  isChecked(item: any): boolean {
    if (this.multiple && Array.isArray(this.internalValue)) {
      return this.internalValue.includes(item[this.bindValue]);
    }
    return this.internalValue === item[this.bindValue];
  }

  onChange: any = () => {};
  onTouched: any = () => {};
}
