import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { User } from '@core/models/user.model';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageUsersService } from '@pages/users/services/manage-users.service';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { debounceTime, map, tap } from 'rxjs';
import { RegularReport } from '@core/models/regular-report.model';
import { ReportLogsDialogComponent } from '@pages/regular-reports/components/report-logs-dialog/report-logs-dialog.component';
import { UserLogsDialogComponent } from '@pages/users/components/user-logs-dialog/user-logs-dialog.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class UsersListComponent {
  usersSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);
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
  expandedElement!: User | null;
  searchKeywordControl = new FormControl();
  filtersData: {
    searchKeyword: string;
  } = {
    searchKeyword: '',
  };
  lang: string = 'ar';
  PermissionsObj = PermissionsObj;

  constructor(
    private dialog: MatDialog,
    private langugaeService: LanguageService,
    private manageUsersService: ManageUsersService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;

    this.initalizeTable().subscribe();
    this.detectUserSearching();
  }

  initalizeTable() {
    this.isLoading = true;
    return this.manageUsersService.usersService
      .getUsersList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.usersSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  detectUserSearching(): void {
    this.searchKeywordControl.valueChanges
      .pipe(
        debounceTime(300),
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
    //
    this.initalizeTable().subscribe();
  }

  onPaginationChange(pageInformation: { pageSize: number; pageIndex: number }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initalizeTable().subscribe();
  }

  onSyncUsers(): void {
    this.manageUsersService.usersService.syncUsers().subscribe((res) => {
      this.toastr.success(
        this.translateService.instant('UsersModule.UsersListComponent.syncUsersSuccessfully')
      );
      this.initalizeTable().subscribe();
    });
  }

  onSyncAttendance(): void {
    this.manageUsersService.timeAttendancesService.syncAttendance().subscribe((res) => {
      this.toastr.success(
        this.translateService.instant('UsersModule.UsersListComponent.syncAttendanceSuccessfully')
      );
    });
  }

  onFilters() {
    /* const tempArray = JSON.parse(JSON.stringify(this.selectedFilters));
    let position =
      this.langugaeService.language === 'ar' ? { right: '0' } : { left: '0' };

    const dialogRef = this.dialog.open(
      ModalPendingTransactionsFiltersComponent,
      {
        //width: '390px',
        minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '300px',
        // maxWidth: '400px',
        minHeight: '100vh',
        autoFocus: false,
        disableClose: false,
        position,
        data: {
          selectedFilters: this.selectedFilters.length > 0 ? tempArray : null,
        },
      }
    );

    dialogRef
      .afterClosed()
      .subscribe((dialogResult: { statusCode: ModalStatusCode }) => {
        if (
          dialogResult &&
          dialogResult.statusCode === ModalStatusCode.Success
        ) {
        }
      }); */
  }

  onViewPermissions(elementId: string): void {
    this.router.navigate([`${elementId}`], {
      relativeTo: this.activatedRoute,
    });
  }
  openReportDialog(document: RegularReport) {
    this.matDialog.open(UserLogsDialogComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '85vw',
      minHeight: '55vh',
      maxHeight: '95vh',
      panelClass: ['action-modal', 'float-footer'],
      autoFocus: false,
      disableClose: false,
      data: {
        id: document.id,
      },
    });
  }
  onUpdateUserMainDepartment(elementId: string): void {
    this.router.navigate([`${elementId}/update-main-section`], {
      relativeTo: this.activatedRoute,
    });
  }

  view_hide_element(element: User): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: User): boolean {
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
      return ['name', 'email', 'phoneNumber', 'main-department', 'actions'];
    }
  }
}
