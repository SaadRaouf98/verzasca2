import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  AllScheduledRequestContainers,
  ScheduledRequestContainer,
} from '@core/models/meeting.model';
import { ManageMeetingsService } from '@pages/manage-meetings/services/manage-meetings.service';
import { isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { Observable, debounceTime, map, tap } from 'rxjs';

@Component({
  selector: 'app-scheduled-request-containers-scrollable-table',
  templateUrl: './scheduled-request-containers-scrollable-table.component.html',
  styleUrls: ['./scheduled-request-containers-scrollable-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ScheduledRequestContainersScrollableTableComponent
  implements OnInit, OnChanges
{
  scheduledRequestContainersSource: MatTableDataSource<ScheduledRequestContainer> =
    new MatTableDataSource<ScheduledRequestContainer>([]);
  pageIndex: number = 0;
  pageSize: number = 20;
  length: number = 100000;
  pageEvent!: PageEvent;
  displayedColumns: string[] = ['transactionNumber', 'checked', 'title'];
  isLoading: boolean = false;

  expandedElement!: ScheduledRequestContainer | null;
  checkAllRequestConainers: boolean = false;
  selectedRequestContainersIds: string[] = [];
  searchKeywordControl = new FormControl();
  searchKeyword: string = '';

  @Input() committeeId!: string;
  @Input() isScheduled: boolean = false;
  @Input() checkedIds!: string[];
  @Output() requestContainersIds: EventEmitter<string[]> = new EventEmitter<
    string[]
  >();

  constructor(private manageMeetingsService: ManageMeetingsService) {}

  ngOnInit(): void {
    this.initializeTable().subscribe();
    this.detectUserSearching();
  }

  detectUserSearching(): void {
    this.searchKeywordControl.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {
          this.searchKeyword = value;
          this.pageIndex = 0;
          this.initializeTable().subscribe();
        })
      )
      .subscribe();
  }

  ngOnChanges(changes: {
    committeeId: SimpleChange;
    checkedIds: SimpleChange;
  }): void {
    this.committeeId = changes.committeeId?.currentValue;
    if (
      changes.committeeId &&
      changes.committeeId.currentValue != changes.committeeId.previousValue
    ) {
      this.initializeTable().subscribe();
    }

    if (changes.checkedIds && changes.checkedIds.currentValue) {
      this.selectedRequestContainersIds = changes.checkedIds.currentValue;
    }
  }

  initializeTable(): Observable<AllScheduledRequestContainers> {
    this.isLoading = true;
    return this.manageMeetingsService.meetingsService
      .getScheduledRequestContainersList(
        { pageIndex: this.pageIndex, pageSize: this.pageSize },
        {
          committeeId: this.committeeId!,
          isScheduled: this.isScheduled,
          searchKeyword: this.searchKeyword,
        }
      )
      .pipe(
        tap((res) => {
          this.isLoading = false;
          this.scheduledRequestContainersSource = new MatTableDataSource(
            res.data
          );
          this.length = res.totalCount;

          this.scheduledRequestContainersSource.data.forEach((ele) => {
            if (this.selectedRequestContainersIds.includes(ele.id)) {
              ele.isDiscussed = true;
            }
          });

          if (
            this.selectedRequestContainersIds.length ===
            this.scheduledRequestContainersSource.data.length
          ) {
            this.checkAllRequestConainers = true;
          }
        })
      );
  }

  onPaginationChange(pageInformation: {
    pageSize: number;
    pageIndex: number;
  }): void {
    this.pageSize = pageInformation.pageSize;
    this.pageIndex = pageInformation.pageIndex;

    this.initializeTable().subscribe();
  }

  onSelect(
    checkedMetaData: { checked: boolean },
    requestContainer?: ScheduledRequestContainer
  ) {


    if (!requestContainer) {
      //incase user checks checkbox  in table header
      this.selectedRequestContainersIds = [];
      this.scheduledRequestContainersSource.data.forEach((element) => {
        element.isDiscussed = checkedMetaData.checked;
        if (checkedMetaData.checked) {
          this.selectedRequestContainersIds.push(element.id);
        }
      });
    } else {
      requestContainer.isDiscussed = checkedMetaData.checked;

      if (!checkedMetaData.checked) {
        this.selectedRequestContainersIds =
          this.selectedRequestContainersIds.filter(
            (id) => id != requestContainer!.id
          );
        //we must uncheck the checkbox  in table header
        this.checkAllRequestConainers = false;
      } else {
        this.selectedRequestContainersIds.push(requestContainer.id);
        //we must check the checkbox  in table header if all rows are checked
        let isOneRowUnchecked = false;

        this.scheduledRequestContainersSource.data.forEach((element) => {
          if (!element.isDiscussed) {
            isOneRowUnchecked = true;
          }
        });

        if (!isOneRowUnchecked) {
          this.checkAllRequestConainers = true;
        }
      }
    }

    //Emit all check rows
    this.requestContainersIds.next(this.selectedRequestContainersIds);
  }
}
