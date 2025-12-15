import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentTypesService } from '../backend-services/document-types.service';
import { removeSpecialCharacters } from '@shared/helpers/helpers';

@Injectable({
  providedIn: 'root',
})
export class DocumentTypesSearchService {
  documentTypesList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();

  constructor(private documentTypesService: DocumentTypesService) {}

  searchOnDocumentTypes(
    event?: { term: string; items: any[] },
    pageSize = 20
  ): void {
    let searchKeyword = undefined;

    if (event) {
      pageSize = 10;
      searchKeyword = event.term;
    }

    this.documentTypesList$ = this.documentTypesService.getDocumentTypesList(
      {
        pageSize,
        pageIndex: 0,
      },
      {
        searchKeyword: removeSpecialCharacters(searchKeyword || ''),
      },
      undefined,
      ['id', 'title', 'titleEn']
    );
  }
}
