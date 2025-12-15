import { Injector } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { LanguageService } from '@core/services/language.service';
import { isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { Observable } from 'rxjs';

export abstract class AbstractTable {
  protected langugaeService: LanguageService;

  length: number = 100000;
  pageEvent!: PageEvent;
  displayedColumns: string[] = [];

  pageIndex: number = 0;
  pageSize: number = 20;

  sortData: {
    sortBy: string;
    sortType: SortDirection;
  } = {
    sortBy: '',
    sortType: '',
  };
  expandedElement!: any | null;

  isLoading: boolean = true;
  lang: string = 'ar';

  queryParamsMap?: any;

  constructor(injector: Injector) {
    this.langugaeService = injector.get(LanguageService);
    this.lang = this.langugaeService.language;
  }

  abstract initializeTable(): Observable<any>;
  abstract return_displayed_columns(): string[];

  //optional methods
  setFiltersFromUrl?(queryParams: any): void;

  onSortColumn(sortInformation: {
    active: string;
    direction: SortDirection;
  }): void {
    this.sortData = {
      sortBy: sortInformation.active,
      sortType: sortInformation.direction,
    };
    this.initializeTable().subscribe();
  }

  onPaginationChange(pageInformation: {
    pageSize: number;
    pageIndex: number;
  }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;
    this.initializeTable().subscribe();
  }

  check_view_element(element: any): boolean {
    if (this.expandedElement && this.expandedElement.id === element.id) {
      return true;
    } else {
      return false;
    }
  }

  view_hide_element(element: any): void {
    if (isSmallDeviceWidthForTable()) {
      if (this.expandedElement && this.expandedElement.id === element.id) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }
}
