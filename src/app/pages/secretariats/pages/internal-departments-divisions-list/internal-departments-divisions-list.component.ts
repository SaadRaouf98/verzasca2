import { Component, OnInit } from '@angular/core';
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

import { SubOrganizationUnit } from '@core/models/sub-organization-unit.model';
import { Location } from '@angular/common';
import { ManageSecretarialsService } from '@pages/secretariats/services/manage-secretariats.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-internal-departments-divisions-list',
  templateUrl: './internal-departments-divisions-list.component.html',
  styleUrls: ['./internal-departments-divisions-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class InternalDepartmentsDivisionsListComponent {
  internalDepartmentsSource: MatTableDataSource<SubOrganizationUnit> =
    new MatTableDataSource<SubOrganizationUnit>([]);
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
  expandedElement!: SubOrganizationUnit | null;
  showFilteredTags: boolean = true;
  selectedFilters: any[] = [];
  lang: string = 'ar';
  parentId: string = '';

  constructor(
    private dialog: MatDialog,
    private langugaeService: LanguageService,
    private manageSecretarialsService: ManageSecretarialsService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.activatedRoute.params.subscribe((params) => {
      this.parentId = this.activatedRoute.snapshot.params['departmentId'];
      this.initalizeTable().subscribe();
    });
  }

  initalizeTable() {
    this.isLoading = true;

    return this.manageSecretarialsService.organizationUnitsService
      .getSubOrganizationUnitsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        { parentId: this.parentId },
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.internalDepartmentsSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
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

  onViewEmployees(elementId: string): void {
    this.router.navigateByUrl(
      `/system-management/secretarial-structure/secretarials/${elementId}/employees`
    );
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

  onDeleteElement(element: SubOrganizationUnit): void {
    const lang = this.langugaeService.language;

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        headerTranslationRef: this.translateService.instant(
          'shared.confirmInternalDepartmentDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant('shared.deleteInternalDepartmentWarning')}  '${
          lang === 'ar' ? element.title : element.titleEn
        }' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageSecretarialsService.organizationUnitsService
            .deleteOrganizationUnit(element.id)
            .subscribe({
              next: (res) => {
                this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
                this.initalizeTable().subscribe();
              },
            });
        },
      },
    });
  }

  goToChildren(element: SubOrganizationUnit) {
    if (!element.hasChildren) {
      return;
    }
    this.router.navigateByUrl(this.router.url.replace(this.parentId, element.id));
  }

  onAddNewInternalDivision(elementId: string): void {
    this.router.navigateByUrl(`${this.router.url.replace(this.parentId, elementId)}/add`);
  }

  goToLastPage(): void {
    this.location.back();
  }

  view_hide_element(element: SubOrganizationUnit): void {
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

  check_view_element(element: SubOrganizationUnit): boolean {
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
      return ['parentName', 'title', 'description', 'actions'];
    }
  }

  isSmallDeviceWidthForTable(): boolean {
    return isSmallDeviceWidthForTable();
  }
}
