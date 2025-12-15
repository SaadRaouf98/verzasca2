import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrganizationUnitType } from '@core/enums/organization-unit-type.enum';
import { AllOrganizationUnits } from '@core/models/organization-unit.model';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { compareFn, isTouched } from '@shared/helpers/helpers';

import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { AllUsers } from '@core/models/user.model';
import { ManageMeetingsService } from '@pages/manage-meetings/services/manage-meetings.service';
import { MeetingType } from '@core/enums/meeting-type.enum';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  ThemePalette,
} from '@angular/material/core';
import { MeetinForm, MeetingAttendant, MeetingCommand } from '@core/models/meeting.model';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { MY_FORMATS } from '@core/utils/date-picker-format';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-add-meeting',
  templateUrl: './add-meeting.component.html',
  styleUrls: ['./add-meeting.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AddMeetingComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  elementId: string = '';
  meetingTypes: {
    id: MeetingType;
    displayedText: string;
  }[] = [];
  lang: string = 'ar';
  organizationUnitsList$: Observable<AllOrganizationUnits> = new Observable();
  MeetingType = MeetingType;
  organizationUnitMembers: { id: string; name: string }[] = [];
  usersList$: Observable<AllUsers> = new Observable();
  passwordInput: {
    type: 'text' | 'password';
    iconSrc: string;
  } = {
    type: 'password',
    iconSrc: 'assets/icons/eye-opened.png',
  };

  showSpinners = true;
  showSeconds = false;
  touchUi = false;
  enableMeridian = true;
  stepHour = 1;
  stepMinute = 1;
  stepSecond = 1;
  color: ThemePalette = 'primary';
  disableMinute = false;
  hideTime = false;
  attendanceNextId: number = 0;
  PermissionsObj = PermissionsObj;

  currentStep: 1 | 2 | 3 = 1;
  isLoadingCommitteeMembers: boolean = false;
  compareFn = compareFn;

  constructor(
    private activatedRoute: ActivatedRoute,
    private manageMeetingsService: ManageMeetingsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private location: Location,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.lang = this.languageService.language;
    this.elementId = this.activatedRoute.snapshot.params['id'];

    this.initializeForm();
    this.initializeDropDownLists();

    if (this.elementId) {
      this.manageMeetingsService.meetingsService.getMeetingById(this.elementId).subscribe({
        next: (res) => {
          this.patchForm({
            id: res.id,
            title: res.title,
            description: res.description,
            url: res.url,
            password: res.password,
            isVirtual: res.isVirtual,
            meetingDateTime: res.meetingDateTime,
            durationInMinutes: res.durationInMinutes,
            meetingType: res.meetingType,
            committee: res.committee,
            user: undefined,
            members: res.members,

            attendances: [],

            requestContainersIds: res.requestContainers
              ? res.requestContainers.map((ele) => ele.id)
              : [],
            scheduledRequestContainersIds: res.scheduledRequestContainers.map((ele) => ele.id),
            discussionPoints: res.discussionPoints,
          });

          res.attendances.forEach((ele) => {
            this.attendances.push(this.createAttendant());
            this.attendances.controls[this.attendances.controls.length - 1].patchValue({
              name: ele.name,
              email: ele.email,
              foundation: ele.foundation,
            });
          });

          res.discussionPoints.forEach((ele) => {
            this.discussionPoints.push(this.createDiscussionPoint());
            this.discussionPoints.controls[this.discussionPoints.controls.length - 1].patchValue(
              ele
            );
          });

          this.organizationUnitMembers = res.committeeMembers;
        },
      });
    }
  }

  initializeForm(): void {
    this.form = new FormGroup(
      {
        id: new FormControl('', []),
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', []),
        url: new FormControl('', []),
        password: new FormControl('', []),
        isVirtual: new FormControl(true, [Validators.required]),
        meetingDateTime: new FormControl('', [Validators.required]),
        durationInMinutes: new FormControl('', [Validators.required, Validators.min(1)]),
        meetingType: new FormControl('', [Validators.required]),
        committee: new FormControl('', []),
        user: new FormControl('', []),
        members: new FormControl([], []),

        attendances: new FormArray([], []),

        requestContainersIds: new FormControl('', []),
        scheduledRequestContainersIds: new FormControl('', []),
        discussionPoints: new FormArray([], []),
      },
      {
        validators: [this.committeeValidator()],
      }
    );

    /*     this.attendances.push(this.createAttendant());
    this.discussionPoints.push(this.createDiscussionPoint());
 */
  }

  private committeeValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      if (
        form.get('meetingType')?.value === MeetingType.Committee &&
        !form.get('committee')?.value
      ) {
        return {
          committeeRequired: true,
        };
      }

      return null;
    };
  }

  private createAttendant(): FormGroup {
    return new FormGroup({
      id: new FormControl('', []),
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      foundation: new FormControl('', []),
    });
  }

  private createDiscussionPoint(): FormControl {
    return new FormControl('', [Validators.required]);
  }

  onSetIfUserIsTouched(touched: boolean): void {
    if (touched) {
      this.form.get('members')?.markAsTouched();
    } else {
      this.form.get('members')?.markAsUntouched();
    }
  }

  initializeDropDownLists(): void {
    this.organizationUnitsList$ =
      this.manageMeetingsService.organizationUnitsService.getOrganizationUnitsList(
        {
          pageSize: 20,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
        }
      );

    this.meetingTypes = [
      {
        id: MeetingType.Committee,
        displayedText: this.lang === 'ar' ? 'لجنة' : 'Committee',
      },
      {
        id: MeetingType.Internal,
        displayedText: this.lang === 'ar' ? 'داخلي' : 'Internal',
      },
    ];
  }

  searchOnCommittees(event: { term: string; items: any[] }) {
    this.organizationUnitsList$ =
      this.manageMeetingsService.organizationUnitsService.getOrganizationUnitsList(
        {
          pageSize: 10,
          pageIndex: 0,
        },
        {
          type: OrganizationUnitType.Committee,
          searchKeyword: event.term,
        }
      );
  }

  onCommitteeSelected(): void {
    const committeeId = this.form.get('committee')?.value?.id;
    if (committeeId) {
      this.isLoadingCommitteeMembers = true;
      this.manageMeetingsService.organizationUnitsService
        .getOrganizationUnitUsers(committeeId)
        .subscribe({
          next: (res) => {
            this.isLoadingCommitteeMembers = false;
            this.organizationUnitMembers = res.members;
          },
        });
    } else {
      this.organizationUnitMembers = [];
    }
  }

  onMeetingTypeChanged(): void {
    const meetingTypeId: MeetingType = this.form.get('meetingType')?.value;
    if (meetingTypeId === MeetingType.Committee) {
      this.form.get('user')?.reset();
    } else if (meetingTypeId === MeetingType.Internal) {
      this.form.get('committee')?.reset();
      this.form.get('members')?.setValue([]);
      this.organizationUnitMembers = [];
    }
  }

  onAddMember(): void {
    if (!this.form.get('user')?.value) {
      return;
    }

    //

    const membersIds = this.form
      .get('members')
      ?.value?.map((ele: { id: string; name: string }) => ele.id);
    const currentUserId = this.form.get('user')?.value?.id;

    if (membersIds.includes(currentUserId)) {
      this.toastr.warning(
        this.translateService.instant('ManageMeetingsModule.AddMeetingComponent.addedMemberBefore')
      );
      return;
    }

    this.form.get('members')?.value.push(this.form.get('user')?.value);
    this.form.get('user')?.setValue('');
  }

  onDeleteMember(member: { id: string; name: string }): void {
    const index = this.form.get('members')?.value.indexOf(member);
    if (index > -1) {
      // only splice array when item is found
      this.form.get('members')?.value.splice(index, 1); // 2nd parameter means remove one item only
    }
  }

  onAddAttendence(): void {
    if (this.attendances.controls.length) {
      const { name, email } = this.attendances.controls[this.attendances.controls.length - 1].value;

      if (!name || !email) {
        this.toastr.warning(
          this.translateService.instant(
            'ManageMeetingsModule.AddMeetingComponent.nameAndEmailRequired'
          )
        );
        return;
      }

      if (this.attendances.controls[this.attendances.controls.length - 1].get('email')?.invalid) {
        this.toastr.warning('البريد الالكتروني المدخل غير صحيح');

        return;
      }
    }

    this.attendances.push(this.createAttendant());
  }

  onDeleteAttendant(index: number): void {
    this.attendances.removeAt(index);
  }

  onAddDiscussionPoint(): void {
    if (this.discussionPoints.controls.length) {
      const discussionPoint =
        this.discussionPoints.controls[this.discussionPoints.controls.length - 1].value;

      if (!discussionPoint) {
        this.toastr.warning('يجب كتابة سبب الانعقاد قبل اضافة سطر اخر');
        return;
      }
    }

    this.discussionPoints.push(this.createDiscussionPoint());
  }

  get attendances(): FormArray {
    return this.form.get('attendances') as FormArray;
  }

  get discussionPoints(): FormArray {
    return this.form.get('discussionPoints') as FormArray;
  }

  getFormControlByIndex(formArray: FormArray, index: number): FormControl {
    return formArray.controls[index] as FormControl;
  }

  onSetAttendances(attendances: MeetingAttendant[]): void {
    this.form.get('attendances')?.setValue(attendances);
  }

  onDeleteDiscussionPoint(index: number): void {
    this.discussionPoints.removeAt(index);
  }

  onSetRequestContainersIds(requestContainersId: string[]): void {
    this.form.get('requestContainersIds')?.setValue(requestContainersId);
  }

  onSetScheduledRequestContainersIds(scheduledRequestContainersId: string[]): void {
    this.form.get('scheduledRequestContainersIds')?.setValue(scheduledRequestContainersId);
  }

  patchForm(data: MeetinForm): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;

    if (this.elementId) {
      this.manageMeetingsService.meetingsService.updateMeeting(this.mapDataToBeSend()).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataUpdatedSuccessfully'));
          this.navigateToTablePage();
        },

        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
    } else {
      this.manageMeetingsService.meetingsService.addMeeting(this.mapDataToBeSend()).subscribe({
        next: (res) => {
          this.toastr.success(this.translateService.instant('shared.dataCreatedSuccessfully'));
          this.navigateToTablePage();
        },
        error: (err) => {
          this.disableSubmitBtn = false;
        },
      });
    }
  }

  private mapDataToBeSend(): MeetingCommand {
    let {
      id,
      title,
      description,
      url,
      password,
      isVirtual,
      meetingDateTime,
      durationInMinutes,
      meetingType,
      committee,
      members,
      attendances,
      requestContainersIds,
      scheduledRequestContainersIds,
      discussionPoints,
    } = this.form.value;

    meetingDateTime = new Date(meetingDateTime);
    var day = meetingDateTime.getDate(); // yields date
    var month = meetingDateTime.getMonth() + 1; // yields month (add one as '.getMonth()' is zero indexed)
    var year = meetingDateTime.getFullYear(); // yields year
    var hour = meetingDateTime.getHours(); // yields hours
    var minute = meetingDateTime.getMinutes(); // yields minutes
    var second = meetingDateTime.getSeconds(); // yields seconds

    // After this construct a string with the above results as below
    var time =
      year +
      '-' +
      (month < 10 ? `0${month}` : month) +
      '-' +
      (day < 10 ? `0${day}` : day) +
      'T' +
      (hour < 10 ? `0${hour}` : hour) +
      ':' +
      (minute < 10 ? `0${minute}` : minute) +
      ':' +
      (second < 10 ? `0${second}` : second);

    return {
      id,
      meetingType,
      title,

      meetingDateTime: time,
      isVirtual,
      description,
      attendances: attendances
        ? attendances.map(
            (ele: { id: string; name: string; email: string; foundation: string }) => {
              return {
                name: ele.name,
                email: ele.email,
                foundation: ele.foundation,
              };
            }
          )
        : [],
      durationInMinutes,
      url,
      password,
      discussionPoints: discussionPoints,
      committeeId: committee?.id,
      requestContainers: requestContainersIds || [],
      scheduledRequestContainers: scheduledRequestContainersIds || [],
      members: members ? members.map((ele: { id: string; name: string }) => ele.id) : null,
    };
  }

  onCancel() {
    this.form.reset();
    this.navigateToTablePage();
  }

  navigateToTablePage(): void {
    this.location.back();
  }

  onTogglePassword(): void {
    if (this.passwordInput.type === 'password') {
      this.passwordInput.type = 'text';
      this.passwordInput.iconSrc = 'assets/icons/eye-closed.png';
    } else {
      this.passwordInput.type = 'password';
      this.passwordInput.iconSrc = 'assets/icons/eye-opened.png';
    }
  }

  onNavigateBack(): void {
    this.location.back();
  }

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }

  onGOToNextStep(): void {
    this.currentStep++;
  }

  onGOToPreviousStep(): void {
    this.currentStep--;
  }
}
