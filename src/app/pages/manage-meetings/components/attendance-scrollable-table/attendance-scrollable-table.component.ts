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
import { MatTableDataSource } from '@angular/material/table';
import { MeetingAttendant } from '@core/models/meeting.model';
import { isSmallDeviceWidthForTable } from '@shared/helpers/helpers';

@Component({
  selector: 'app-attendance-scrollable-table',
  templateUrl: './attendance-scrollable-table.component.html',
  styleUrls: ['./attendance-scrollable-table.component.scss'],
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
export class AttendanceScrollableTableComponent implements OnInit, OnChanges {
  attendanceSource: MatTableDataSource<MeetingAttendant> =
    new MatTableDataSource<MeetingAttendant>([]);
  displayedColumns: string[] = [
    'rowNumber',
    'name',
    'email',
    'foundation',
    'actions',
  ];
  expandedElement!: MeetingAttendant | null;

  @Input() data!: MeetingAttendant[];
  @Output() attendances: EventEmitter<MeetingAttendant[]> = new EventEmitter<
    MeetingAttendant[]
  >();

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: { data: SimpleChange }) {
    if (changes.data.currentValue) {
      this.attendanceSource = new MatTableDataSource(changes.data.currentValue);
    }
  }

  onDeleteAttendant(elementId: number): void {
    this.attendanceSource.data = this.attendanceSource.data.filter(
      (ele) => ele.id !== elementId
    );
    this.attendances.next(this.attendanceSource.data);
  }

  view_hide_element(element: MeetingAttendant): void {
    if (isSmallDeviceWidthForTable()) {
      if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
        this.expandedElement = null;
      } else {
        this.expandedElement = element;
      }
    }
  }

  check_view_element(element: MeetingAttendant): boolean {
    if (JSON.stringify(this.expandedElement) === JSON.stringify(element)) {
      return true;
    } else {
      return false;
    }
  }
}
