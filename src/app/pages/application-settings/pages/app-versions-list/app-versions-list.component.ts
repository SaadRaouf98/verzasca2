import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {Component, Injector, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {isSmallDeviceWidthForTable} from '@shared/helpers/helpers';
import {AbstractTable} from '@core/abstract-classes/abstract-table.abstract';
import {AllIOSVersions, IOSVersion} from '@core/models/IOS-version.model';
import {
  ManageApplicationSettingsService
} from '@pages/application-settings/services/manage-application-settings.service';
import {PermissionsObj} from '@core/constants/permissions.constant';
import {Router} from '@angular/router';
import {Observable, debounceTime, map, tap} from 'rxjs';
import {FormControl} from '@angular/forms';
import {Apps} from "@shared/enums/apps.enum";

@Component({
  selector: 'app-versions-list',
  templateUrl: './app-versions-list.component.html',
  styleUrls: ['./app-versions-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class AppVersionsListComponent extends AbstractTable implements OnInit {
  versionsSource: MatTableDataSource<IOSVersion> =
    new MatTableDataSource<IOSVersion>([]);
  override expandedElement!: IOSVersion | null;

  PermissionsObj = PermissionsObj;
  searchKeywordControl = new FormControl();
  filtersData: {
    searchKeyword: string;
  } = {
    searchKeyword: '',
  };

  constructor(
    private manageApplicationSettingsService: ManageApplicationSettingsService,
    private router: Router,
    injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.initializeTable().subscribe();
    this.detectUserSearching();
  }

  initializeTable(): Observable<AllIOSVersions> {
    this.isLoading = true;

    return this.manageApplicationSettingsService.IosVersionsService.getIOSVersionsList(
      {pageIndex: this.pageIndex, pageSize: this.pageSize},
      this.filtersData,
      this.sortData
    ).pipe(
      tap((res) => {
        this.isLoading = false;
        this.versionsSource = new MatTableDataSource(res.data);
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
          this.initializeTable().subscribe();
        })
      )
      .subscribe();
  }

  onNavToAddVersionPage(): void {
    this.router.navigateByUrl('../app-add-version');
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['version', 'actions'];
    } else {
      return ['version', 'link', 'app', 'isForceUpdate'];
    }
  }

  protected readonly Apps = Apps;
}
