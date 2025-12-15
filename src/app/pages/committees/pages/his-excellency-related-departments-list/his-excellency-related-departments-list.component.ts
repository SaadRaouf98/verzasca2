import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { tap } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PageEvent } from '@angular/material/paginator';

import { Location } from '@angular/common';
import { ManageCommitteesService } from '@pages/committees/services/manage-committees.service';
import { HisExcellencyDepartments } from '@core/models/organization-unit.model';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
import { AddRelatedDepartmentComponent } from '@pages/committees/components/add-related-department/add-related-department.component';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { FormMode } from '@shared/enums/form-mode.enum';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-his-excellency-related-departments-list',
  templateUrl: './his-excellency-related-departments-list.component.html',
  styleUrls: ['./his-excellency-related-departments-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HisExcellencyRelatedDepartmentsListComponent {
  hisExcellencyDepartmentsSource: MatTableDataSource<HisExcellencyDepartments> =
    new MatTableDataSource<HisExcellencyDepartments>([]);
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
  expandedElement!: HisExcellencyDepartments | null;
  showFilteredTags: boolean = true;
  selectedFilters: any[] = [];
  lang: string = 'ar';
  memberId: string = '';
  memberName: string = '';
  committeeId: string = '';

  PermissionsObj = PermissionsObj;

  constructor(
    private dialog: MatDialog,
    private langugaeService: LanguageService,
    private manageCommitteesService: ManageCommitteesService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.committeeId = this.activatedRoute.snapshot.params['id'];
    this.memberId = this.activatedRoute.snapshot.params['memberId'];
    this.memberName = this.activatedRoute.snapshot.queryParams['memberName'];

    this.initalizeTable().subscribe();
  }

  initalizeTable() {
    this.isLoading = true;

    return this.manageCommitteesService.organizationUnitsService
      .getHisExcellencyDepartments(this.committeeId, this.memberId)
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.hisExcellencyDepartmentsSource = new MatTableDataSource(res);
          this.length = res.length;
        })
      );
  }

  onViewEmployees(elementId: string): void {
    this.router.navigate([
      `system-management/secretarial-structure/secretarials/${elementId}/employees`,
    ]);
  }

  onViewElement(element: HisExcellencyDepartments): void {
    const { id, title, titleEn, description, descriptionEn } = element;

    this.dialog.open(AddRelatedDepartmentComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: {
        formMode: FormMode.View,
        header: this.translateService.instant(
          'CommitteesModule.HisExcellencyRelatedDepartmentsListComponent.viewDepartment'
        ),
        employee: { id: this.memberId, name: this.memberName },
        parentId: this.committeeId,
        form: {
          id,
          title,
          titleEn,
          description,
          descriptionEn,
        },
      },
    });
  }

  onCreateElement(): void {
    const dialogRef = this.dialog.open(AddRelatedDepartmentComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: {
        formMode: FormMode.Modify,
        header: this.translateService.instant('shared.addDepartment'),
        employee: { id: this.memberId, name: this.memberName },
        parentId: this.committeeId,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((dialogResult: { statusCode: ModalStatusCode; status: string }) => {
        if (dialogResult.statusCode === ModalStatusCode.Success) {
          this.initalizeTable().subscribe();
        }
      });
  }

  onEditElement(element: HisExcellencyDepartments): void {
    const { id, title, titleEn, description, descriptionEn } = element;

    const dialogRef = this.dialog.open(AddRelatedDepartmentComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '1000px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: {
        formMode: FormMode.Modify,
        header: this.translateService.instant(
          'CommitteesModule.HisExcellencyRelatedDepartmentsListComponent.editDepartment'
        ),
        employee: { id: this.memberId, name: this.memberName },
        parentId: this.committeeId,
        form: {
          id,
          title,
          titleEn,
          description,
          descriptionEn,
        },
      },
    });

    dialogRef
      .afterClosed()
      .subscribe((dialogResult: { statusCode: ModalStatusCode; status: string }) => {
        if (dialogResult.statusCode === ModalStatusCode.Success) {
          this.initalizeTable().subscribe();
        }
      });
  }

  onDeleteElement(element: HisExcellencyDepartments): void {
    const lang = this.langugaeService.language;

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'CommitteesModule.HisExcellencyRelatedDepartmentsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'CommitteesModule.HisExcellencyRelatedDepartmentsListComponent.deleteWarning'
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
                this.initalizeTable().subscribe();
              },
            });
        },
      },
    });
  }

  goToLastPage(): void {
    this.location.back();
  }

  view_hide_element(element: HisExcellencyDepartments): void {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      this.expandedElement = null;
    } else {
      this.expandedElement = element;
    }
  }

  check_view_element(element: HisExcellencyDepartments): boolean {
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
