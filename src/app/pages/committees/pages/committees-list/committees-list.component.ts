import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { Observable, of, tap } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PageEvent } from '@angular/material/paginator';

import { OrganizationUnit } from '@core/models/organization-unit.model';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { ManageCommitteesService } from '@pages/committees/services/manage-committees.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-committees-list',
  templateUrl: './committees-list.component.html',
  styleUrls: ['./committees-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CommitteesListComponent {
  committeesSource: MatTableDataSource<OrganizationUnit> = new MatTableDataSource<OrganizationUnit>(
    []
  );
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
  expandedElement!: OrganizationUnit | null;
  showFilteredTags: boolean = true;
  selectedFilters: any[] = [];
  lang: string = 'ar';

  constructor(
    private dialog: MatDialog,
    private langugaeService: LanguageService,
    private manageCommitteesService: ManageCommitteesService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initializeTable().subscribe();
  }

  initializeTable() {
    this.isLoading = true;

    return this.manageCommitteesService.organizationUnitsService
      .getOrganizationUnitsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        { type: OrganizationUnitType.Committee },
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.committeesSource = new MatTableDataSource(res.data);
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

  onDeleteElement(element: OrganizationUnit): void {
    const lang = this.langugaeService.language;

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        headerTranslationRef: this.translateService.instant(
          'CommitteesModule.CommitteesListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'CommitteesModule.CommitteesListComponent.deleteCommitteeWarning'
        )}  '${lang === 'ar' ? element.title : element.titleEn}' ${this.translateService.instant(
          'shared.questionMark'
        )}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageCommitteesService.organizationUnitsService
            .deleteOrganizationUnit(element.id)
            .subscribe({
              next: (res) => {
                this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
                this.initializeTable().subscribe();
              },
            });
        },
      },
    });
  }

  onViewMembers(elementId: string): void {
    this.router.navigate([elementId, 'members'], {
      relativeTo: this.activatedRoute,
    });
  }

  goToInternalDepartmentsAndDivisions(elementId: string): void {
    this.router.navigate([elementId, 'inner-divisions'], {
      relativeTo: this.activatedRoute,
    });
  }

  view_hide_element(element: OrganizationUnit): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    } else {
      this.goToInternalDepartmentsAndDivisions(element.id);
    }
  }

  check_view_element(element: OrganizationUnit): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }

  isSmallDeviceWidthForTable(): boolean {
    return isSmallDeviceWidthForTable();
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['title', 'actions'];
    } else {
      return ['title', 'titleEn', 'actions'];
    }
  }
}
