import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LanguageService } from '@core/services/language.service';
import {
  isSmallDeviceWidthForPopup,
  isSmallDeviceWidthForTable,
} from '@shared/helpers/helpers';
import { SortDirection } from '@angular/material/sort';
import { Observable, debounceTime, map, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RequestStatus } from '@core/enums/request-status.enum';
import { PermissionsObj } from '@core/constants/permissions.constant';
import moment from 'moment';
import { Entity } from '@core/models/entity.model';
import {
  AllDeliveryReceiptTable,
  DeliveryReceiptTableRow,
  DeliveryReceiptsFiltersForm,
} from '@core/models/delivery-receipt.model';
import { ManageImportsExportsService } from '@pages/imports-exports/services/manage-imports-exports.service';
import { UpdateDeliveryReceiptModalComponent } from '@pages/imports-exports/components/update-delivery-receipt-modal/update-delivery-receipt-modal.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';

@Component({
  selector: 'app-delivery-receipts-list',
  templateUrl: './delivery-receipts-list.component.html',
  styleUrls: ['./delivery-receipts-list.component.scss'],
})
export class DeliveryReceiptsListComponent {
  deliveryReceiptsSource: MatTableDataSource<DeliveryReceiptTableRow> =
    new MatTableDataSource<DeliveryReceiptTableRow>([]);
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
  expandedElement!: DeliveryReceiptTableRow | null;

  filtersData: DeliveryReceiptsFiltersForm = {} as DeliveryReceiptsFiltersForm;
  filtersForm!: FormGroup;

  foundationsList$: Observable<{
    data: { id: string; title: string; titleEn: string }[];
    totalCount: number;
  }> = new Observable();
  prioritiesList: Entity[] = [];
  usersList$: Observable<{
    data: {
      id: string;
      name: string;
    }[];
    totalCount: number;
    groupCount: number;
  }> = new Observable();
  allRequestStatus: { id: RequestStatus; name: string }[] = [];

  hijriDateCalendarInput!: {
    hijriFromDate: string;
    hijriToDate: string;
  };
  placeholder: string = 'shared.day/month/year';
  lang: string = 'ar';
  RequestStatus = RequestStatus;
  PermissionsObj = PermissionsObj;

  readonly dropDownProperties = ['id', 'title', 'titleEn'];

  constructor(
    private dialog: MatDialog,
    private langugaeService: LanguageService,
    private manageImportsExportsService: ManageImportsExportsService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
    this.initializeTable().subscribe();
    this.initializeFiltersForm();
    this.initializeDropDownLists();
    this.detectFiltersChanges();
  }

  initializeTable(): Observable<AllDeliveryReceiptTable> {
    this.isLoading = true;
    return this.manageImportsExportsService.deliveryReceiptsService
      .getDeliveryReceiptsList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        this.filtersData,
        this.sortData
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.deliveryReceiptsSource = new MatTableDataSource(res.data);
          this.length = res.totalCount;
        })
      );
  }

  initializeFiltersForm(): void {
    this.filtersForm = new FormGroup({
      creator: new FormControl(null),
      fromDate: new FormControl(null),
      toDate: new FormControl(''),
      hijriFromDate: new FormControl(''),
      hijriToDate: new FormControl(''),
      searchKeyword: new FormControl(''),
    });
  }

  initializeDropDownLists(): void {
    this.usersList$ =
      this.manageImportsExportsService.usersService.getUsersList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        undefined,
        undefined,
        ['id', 'name']
      );
  }

  detectFiltersChanges(): void {
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          //

          const formattedFromDate = value.fromDate
            ? moment(value.fromDate).format('yyyy-MM-DD')
            : '';

          const formattedToDate = value.toDate
            ? moment(value.toDate).format('yyyy-MM-DD')
            : '';

          this.filtersData = {
            creatorId: value.creator?.id || '',
            fromDate: formattedFromDate,
            toDate: formattedToDate,
            hijriFromDate: formattedFromDate,
            hijriToDate: formattedToDate,
          };

          this.hijriDateCalendarInput = {
            hijriFromDate: formattedFromDate,
            hijriToDate: formattedToDate,
          };

          this.pageIndex = 0;
          this.initializeTable().subscribe();
        })
      )
      .subscribe();
  }

  searchOnUsers(event: { term: string; items: any[] }): void {
    this.usersList$ =
      this.manageImportsExportsService.usersService.getUsersList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          searchKeyword: event.term,
        }
      );
  }

  onSortColumn(sortInformation: {
    active: string;
    direction: SortDirection;
  }): void {
    this.sortData = {
      sortBy: sortInformation.active,
      sortType: sortInformation.direction,
    };
    this.initializeTable().subscribe();
  }

  onPaginationChange(pageInformation: {
    pageSize: number;
    pageIndex: number;
  }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initializeTable().subscribe();
  }

  onEditElement(element: DeliveryReceiptTableRow): void {
    const dialogRef = this.dialog.open(UpdateDeliveryReceiptModalComponent, {
      minWidth: isSmallDeviceWidthForPopup() ? '95vw' : '1200px',
      maxWidth: '95vw',
      autoFocus: false,
      disableClose: true,
      data: {
        receiptId: element.id,
        deliveryDate: element.deliveryDate,
      },
    });

    dialogRef
      .afterClosed()
      .subscribe(
        (dialogResult: { statusCode: ModalStatusCode; status: string }) => {
          if (
            dialogResult &&
            dialogResult.statusCode === ModalStatusCode.Success
          ) {
            this.initializeTable().subscribe();
          }
        }
      );
  }

  view_hide_element(element: DeliveryReceiptTableRow): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: Request): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }

  return_displayed_columns(): string[] {
    if (isSmallDeviceWidthForTable()) {
      return ['autoNumber', 'actions'];
    } else {
      return [
        'autoNumber',
        'date',
        'creator.name',
        'itemsCount',
        'deliveryDate',
        'actions',
      ];
    }
  }

  compareFn(
    obj1: { id: string; name: string; title: string; titleEn: string },
    obj2: { id: string; name: string; title: string; titleEn: string }
  ): boolean {
    return obj1?.id === obj2?.id;
  }

  onGregorianDateChanges(): void {
    const { fromDate, toDate } = this.filtersForm.value;

    if (fromDate && toDate) {
      const formattedFromDate = moment(fromDate).format('yyyy-MM-DD');
      const formattedToDate = moment(toDate).format('yyyy-MM-DD');

      this.filtersForm.patchValue({
        hijriFromDate: formattedFromDate,
        hijriToDate: formattedToDate,
      });

      this.hijriDateCalendarInput = {
        hijriFromDate: formattedFromDate,
        hijriToDate: formattedToDate,
      };
    }
  }

  onPatchFormHijriDate(date: {
    hijriFromDate: string;
    hijriToDate: string;
    hijriFromDateDisplayedText: string | undefined;
    hijriToDateDisplayedText: string | undefined;
  }): void {
    //

    this.filtersForm.patchValue({
      hijriFromDate: date.hijriFromDate,
      hijriToDate: date.hijriToDate,
      fromDate: new Date(date.hijriFromDate),
      toDate: new Date(date.hijriToDate),
    });
  }
}

