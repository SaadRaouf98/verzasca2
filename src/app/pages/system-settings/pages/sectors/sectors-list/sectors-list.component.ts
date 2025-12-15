import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AllSectors, Sector } from '@core/models/sector.model';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Observable, tap } from 'rxjs';
import { Location } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PermissionsObj } from '@core/constants/permissions.constant';

@Component({
  selector: 'app-sectors-list',
  templateUrl: './sectors-list.component.html',
  styleUrls: ['./sectors-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SectorsListComponent implements OnInit {
  sectorsSource: MatTableDataSource<Sector> = new MatTableDataSource<Sector>([]);
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
  expandedElement!: Sector | null;
  showFilteredTags: boolean = true;
  selectedFilters: any[] = [];
  lang: string = 'ar';
  parentId: string = '';
  parentName: string = '';
  PermissionsObj = PermissionsObj;

  constructor(
    private manageActionsService: ManageSystemSettingsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private langugaeService: LanguageService,
    private toastr: CustomToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.activatedRoute.params.subscribe((params) => {
      this.parentId = this.activatedRoute.snapshot.params['sectorId'];
      this.initializeTable().subscribe();
    });
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.parentName = queryParams['parentName'];
    });
  }

  initializeTable(): Observable<AllSectors> {
    this.isLoading = true;
    return this.manageActionsService.sectorsService
      .getSectorsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        { parentId: this.parentId || null },
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.sectorsSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  onSortColumn(sortInformation: { active: string; direction: SortDirection }): void {
    this.sortData = {
      sortBy: sortInformation.active,
      sortType: sortInformation.direction,
    };
    this.initializeTable().subscribe();
  }

  onPaginationChange(pageInformation: { pageSize: number; pageIndex: number }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initializeTable().subscribe();
  }

  onViewElement(elementId: string): void {
    this.router.navigate([`${elementId}/edit`], {
      relativeTo: this.activatedRoute,
    });
  }

  onEditElement(elementId: string): void {
    this.router.navigate([`${elementId}/edit`], {
      relativeTo: this.activatedRoute,
    });
  }

  onDeleteElement(element: Sector): void {
    const lang = this.langugaeService.language;

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'ActionsModule.SectorsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'ActionsModule.SectorsListComponent.deleteSectorWarning'
        )}  '${lang === 'ar' ? element.title : element.titleEn}' ${this.translateService.instant(
          'shared.questionMark'
        )}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageActionsService.sectorsService.deleteSector(element.id).subscribe((res) => {
            this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
            this.initializeTable().subscribe();
          });
        },
      },
    });
  }

  goToChildren(element: Sector) {
    if (!element.hasChildren) {
      return;
    }
    const parentName = this.lang === 'ar' ? element.title : element.titleEn;
    if (this.parentId) {
      this.router.navigate([`../${element.id}`], {
        relativeTo: this.activatedRoute,
        queryParams: {
          parentName,
        },
        replaceUrl: true,
      });
    } else {
      this.router.navigate([`${element.id}`], {
        relativeTo: this.activatedRoute,
        queryParams: {
          parentName,
        },
        replaceUrl: true,
      });
    }
  }

  onAddNewSector(): void {
    if (this.parentId) {
      this.router.navigate([`../${this.parentId}/add`], {
        relativeTo: this.activatedRoute,
        queryParams: {
          parentName: this.parentName,
        },
      });
    } else {
      this.router.navigate(['./add'], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  onAddNewInternalSector(element: Sector): void {
    const parentName = this.lang === 'ar' ? element.title : element.titleEn;
    if (this.parentId) {
      this.router.navigate([`../${element.id}/add`], {
        relativeTo: this.activatedRoute,
        queryParams: {
          parentName,
        },
      });
    } else {
      this.router.navigate([`${element.id}/add`], {
        relativeTo: this.activatedRoute,
        queryParams: {
          parentName,
        },
      });
    }
  }

  goToLastPage(): void {
    this.location.back();
  }

  view_hide_element(element: Sector): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    } else {
      this.goToChildren(element);
    }
  }

  check_view_element(element: Sector): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['title', 'actions'];
    } else {
      return ['icon', 'title', 'titleEn', 'description', 'descriptionEn', 'actions'];
    }
  }

  isSmallDeviceWidthForTable(): boolean {
    return isSmallDeviceWidthForTable();
  }
}
