import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { NotificationPreference } from '@core/models/notification-preference.model';
import { LanguageService } from '@core/services/language.service';
import { NotificationPreferencesModalComponent } from '@pages/application-settings/components/notification-preferences-modal/notification-preferences-modal.component';
import { ManageApplicationSettingsService } from '@pages/application-settings/services/manage-application-settings.service';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import {
  isSmallDeviceWidthForPopup,
  isSmallDeviceWidthForTable,
} from '@shared/helpers/helpers';
import { debounceTime, map, tap } from 'rxjs';

@Component({
  selector: 'app-notification-users-preferences-list',
  templateUrl: './notification-users-preferences-list.component.html',
  styleUrls: ['./notification-users-preferences-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class NotificationUsersPreferencesListComponent {
  notificationsPreferncesSource: MatTableDataSource<NotificationPreference> =
    new MatTableDataSource<NotificationPreference>([]);
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
  expandedElement!: NotificationPreference | null;
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
    private manageApplicationSettingsService: ManageApplicationSettingsService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;

    this.initalizeTable().subscribe();
    this.detectUserSearching();
  }

  initalizeTable() {
    this.isLoading = true;
    return this.manageApplicationSettingsService.notificationPreferencesService
      .getNotificationsUsersPreferencesList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.notificationsPreferncesSource = new MatTableDataSource(res.data);
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
          this.pageIndex = 0;
          this.initalizeTable().subscribe();
        })
      )
      .subscribe();
  }
  onSortColumn(sortInformation: {
    active: string;
    direction: SortDirection;
  }): void {
    this.sortData = {
      sortBy: sortInformation.active,
      sortType: sortInformation.direction,
    };
    this.initalizeTable().subscribe();
  }

  onPaginationChange(pageInformation: {
    pageSize: number;
    pageIndex: number;
  }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initalizeTable().subscribe();
  }

  onOpenNotificationPreferenceModal(element: NotificationPreference): void {
    const dialogRef = this.dialog.open(NotificationPreferencesModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '800px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: false,
      data: {
        notificationPreferenceItem: element,
      },
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult && dialogResult.statusCode === ModalStatusCode.Success) {
        this.initalizeTable().subscribe();
      }
    });
  }

  view_hide_element(element: NotificationPreference): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: NotificationPreference): boolean {
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
      return [
        'name',
        'isSMSEnabled',
        'isEmailEnabled',
        'isRealtimeEnabled',
        'actions',
      ];
    }
  }
}
