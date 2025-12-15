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
import { UsersService } from '@core/services/backend-services/users.service';
import { compareFn, removeSpecialCharacters } from '@shared/helpers/helpers';

export interface Users {
  data: {
    id: string;
    name: string;
  }[];
  totalCount: number;
  groupCount: number;
}

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss'],
})
export class UserSearchComponent implements OnInit, OnChanges {
  usersList: { id: string; name: string }[] = [];

  dropDownValue!: { id: string; name: string } | { id: string; name: string }[];
  compareFn = compareFn;

  userFromControl: FormControl = new FormControl();
  @Input('multiple') multiple: boolean = false;
  @Input('placeholder') placeholder!: string;
  @Input('value') value!: string | null;

  @Output() emitValue: EventEmitter<object> = new EventEmitter();
  @Output() touched: EventEmitter<boolean> = new EventEmitter();
  @Output() clear: EventEmitter<void> = new EventEmitter();
  @Output() remove: EventEmitter<{ id: string; title: string }> =
    new EventEmitter();

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.searchOnUsers();
  }

  ngOnChanges(changes: { value: SimpleChange }): void {

    this.userFromControl.setValue(changes.value.currentValue);
    if (this.userFromControl.value) {
      if (
        Array.isArray(this.userFromControl.value) &&
        this.userFromControl.value.length
      ) {
        this.usersList.push(...this.userFromControl.value);
      } else if (
        !Array.isArray(this.userFromControl.value) &&
        !this.isExistInList(this.userFromControl.value.id)
      ) {
        this.usersList.push(this.userFromControl.value);
      }
    }
  }

  searchOnUsers(event?: { term: string; items: any[] }, pageSize = 20): void {
    let searchKeyword = undefined;

    if (event) {
      pageSize = 10;
      searchKeyword = event.term;
    }

    this.usersService
      .getUsersList(
        {
          pageSize,
          pageIndex: 0,
        },
        {
          searchKeyword: removeSpecialCharacters(searchKeyword || ''),
        },
        undefined,
        ['id', 'name']
      )
      .subscribe({
        next: (res) => {
          this.usersList = res.data;
        },
      });
  }

  onSelectionChange(e: any): void {
    this.emitValue.emit(e);
  }

  onBlur(): void {
    this.touched.emit(this.userFromControl.touched);
  }

  onClearUsers(): void {
    this.clear.emit();
  }

  onRemoveSingleUser(event: { id: string; title: string }): void {
    this.remove.emit(event);
  }

  isExistInList(userId: string): boolean {
    return this.usersList.find((ele) => ele.id === userId) ? true : false;
  }
}

