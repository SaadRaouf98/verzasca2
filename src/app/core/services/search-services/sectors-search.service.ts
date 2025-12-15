import { Injectable } from '@angular/core';
import { AllEntities } from '@core/models/entity.model';
import { Observable } from 'rxjs';
import { SectorsService } from '../backend-services/sectors.service';
import { removeSpecialCharacters } from '@shared/helpers/helpers';

@Injectable({
  providedIn: 'root',
})
export class SectorsSearchService {
  sectorsList$: Observable<AllEntities> = new Observable();

  constructor(private sectorsService: SectorsService) {}

  searchOnSectors(event?: { term: string; items: any[] }, pageSize = 20): void {
    let searchKeyword = undefined;

    if (event) {
      pageSize = 10;
      searchKeyword = event.term;
    }

    this.sectorsList$ = this.sectorsService.getSectorsList(
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
