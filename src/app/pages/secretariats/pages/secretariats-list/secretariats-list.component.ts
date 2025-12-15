import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { Observable, of, tap } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PageEvent } from '@angular/material/paginator';

import { OrganizationUnit } from '@core/models/organization-unit.model';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { ManageSecretarialsService } from '@pages/secretariats/services/manage-secretariats.service';
@Component({
  selector: 'app-secretariats-list',
  templateUrl: './secretariats-list.component.html',
  styleUrls: ['./secretariats-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SecretariatsListComponent {
  secretarialsSource: MatTableDataSource<OrganizationUnit> =
    new MatTableDataSource<OrganizationUnit>([]);
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
    private manageSecretarialsService: ManageSecretarialsService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initalizeTable().subscribe();
  }

  initalizeTable() {
    this.isLoading = true;
    //TODO remove next lines

    //@ts-ignore
    /*     this.secretarialsSource = new MatTableDataSource([
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        title: 'static title 1',
        titleEn: 'static title EN 1',
        description: 'static description',
        descriptionEn: 'static description EN',
        organizationStructure: 'string',
        parentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        parent: 'string',
        departmentAdminId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        departmentAdmin: 'string',
        isParentTheSecretary: true,
        secretaryName: 'سعادة الامين 1',
      },
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        title: 'static title 2',
        titleEn: 'static title EN 2',
        description: 'static description',
        descriptionEn: 'static description EN',
        organizationStructure: 'string',
        parentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        parent: 'string',
        departmentAdminId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        departmentAdmin: 'string',
        isParentTheSecretary: true,
        secretaryName: 'سعادة الامين 2',
      },
      {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        title: 'static title 3',
        titleEn: 'static title EN 3',
        description: 'static description',
        descriptionEn: 'static description EN',
        organizationStructure: 'string',
        parentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        parent: 'string',
        departmentAdminId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        departmentAdmin: 'string',
        isParentTheSecretary: true,
        secretaryName: 'سعادة الامين 3',
      },
    ]);
    this.length = 3; */

    return this.manageSecretarialsService.organizationUnitsService
      .getOrganizationUnitsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        { type: OrganizationUnitType.Secretariate },
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.secretarialsSource = new MatTableDataSource(res.data);
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
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'SecretarialModule.SecretarialsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'SecretarialModule.SecretarialsListComponent.deleteSecretarialWarning'
        )}  '${lang === 'ar' ? element.title : element.titleEn}' ${this.translateService.instant(
          'shared.questionMark'
        )}`,
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

  goToDepartments(elementId: string) {
    this.router.navigate([elementId, 'departments'], {
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
      this.goToDepartments(element.id);
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
      return ['title', 'titleEn', 'admin', 'actions'];
    }
  }
}
