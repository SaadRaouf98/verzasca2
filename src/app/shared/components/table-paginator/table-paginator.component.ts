import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-table-paginator',
  templateUrl: './table-paginator.component.html',
  styleUrls: ['./table-paginator.component.scss'],
})
export class TablePaginatorComponent {
  @Input('length') length!: number;
  @Input('pageIndex') pageIndex!: number;
  @Input('pageSize') pageSize!: number;
  @Input('pageSizeOptions') pageSizeOptions: number[] = [20, 30, 40, 50];
  @Input('pageEvent') pageEvent!: PageEvent;
  @Output() changePage: EventEmitter<{
    pageSize: number;
    pageIndex: number;
  }> = new EventEmitter();

  onPaginationChange(pageInformation: {
    pageSize: number;
    pageIndex: number;
  }): void {
    this.changePage.emit(pageInformation);
  }
}
