import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OganizationUnitMembers } from '@core/models/organization-unit.model';
import { User } from '@core/models/user.model';
import { LanguageService } from '@core/services/language.service';
import { isSmallDeviceWidthForTable } from '@shared/helpers/helpers';
import { ManageSharedService } from '@shared/services/manage-shared.service';
import { Observable, map, of } from 'rxjs';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-shared-members',
  templateUrl: './shared-members.component.html',
  styleUrls: ['./shared-members.component.scss'],
})
export class SharedMembersComponent implements OnInit {
  @Input() elementId!: string;
  @Input() header!: string;
  @Input() subHeader!: string;
  @Input() buttonLabel!: string;
  @Input() canAddInnerDepartments!: boolean;
  @Output() addRelatedDepartmentEvent: EventEmitter<string> = new EventEmitter();

  data: OganizationUnitMembers = {
    id: '',
    title: '',
    titleEn: '',
    members: [],
  };
  lang: string = 'ar';

  isLoading: boolean = true;

  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  usersFilteredList$!: Observable<User[]>;

  constructor(
    private languageService: LanguageService,
    private manageSharedService: ManageSharedService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.intializeFrom();
    this.lang = this.languageService.language;
    this.elementId = this.activatedRoute.snapshot.params['id'];
    this.searchOnUsers('');
    this.intializePageData();
  }

  intializePageData(): void {
    this.isLoading = true;
    this.manageSharedService.organizationUnitsService
      .getOrganizationUnitUsers(this.elementId)
      .subscribe((res) => {
        this.isLoading = false;
        this.data = res;
        res.members.forEach((member) => {
          this.addRow(member);
        });
      });
  }

  detectFieldChange(control: AbstractControl) {
    const val = control.value;
    if (val) {
      val.name ? this.searchOnUsers(val.name) : this.searchOnUsers(val);
    }
  }

  searchOnUsers(searchKeyword: string): void {
    this.manageSharedService.usersService
      .getUsersList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          searchKeyword,
        },
        {
          sortBy: 'name',
          sortType: 'desc',
        }
      )
      .pipe(
        map((res) => {
          this.usersFilteredList$ = of(res.data);
        })
      )
      .subscribe();
  }

  intializeFrom(): void {
    this.form = new FormGroup({
      members: new FormArray([], []),
    });
  }

  addRow(element?: { id: string; name: string }) {
    if (!element && this.isLastRowWithNoUser()) {
      return;
    }
    this.membersFormArray.push(new FormControl(element ? element : '', []));
    this.cdr.detectChanges();
  }

  isLastRowWithNoUser(): boolean {
    return this.membersFormArray.value[this.membersFormArray.value.length - 1] === ''
      ? true
      : false;
  }

  onDeleteMember(emp: FormControl<any>) {
    const index = this.membersFormArray.controls.indexOf(emp);
    this.membersFormArray.removeAt(index);
  }

  onAddInnerDepartment(emp: FormControl<any>): void {
    const employee = emp.value;
    this.addRelatedDepartmentEvent.emit(employee);
  }

  isSmallDeviceWidthForTable(): boolean {
    return isSmallDeviceWidthForTable();
  }

  get membersFormArray(): FormArray {
    return this.form?.get('members') as FormArray;
  }

  get membersArrayControls(): FormControl<any>[] {
    return (this.form?.get('members') as FormArray).controls as FormControl<any>[];
  }

  getMemberControl(index: number): FormControl<any> {
    return this.membersFormArray.at(index) as FormControl<any>;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let selectedMembersIds = this.membersFormArray.value.filter((ele: string) => ele !== '');
    selectedMembersIds = selectedMembersIds.map((ele: { id: string; name: string }) => ele.id);

    this.manageSharedService.organizationUnitsService
      .updateOrganizationUnitUsers({
        id: this.data.id,
        membersId: selectedMembersIds,
      })
      .subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));
          this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
  }

  onCancel() {
    this.form.reset();
    this.navigateToTablePage();
  }

  navigateToTablePage(): void {
    this.location.back();
  }

  displayItems(option: { id: number; name: string }) {
    return option?.name;
  }
}
