import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { debounceTime, map, tap } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PageEvent } from '@angular/material/paginator';
import { TransactionAction } from '@core/models/transaction-action.model';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';

import { PermissionsObj } from '@core/constants/permissions.constant';
import { ActionType } from '@core/enums/action-type.enum';
import { actionTypes } from '@core/constants/action-types.constant';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-actions-list',
  templateUrl: './actions-list.component.html',
  styleUrls: ['./actions-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ActionsListComponent {
  actionsSource: MatTableDataSource<TransactionAction> = new MatTableDataSource<TransactionAction>(
    []
  );
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  pageEvent!: PageEvent;
  isLoading: boolean = true;
  sortData: {
    sortBy: string;
    sortType: SortDirection;
  } = {
    sortBy: '',
    sortType: '',
  };
  expandedElement!: TransactionAction | null;
  showFilteredTags: boolean = true;
  selectedFilters: any[] = [];
  lang: string = 'ar';
  actionTypes: {
    id: ActionType;
    name: string;
    nameAr: string;
    nameEn: string;
  }[] = [];
  PermissionsObj = PermissionsObj;
  ActionType = ActionType;
  searchKeywordControl = new FormControl();
  filtersData: {
    searchKeyword: string;
  } = {
    searchKeyword: '',
  };

  constructor(
    private dialog: MatDialog,
    private langugaeService: LanguageService,
    private manageActionsService: ManageSystemSettingsService,
    private router: Router,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private toastr: CustomToastrService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.actionTypes = actionTypes;
    if (this.lang === 'en') {
      this.actionTypes.map((ele) => (ele.name = ele.nameEn));
    }
    this.initalizeTable().subscribe();
    this.detectUserSearching();
  }

  initalizeTable() {
    this.isLoading = true;
    return this.manageActionsService.actionsService
      .getActionsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.actionsSource = new MatTableDataSource(res.data);
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
          this.initalizeTable().subscribe();
        })
      )
      .subscribe();
  }

  onSortColumn(sortInformation: { active: string; direction: SortDirection }): void {
    this.sortData = {
      sortBy: sortInformation.active,
      sortType: sortInformation.direction,
    };
    //
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

  onDeleteElement(element: TransactionAction): void {
    const lang = this.langugaeService.language;

    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'ActionsModule.ActionsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'ActionsModule.ActionsListComponent.deleteActionWarning'
        )}  '${lang === 'ar' ? element.title : element.titleEn}' ${this.translateService.instant(
          'shared.questionMark'
        )}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageActionsService.actionsService.deleteAction(element.id).subscribe({
            next: (res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.initalizeTable().subscribe();
            },
          });
        },
      },
    });
  }

  view_hide_element(element: TransactionAction): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: TransactionAction): boolean {
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
      return ['title', 'titleEn', 'description', 'descriptionEn', 'actionType', 'actions'];
    }
  }

  getActionName(actionType: ActionType): string {
    return this.actionTypes.find((ele) => ele.id === actionType)?.name || '';
  }
}
