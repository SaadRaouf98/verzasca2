import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AllEntities } from '@core/models/entity.model';
import { LanguageService } from '@core/services/language.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';
import { TranslateService } from '@ngx-translate/core';
import { ManageSystemSettingsService } from '@pages/system-settings/services/manage-system-settings.service';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';

import { debounceTime, map, Observable, tap } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { Schema } from '@core/models/schema.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-workflow-treatments-list',
  templateUrl: './workflow-treatments-list.component.html',
  styleUrls: ['./workflow-treatments-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class WorkflowTreatmentsListComponent {
  workflowTreatmentsSource: MatTableDataSource<Schema> = new MatTableDataSource<Schema>([]);
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
  expandedElement!: Schema | null;
  searchKeywordControl = new FormControl();
  filtersData: {
    searchKeyword: string;
  } = {
    searchKeyword: '',
  };

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
    this.detectUserSearching();
  }

  initalizeTable(): Observable<AllEntities> {
    this.isLoading = true;
    return this.manageActionsService.schemasService
      .getSchemasList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .pipe(
        tap((res: any) => {
          this.isLoading = false;
          this.workflowTreatmentsSource = new MatTableDataSource(res.data);
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

  onPaginationChange(pageInformation: any): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initalizeTable().subscribe();
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
          'WorkflowsModule.WorkflowTreatmentsListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'WorkflowsModule.WorkflowTreatmentsListComponent.deleteWorkflowTreatmentWarning'
        )}  '${lang === 'ar' ? element.title : element.titleEn}' ${this.translateService.instant(
          'shared.questionMark'
        )}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageActionsService.schemasService.deleteSchema(element.id).subscribe({
            next: (res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.initalizeTable().subscribe();
            },
          });
        },
      },
    });
  }

  view_hide_element(element: Schema): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: Schema): boolean {
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
      return ['title', 'titleEn', 'description', 'descriptionEn', 'isActive', 'actions'];
    }
  }
}
