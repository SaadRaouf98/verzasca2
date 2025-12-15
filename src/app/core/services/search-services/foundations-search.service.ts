import { Injectable } from '@angular/core';
import { FoundationsService } from '../backend-services/foundations.service';
import { Observable } from 'rxjs';
import { removeSpecialCharacters } from '@shared/helpers/helpers';

@Injectable({
  providedIn: 'root',
})
export class FoundationsSearchService {
  foundationsList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();

  constructor(private foundationsService: FoundationsService) {}

  searchOnFoundations(
    event?: { term: string; items: any[] },
    pageSize = 20
  ): void {
    let searchKeyword = undefined;

    if (event) {
      pageSize = 10;
      searchKeyword = event.term;
    }

    this.foundationsList$ = this.foundationsService.getFoundationsList(
      {
        pageSize,
        pageIndex: 0,
      },
      {
        parentId: null,
        searchKeyword: removeSpecialCharacters(searchKeyword || ''),
      },
      undefined,
      ['id', 'title', 'titleEn']
    );
  }
}
