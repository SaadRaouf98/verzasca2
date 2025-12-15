import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { debounceTime, map, tap } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PageEvent } from '@angular/material/paginator';

import { Role } from '@core/models/role.model';
import { ManagePermissionsSettingsService } from '@pages/permissions-settings/services/manage-permissions-settings.service';
import { FormControl } from '@angular/forms';
import { PermissionsObj } from '@core/constants/permissions.constant';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RolesListComponent {
  rolesSource: MatTableDataSource<Role> = new MatTableDataSource<Role>([]);
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  pageEvent!: PageEvent;
  displayedColumns: string[] = [];
  isLoading: boolean = true;
  sortData: {
    sortBy: string;
    sortType: SortDirection;
  } = {
    sortBy: '',
    sortType: '',
  };
  expandedElement!: Role | null;
  showFilteredTags: boolean = true;
  selectedFilters: any[] = [];
  lang: string = 'ar';
  searchKeywordControl = new FormControl();
  filtersData: {
    searchKeyword: string;
  } = {
    searchKeyword: '',
  };

  PermissionsObj = PermissionsObj;

  constructor(
    private dialog: MatDialog,
    private langugaeService: LanguageService,
    private managePermissionsSettingsService: ManagePermissionsSettingsService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initalizeTable().subscribe();
    this.detectUserSearching();
  }

  initalizeTable() {
    this.isLoading = true;
    return this.managePermissionsSettingsService.rolesService
      .getRolesList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        { searchKeyword: this.filtersData.searchKeyword },
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.rolesSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  detectUserSearching(): void {
    this.searchKeywordControl.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          this.filtersData.searchKeyword = value;
          this.initalizeTable().subscribe();
        })
      )
      .subscribe();
  }

  onSortColumn(sortInformation: { active: string; direction: SortDirection }): void {
    this.sortData = {
      sortBy: sortInformation.active,
      sortType: sortInformation.direction,
    };
    this.initalizeTable().subscribe();
  }

  onPaginationChange(pageInformation: { pageSize: number; pageIndex: number }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initalizeTable().subscribe();
  }

  syncRoles(): void {
    this.managePermissionsSettingsService.rolesService.asyncRoles({}).subscribe((res) => {
      this.toastr.success(
        this.translateService.instant(
          'PermissionsSettingsModule.RolesListComponent.syncRolesSuccessfully'
        )
      );
      this.initalizeTable().subscribe();
    });
  }

  onManageElementRoles(elementId: string): void {
    this.router.navigate([`${elementId}`], {
      relativeTo: this.activatedRoute,
    });
  }

  view_hide_element(element: Role): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: Role): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['name', 'actions'];
    } else {
      return ['name', 'permissionsCount', 'actions'];
    }
  }
}
