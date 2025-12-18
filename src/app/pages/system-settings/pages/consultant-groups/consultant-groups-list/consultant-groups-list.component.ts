import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { CustomToastrService } from '@core/services/custom-toastr.service';

import { Observable, tap } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { AllConsultantGroups, ConsultantGroup } from '@core/models/consultant-group.model';

@Component({
  selector: 'app-consultant-groups-list',
  templateUrl: './consultant-groups-list.component.html',
  styleUrls: ['./consultant-groups-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ConsultantGroupsListComponent {
  consultantGroupsSource: MatTableDataSource<ConsultantGroup> =
    new MatTableDataSource<ConsultantGroup>([]);
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
  expandedElement!: ConsultantGroup | null;

  lang: string = 'ar';
  PermissionsObj = PermissionsObj;

  constructor(
    private manageActionsService: ManageSystemSettingsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private langugaeService: LanguageService,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initalizeTable().subscribe();
  }

  initalizeTable(): Observable<AllConsultantGroups> {
    this.isLoading = true;
    return this.manageActionsService.consultantGroupsService
      .getConsultantGroupsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        undefined,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.consultantGroupsSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  onPaginationChange(pageInformation: any): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initalizeTable().subscribe();
  }

  onSortColumn(sortInformation: { active: string; direction: SortDirection }): void {
    this.sortData = {
      sortBy: sortInformation.active,
      sortType: sortInformation.direction,
    };
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

  onDeleteElement(element: ConsultantGroup): void {
    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: false,
      data: {
        headerTranslationRef: this.translateService.instant(
          'SystemSettingsModule.ConsultantGroupsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'SystemSettingsModule.ConsultantGroupsListComponent.deleteConsultantGroupWarning'
        )}  '${element.title}' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageActionsService.consultantGroupsService
            .deleteConsultantGroup(element.id)
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

  view_hide_element(element: ConsultantGroup): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: ConsultantGroup): boolean {
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
      return ['title', 'description', 'actions'];
    }
  }
}
