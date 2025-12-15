import { switchMap, tap } from 'rxjs';
import { AbstractTable } from './abstract-table.abstract';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QueryUrlFiltersPaginationSort {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  initializeFiltersObservable(compnent: AbstractTable) {
    const observ = this.activatedRoute.queryParamMap
      .pipe(
        tap((queryParamsMap: any) => {
          //set table metadata from query params
          compnent.queryParamsMap = queryParamsMap;

          let queryParamPageIndex = parseInt(queryParamsMap.params.pageIndex);
          let queryParamPageSize = parseInt(queryParamsMap.params.pageSize);
          compnent.pageIndex =
            queryParamPageIndex > 0 ? queryParamPageIndex : 0;
          compnent.pageSize = queryParamPageSize > 0 ? queryParamPageSize : 20;
          if (
            compnent.pageIndex != queryParamsMap.params.pageIndex ||
            compnent.pageSize != queryParamsMap.params.pageSize
          ) {
            this.validateURL(compnent);
          }
          //set filtersData class property from query params
          compnent.setFiltersFromUrl!(queryParamsMap.params);
          //set sortdata from query params
          this.setSortDataFromUrl(compnent, queryParamsMap.params);
        }),
        switchMap(() => compnent.initializeTable())
      )
      .subscribe();
    return observ;
  }

  setSortDataFromUrl(compnent: AbstractTable, queryParams: any): void {
    compnent.sortData = { sortBy: '', sortType: '' };
    if (queryParams.sortBy) {
      compnent.sortData.sortBy = queryParams.sortBy;
    }
    if (queryParams.sortType) {
      compnent.sortData.sortType = queryParams.sortType;
    }
  }

  validateURL(compnent: AbstractTable, response?: any): void {
    let pageSize, pageIndex, count;
    if (!response) {
      pageSize = compnent.pageSize;
      pageIndex = compnent.pageIndex;
    } else if (response && compnent.pageIndex > response.metaData.pageMax) {
      pageSize = compnent.pageSize;
      pageIndex = response.metaData.pageMax;

      // count = response.metaData.count;
    } else return;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        ...compnent.queryParamsMap.params,
        pageSize,
        pageIndex,
      },
      replaceUrl: true,
    });
  }

  updateUrlQueryParams(filtersData: any, queryParams: any[]): void {
       let newQueryParams = {};
    if (queryParams.length) {
      const currentQueryParams = this.getCurrentQueryParams();
      newQueryParams = { ...currentQueryParams };
      queryParams.forEach((element) => {
        
        if (!element.delete) {
          //create if query param doesnot exist,otherwise updates it
          //@ts-ignore
          newQueryParams[element.propertyName] = element.propertyValue;
        } else if (
          newQueryParams.hasOwnProperty(element.propertyName) &&
          element.delete
        ) {
          //delete query param
          //@ts-ignore
          delete newQueryParams[element.propertyName];
        }
      });

    } else {
      newQueryParams = {};
      if (filtersData.searchKeyword) {
        //@ts-ignore
        newQueryParams['searchKeyword'] = filtersData.searchKeyword;
        queryParams.push({
          propertyName: 'searchKeyword',
          propertyValue: filtersData.searchKeyword,
        });
      }
    }
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: newQueryParams,

      replaceUrl: true,
    });
  }

  getCurrentQueryParams() {
    return (this.activatedRoute.snapshot.queryParamMap as any).params;
  }
}

