import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationModalComponent } from '@shared/components/confirmation-modal/confirmation-modal.component';
import { isSmallDeviceWidthForPopup, isSmallDeviceWidthForTable } from '@shared/helpers/helpers';

import { debounceTime, map, Observable, tap } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AllRequestTypes, RequestType } from '@core/models/request-type.model';
import { ManageRequestTypesService } from '@pages/request-types/services/manage-request-types.service';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { FormControl } from '@angular/forms';
import { CustomToastrService } from '@core/services/custom-toastr.service';
@Component({
  selector: 'app-request-types-list',
  templateUrl: './request-types-list.component.html',
  styleUrls: ['./request-types-list.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class RequestTypesListComponent {
  requestTypesSource: MatTableDataSource<RequestType> = new MatTableDataSource<RequestType>([]);
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
  expandedElement!: RequestType | null;

  searchKeywordControl = new FormControl();
  filtersData: {
    searchKeyword: string;
  } = {
    searchKeyword: '',
  };

  lang: string = 'ar';
  PermissionsObj = PermissionsObj;

  constructor(
    private manageRequestTypesService: ManageRequestTypesService,
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

  initalizeTable(): Observable<AllRequestTypes> {
    this.isLoading = true;
    return this.manageRequestTypesService.requestTypesService
      .getRequestTypesList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.requestTypesSource = new MatTableDataSource(res.data);
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
    //
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
      disableClose: false,
      data: {
        headerTranslationRef: this.translateService.instant(
          'RequestTypesModule.RequestTypesListComponent.confirmDeletion'
        ),
        headerIconSrc: 'assets/icons/trash-solid.svg',
        hasActionButtons: true,
        hasDeleteBtn: true,
        content: `${this.translateService.instant(
          'RequestTypesModule.RequestTypesListComponent.deleteRequestTypeWarning'
        )}  '${lang === 'ar' ? element.title : element.titleEn}' ${this.translateService.instant(
          'shared.questionMark'
        )}`,
        confirmBtnTranslationRef: this.translateService.instant('shared.yesDelete'),
        confirmationAction: () => {
          this.dialog.closeAll();
          this.manageRequestTypesService.requestTypesService
            .deleteRequestType(element.id)
            .subscribe((res) => {
              this.toastr.success(this.translateService.instant('shared.deletedSuccessfully'));
              this.initalizeTable().subscribe();
            });
        },
      },
    });
  }

  view_hide_element(element: RequestType): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: RequestType): boolean {
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
      return [
        'title',
        'documentType.title',
        'schema',
        'classifications',
        'isTransaction',
        'actions',
      ];
    }
  }

  formatClassifications(classifications: { id: string; title: string; titleEn: string }[]): string {
    return classifications
      .map((ele) => {
        if (this.lang === 'ar') return ele.title;
        return ele.titleEn;
      })
      .join(' , ');
  }
}
