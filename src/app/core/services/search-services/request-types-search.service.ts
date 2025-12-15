import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestTypesService } from '../backend-services/request-types.service';
import { removeSpecialCharacters } from '@shared/helpers/helpers';

@Injectable({
  providedIn: 'root',
})
export class RequestTypesSearchService {
  requestTypesList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();

  constructor(private requestTypesService: RequestTypesService) {}

  searchOnRequestTypes(
    event?: { term: string; items: any[] },
    pageSize = 20
  ): void {
    let searchKeyword = undefined;

    if (event) {
      pageSize = 10;
      searchKeyword = event.term;
    }

    this.requestTypesList$ = this.requestTypesService.getRequestTypesList(
      {
        pageSize,
        pageIndex: 0,
      },
      {
        searchKeyword: removeSpecialCharacters(searchKeyword || ''),
        isTransaction: true,
      },
      undefined,
      ['id', 'title', 'titleEn']
    );
  }
}
