import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AllFoundations, Foundation } from '@core/models/foundation.model';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Observable, debounceTime, map, tap } from 'rxjs';
import { Location } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-foundations-list',
  templateUrl: './foundations-list.component.html',
  styleUrls: ['./foundations-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class FoundationsListComponent {
  foundationsSource: MatTableDataSource<Foundation> = new MatTableDataSource<Foundation>([]);
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
  expandedElement!: Foundation | null;
  showFilteredTags: boolean = true;
  selectedFilters: any[] = [];
  lang: string = 'ar';
  parentId: string = '';
  parentName: string = '';
  PermissionsObj = PermissionsObj;
  searchKeywordControl = new FormControl();
  filtersData: {
    searchKeyword: string;
  } = {
    searchKeyword: '',
  };

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
      this.parentId = this.activatedRoute.snapshot.params['foundationId'];
      this.initializeTable().subscribe();
    });

    this.activatedRoute.queryParams.subscribe((queryParams) => {
      this.parentName = queryParams['parentName'];
    });
    this.detectUserSearching();
  }

  initializeTable(): Observable<AllFoundations> {
    this.isLoading = true;
    return this.manageActionsService.foundationsService
      .getFoundationsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        {
          parentId: this.parentId || null,
          searchKeyword: this.filtersData.searchKeyword,
        },
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.foundationsSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  detectUserSearching(): void {
    this.searchKeywordControl.valueChanges
      .pipe(
        debounceTime(250),
        map((value) => {
          this.filtersData.searchKeyword = value;
          this.initializeTable().subscribe();
        })
      )
      .subscribe();
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

  onDeleteElement(element: Foundation): void {
    const lang = this.langugaeService.language;

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'ActionsModule.FoundationsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'ActionsModule.FoundationsListComponent.deleteFoundationWarning'
        )}  '${lang === 'ar' ? element.title : element.titleEn}' ${this.translateService.instant(
          'shared.questionMark'
        )}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageActionsService.foundationsService
            .deleteFoundation(element.id)
            .subscribe((res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.initializeTable().subscribe();
            });
        },
      },
    });
  }

  goToChildren(element: Foundation) {
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

  onAddNewFoundation(): void {
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

  onAddNewInternalFoundation(element: Foundation): void {
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
    // window.history.go(-1);
  }

  view_hide_element(element: Foundation): void {
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

  check_view_element(element: Foundation): boolean {
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
      return [
        'title',
        'titleEn',
        'sector',
        'subSector',
        //'description',
        'actions',
      ];
    }
  }

  isSmallDeviceWidthForTable(): boolean {
    return isSmallDeviceWidthForTable();
  }
}
