import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { tap } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PageEvent } from '@angular/material/paginator';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';

import { PermissionsObj } from '@core/constants/permissions.constant';
import { CommitteeSequence } from '@core/models/committee-sequence.model';
import { CommitteeSequenceFormat } from '@core/enums/committee-sequence-format.enum';

@Component({
  selector: 'app-committee-sequences-list',
  templateUrl: './committee-sequences-list.component.html',
  styleUrls: ['./committee-sequences-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CommitteeSequencesListComponent {
  committeeSequencesSource: MatTableDataSource<CommitteeSequence> =
    new MatTableDataSource<CommitteeSequence>([]);
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
  expandedElement!: CommitteeSequence | null;
  selectedFilters: any[] = [];
  lang: string = 'ar';
  CommitteeSequenceFormat = CommitteeSequenceFormat;
  PermissionsObj = PermissionsObj;

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
    this.initializeTable().subscribe();
  }

  initializeTable() {
    this.isLoading = true;
    return this.manageActionsService.committeeSequencesService
      .getCommitteeSequencesList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        undefined,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.committeeSequencesSource = new MatTableDataSource(res.data);
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

  onResetElement(element: CommitteeSequence): void {
    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'SystemSettingsModule.CommitteeSequencesListComponent.confirmResetting'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'SystemSettingsModule.CommitteeSequencesListComponent.resetSequenceWarning'
        )}  '${element.title}' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant(
          'SystemSettingsModule.CommitteeSequencesListComponent.yesReset'
        ),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageActionsService.committeeSequencesService
            .resetCommitteeSequence(element.id)
            .subscribe({
              next: (res) => {
                this.toastr.success(
                  this.translateService.instant(
                    'SystemSettingsModule.CommitteeSequencesListComponent.resetSuccessfully'
                  )
                );
                this.initializeTable().subscribe();
              },
            });
        },
      },
    });
  }

  onDeleteElement(element: CommitteeSequence): void {
    this.dialog.open(ConfirmationModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '600px',
      autoFocus: false,
      disableClose: true,
      data: {
        headerTranslationRef: this.translateService.instant(
          'SystemSettingsModule.CommitteeSequencesListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'SystemSettingsModule.CommitteeSequencesListComponent.deleteSequenceWarning'
        )}  '${element.title}' ${this.translateService.instant('shared.questionMark')}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageActionsService.committeeSequencesService
            .deleteCommitteeSequence(element.id)
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

  view_hide_element(element: CommitteeSequence): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: CommitteeSequence): boolean {
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
      return ['title', 'lastResetDate', 'sequenceFormat', 'actions'];
    }
  }
}
