import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { OrganizationUnit } from '@core/models/organization-unit.model';
import { SubOrganizationUnit } from '@core/models/sub-organization-unit.model';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageSecretarialsService } from '@pages/secretariats/services/manage-secretariats.service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';

import { tap } from 'rxjs';

@Component({
  selector: 'app-departments-list',
  templateUrl: './departments-list.component.html',
  styleUrls: ['./departments-list.component.scss'],
})
export class DepartmentsListComponent implements OnInit {
  lang: string = 'ar';
  departments: SubOrganizationUnit[] = [];
  isLoading: boolean = true;

  //for pagination
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  pageEvent!: PageEvent;
  parentId: string = '';

  constructor(
    private langugaeService: LanguageService,
    private manageSecretarialsService: ManageSecretarialsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.parentId = this.activatedRoute.snapshot.params['secretarialId'];

    this.initializeCards().subscribe();
  }

  initializeCards() {
    this.isLoading = true;
    return this.manageSecretarialsService.organizationUnitsService
      .getSubOrganizationUnitsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        { parentId: this.parentId }
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.departments = res.data;
          this.length = res.totalCount;
        })
      );
  }

  onPaginationChange(pageInformation: { pageSize: number; pageIndex: number }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initializeCards().subscribe();
  }

  onViewEmployees(elementId: string): void {
    this.router.navigate(['../../', elementId, 'employees'], {
      relativeTo: this.activatedRoute,
    });
  }

  onViewElement(elementId: string): void {
    this.router.navigate([`${elementId}/inner-divisions`], {
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
          'SecretarialModule.DepartmentsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'SecretarialModule.DepartmentsListComponent.deleteDepartmentWarning'
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
                this.initializeCards().subscribe();
              },
            });
        },
      },
    });
  }
}
