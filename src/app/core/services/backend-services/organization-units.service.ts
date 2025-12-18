import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { HttpHeaders } from '@angular/common/http';
import { SortDirection } from '@angular/material/sort';
import {
  AddOrganizationUnitCommand,
  AllOrganizationUnits,
  HisExcellencyDepartments,
  OganizationUnitMembers,
  OrganizationDepartmentLookUp,
  OrganizationUnit,
  UpdateOrganizationUnitCommand,
  UpdateOrganizationUnitUsersCommand,
} from '@core/models/organization-unit.model';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { AllSubOrganizationUnits } from '@core/models/sub-organization-unit.model';
import { buildUrlQueryPaginationSortSelectParams } from '@core/helpers/build-url-query-params';

@Injectable({
  providedIn: 'root',
})
export class OrganizationUnitsService {
  readonly apiUrl = '/api/v1/organizationunits';

  constructor(private apiService: ApiService) {}

  private buildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: {
      type: OrganizationUnitType;
      searchKeyword?: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[]
  ): string {
    let url = `${buildUrlQueryPaginationSortSelectParams(
      queryData,
      sortData,
      selectedProperties
    )}&type=${filtersData.type}`;
    if (filtersData?.searchKeyword) {
      url += `&Filter=[["title", "contains", "${filtersData.searchKeyword}"], "or", ["titleEn", "contains", "${filtersData.searchKeyword}"]]`;
    }

    return url;
  }
  getRegularReportsFolders() {
    return this.apiService.get('/api/v1/regularreports/folders');
  }
  getOrganizationUnitsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: {
      type: OrganizationUnitType;
      searchKeyword?: string;
    },
    sortData?: { sortBy: string; sortType: SortDirection },
    selectedProperties?: string[],
    skipLoader: boolean = false
  ): Observable<AllOrganizationUnits> {
    let url = `${this.apiUrl}?${this.buildUrlQueryParams(
      queryData,
      filtersData,
      sortData,
      selectedProperties
    )}`;

    if (skipLoader) {
      const headers = new HttpHeaders().set('X-Skip-Loader', 'true');
      return this.apiService.get(url, false, headers);
    }

    return this.apiService.get(url);
  }

  private subOrganizationsbuildUrlQueryParams(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: {},
    sortData?: { sortBy: string; sortType: SortDirection }
  ): string {
    const skip = queryData.pageSize * queryData.pageIndex;
    let url = `RequireTotalCount=true&Skip=${skip}&Take=${queryData.pageSize}`;

    if (sortData?.sortBy) {
      url += `&Sort=[${JSON.stringify({
        selector: sortData.sortBy,
        desc: sortData.sortType === 'desc' ? true : false,
      })}]`;
    }
    return url;
  }

  getSubOrganizationUnitsList(
    queryData: { pageSize: number; pageIndex: number },
    filtersData: { parentId: string },
    sortData?: { sortBy: string; sortType: SortDirection }
  ): Observable<AllSubOrganizationUnits> {
    let url = `${this.apiUrl}/${
      filtersData.parentId
    }/sub-organization-units?${this.subOrganizationsbuildUrlQueryParams(
      queryData,
      filtersData,
      sortData
    )}`;
    return this.apiService.get(url);
  }

  getOrganizationUnitById(id: string): Observable<OrganizationUnit> {
    let url = `${this.apiUrl}/${id}`;
    return this.apiService.get(url);
  }

  addOrganizationUnit(data: AddOrganizationUnitCommand): Observable<any> {
    return this.apiService.post(`${this.apiUrl}`, data);
  }

  updateOrganizationUnit(data: UpdateOrganizationUnitCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}`, data);
  }

  deleteOrganizationUnit(id: string): Observable<any> {
    return this.apiService.delete(`${this.apiUrl}/${id}`);
  }

  updateOrganizationUnitUsers(data: UpdateOrganizationUnitUsersCommand): Observable<any> {
    return this.apiService.put(`${this.apiUrl}/users`, data);
  }

  getOrganizationUnitUsers(organizationUnitId: string): Observable<OganizationUnitMembers> {
    return this.apiService.get(`${this.apiUrl}/${organizationUnitId}/users`);
  }

  getOrganizationDepartments(): Observable<OrganizationDepartmentLookUp[]> {
    return this.apiService.get(`${this.apiUrl}/secretariate-departments`);
  }

  getDepartmentsForMember(memberId: string): Observable<OrganizationDepartmentLookUp[]> {
    return this.apiService.get(`${this.apiUrl}/users/${memberId}/departments`);
  }

  updateMainDepartmentForMember(userId: string, departmentId: string): Observable<null> {
    return this.apiService.put(
      `${this.apiUrl}/users/${userId}/main-department/${departmentId}`,
      {}
    );
  }

  //////////////////////////// His excellency departments ////////////////////////////////

  getHisExcellencyDepartments(
    committeeId: string,
    memberId: string
  ): Observable<HisExcellencyDepartments[]> {
    return this.apiService.get(`${this.apiUrl}/${committeeId}/users/${memberId}`);
  }
}
