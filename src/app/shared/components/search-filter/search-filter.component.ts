import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent {
  /** Placeholder text for the input */
  @Input() placeholder = 'بحث…';

  /** Emits the current input value on Enter or when clear is clicked */
  @Output() search = new EventEmitter<string>();

  /** Emits when the filter icon is clicked */
  @Output() filterClick = new EventEmitter<void>();

  query = '';

  onKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search.emit(this.query.trim());
    }
  }

  clear() {
    this.query = '';
    this.search.emit(this.query);
  }

  onFilterClick() {
    this.filterClick.emit();
  }
}
