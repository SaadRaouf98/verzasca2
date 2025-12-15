import { Injectable } from '@angular/core';
import { AllRoles } from '@core/models/role.model';
import { Observable } from 'rxjs';
import { RolesService } from '../backend-services/roles.service';

@Injectable({
  providedIn: 'root',
})
export class RolesSearchService {
  _rolesList$: Observable<AllRoles> = new Observable();

  constructor(private rolesService: RolesService) {}

  searchOnRoles(event?: { term: string; items: any[] }): void {
    let pageSize = 20;
    let searchKeyword = undefined;

    if (event) {
      pageSize = 10;
      searchKeyword = event.term;
    }

    this._rolesList$ = this.rolesService.getRolesList(
      {
        pageSize: 10,
        pageIndex: 0,
      },
      {
        searchKeyword,
      }
    );
  }

  set rolesList$(x: Observable<AllRoles>) {
    this._rolesList$ = x;
  }

  get rolesList$(): Observable<AllRoles> {
    return this._rolesList$;
  }
}
