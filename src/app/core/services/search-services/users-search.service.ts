import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersService } from '../backend-services/users.service';
import { removeSpecialCharacters } from '@shared/helpers/helpers';

export interface Users {
  data: {
    id: string;
    name: string;
  }[];
  totalCount: number;
  groupCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsersSearchService {
  private _usersList$: Observable<Users> = new Observable();

  constructor(private usersService: UsersService) {}

  searchOnUsers(event?: { term: string; items: any[] }): void {
    let pageSize = 20;
    let searchKeyword = undefined;

    if (event) {
      pageSize = 10;
      searchKeyword = event.term;
    }

    this._usersList$ = this.usersService.getUsersList(
      {
        pageSize,
        pageIndex: 0,
      },
      {
        searchKeyword: removeSpecialCharacters(searchKeyword || ''),
      },
      undefined,
      ['id', 'name']
    );
  }

  set usersList$(x: Observable<Users>) {
    this._usersList$ = x;
  }

  get usersList$(): Observable<Users> {
    return this._usersList$;
  }
}
