import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Entity } from '@core/models/entity.model';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { isSmallDeviceWidthForTable } from '@shared/helpers/helpers';

@Component({
  selector: 'app-title-description-table',
  templateUrl: './title-description-table.component.html',
  styleUrls: ['./title-description-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class TitleDescriptionTableComponent {
  pageEvent!: PageEvent;
  displayedColumns: string[] = [];
  expandedElement!: Entity | null;

  @Input() isLoading: boolean = true;
  @Input() dataSource: MatTableDataSource<Entity> =
    new MatTableDataSource<Entity>([]);
  @Input() pageIndex!: number;
  @Input() pageSize!: number;
  @Input() length!: number;
  @Input() sortData: {
    sortBy: string;
    sortType: SortDirection;
  } = {
    sortBy: '',
    sortType: '',
  };

  @Input() canEdit!: boolean;
  @Input() canDelete!: boolean;

  @Output() pageChange: EventEmitter<{
    pageSize: number;
    pageIndex: number;
  }> = new EventEmitter<{ pageSize: number; pageIndex: number }>();

  @Output() sortChange: EventEmitter<{
    sortBy: string;
    sortType: SortDirection;
  }> = new EventEmitter<{ sortBy: string; sortType: SortDirection }>();

  @Output() viewElement: EventEmitter<string> = new EventEmitter<string>();

  @Output() editElement: EventEmitter<string> = new EventEmitter<string>();

  @Output() deleteElement: EventEmitter<Entity> = new EventEmitter<Entity>();

  constructor() {}

  onSortColumn(sortInformation: {
    active: string;
    direction: SortDirection;
  }): void {
    this.sortData = {
      sortBy: sortInformation.active,
      sortType: sortInformation.direction,
    };

    this.sortChange.next(this.sortData);
  }

  onPaginationChange(pageInformation: {
    pageSize: number;
    pageIndex: number;
  }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.pageChange.next({
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
    });
  }

  onViewElement(id: string): void {
    this.viewElement.next(id);
  }

  onEditElement(id: string): void {
    this.editElement.next(id);
  }

  onDeleteElement(element: Entity): void {
    this.deleteElement.next(element);
  }

  view_hide_element(element: Entity): void {
    if (isSmallDeviceWidthForTable(768)) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: Entity): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable(768)) {
      return ['title', 'actions'];
    } else {
      return ['title', 'titleEn', 'description', 'descriptionEn', 'actions'];
    }
  }
}
