import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { Entity, AllEntities } from '@core/models/entity.model';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { isSmallDeviceWidthForPopup } from '@shared/helpers/helpers';

import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-referral-justifications-list',
  templateUrl: './referral-justifications-list.component.html',
  styleUrls: ['./referral-justifications-list.component.scss'],
})
export class ReferralJustificationsListComponent {
  referralJustificationsSource: MatTableDataSource<Entity> = new MatTableDataSource<Entity>([]);
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  isLoading: boolean = true;
  sortData: {
    sortBy: string;
    sortType: SortDirection;
  } = {
    sortBy: '',
    sortType: '',
  };
  lang: string = 'ar';
  PermissionsObj = PermissionsObj;
  canEdit: boolean = false;
  canDelete: boolean = false;

  constructor(
    private manageActionsService: ManageSystemSettingsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private langugaeService: LanguageService,
    private toastr: CustomToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initializeTable().subscribe();
    this.setPermissionProperties();
  }

  initializeTable(): Observable<AllEntities> {
    this.isLoading = true;
    return this.manageActionsService.referralJustificationsService
      .getReferralJustificationsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        undefined,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.referralJustificationsSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  onPaginationChange(pageInformation: any): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initializeTable().subscribe();
  }

  onSortChange(sortInformation: any): void {
    this.sortData = sortInformation;
    this.initializeTable().subscribe();
  }

  onViewElement(elementId: any): void {
    this.router.navigate([`${elementId}/edit`], {
      relativeTo: this.activatedRoute,
    });
  }

  onEditElement(elementId: any): void {
    this.router.navigate([`${elementId}/edit`], {
      relativeTo: this.activatedRoute,
    });
  }

  onDeleteElement(element: any): void {
    const lang = this.langugaeService.language;

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'ActionsModule.ReferralJustificationsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'ActionsModule.ReferralJustificationsListComponent.deleteReferralJustificationWarning'
        )}  '${lang === 'ar' ? element.title : element.titleEn}' ${this.translateService.instant(
          'shared.questionMark'
        )}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageActionsService.referralJustificationsService
            .deleteReferralJustification(element.id)
            .subscribe((res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.initializeTable().subscribe();
            });
        },
      },
    });
  }

  setPermissionProperties(): void {
    if (this.authService.userPermissions.includes(PermissionsObj.UpdateReferralJustification)) {
      this.canEdit = true;
    }

    if (this.authService.userPermissions.includes(PermissionsObj.DeleteReferralJustification)) {
      this.canDelete = true;
    }
  }
}
