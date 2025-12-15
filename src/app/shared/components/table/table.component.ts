import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  ContentChild,
  QueryList,
  AfterContentInit,
  TemplateRef,
} from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { TableCellDirective } from '@shared/directives/table-cell.directive';
import { TableRowDetailDirective } from '@shared/directives/table-row.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShowWhenNoDataDirective } from '@shared/directives/show-when-no-data.directive';

export type FilterMode = 'client' | 'server';

// @ts-ignore
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ShowWhenNoDataDirective],
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0px', opacity: 0, overflow: 'hidden' }),
        animate(
          '225ms cubic-bezier(0.4,0.0,0.2,1)',
          style({ height: '*', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate(
          '225ms cubic-bezier(0.4,0.0,0.2,1)',
          style({ height: '0px', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class TableComponent<T extends Record<string, any>>
  implements AfterContentInit
{
  @Input() columns: { key: string; label: string }[] = [];
  @Input() items: T[] = [];
  @Input() total = 0;
  @Input() showActions = false;
  @Input() pageSizeOptions: number[] = [5, 10, 25];
  @Input() pageSize = 5;
  @Input() currentPage = 0;
  @Input() sortKey = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';
  @Input() filterText = '';
  @Input() filterMode: FilterMode = 'client';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{
    key: string;
    direction: 'asc' | 'desc';
  }>();
  @Output() filter = new EventEmitter<string>();

  @ContentChildren(TableCellDirective)
  cellTemplates!: QueryList<TableCellDirective>;
  @ContentChild(TableRowDetailDirective) detailTpl?: TableRowDetailDirective;
  templatesMap: { [key: string]: TemplateRef<any> } = {};

  expandedRows = new Set<T>();

  ngAfterContentInit() {
    this.cellTemplates.forEach(
      (dir) => (this.templatesMap[dir.columnKey] = dir.template)
    );
  }

  /** Client filtering if in client mode */
  get displayedItems(): T[] {
    if (this.filterMode === 'client' && this.filterText) {
      const txt = this.filterText.toLowerCase();
      return this.items.filter((row) =>
        this.columns.some((col) => {
          const v = row[col.key];
          return v != null && v.toString().toLowerCase().includes(txt);
        })
      );
    }
    return this.items;
  }

  /** Client pagination on displayedItems */
  get clientPaginatedItems(): T[] {
    const start = this.currentPage * this.pageSize;
    return this.displayedItems.slice(start, start + this.pageSize);
  }

  get clientTotalPages(): number {
    return Math.ceil(this.displayedItems.length / this.pageSize);
  }

  onFilterChange(text: string) {
    this.filterText = text;
    if (this.filterMode === 'server') {
      this.filter.emit(text);
    } else {
      this.currentPage = 0;
    }
  }

  onSort(colKey: string) {
    let direction: 'asc' | 'desc' = 'asc';
    if (this.sortKey === colKey)
      direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortKey = colKey;
    this.sortDirection = direction;
    this.sortChange.emit({ key: colKey, direction });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (this.filterMode === 'server') this.pageChange.emit(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0;
    if (this.filterMode === 'server') this.pageSizeChange.emit(size);
  }

  toggleRow(row: T) {
    if (this.expandedRows.has(row)) this.expandedRows.delete(row);
    else this.expandedRows.add(row);
  }

  protected readonly Math = Math;
}
