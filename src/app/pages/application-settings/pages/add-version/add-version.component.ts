import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LanguageService } from '@core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { isTouched } from '@shared/helpers/helpers';

import { Location } from '@angular/common';
import { ManageApplicationSettingsService } from '@pages/application-settings/services/manage-application-settings.service';
import { Apps } from '@shared/enums/apps.enum';
import { CustomToastrService } from '@core/services/custom-toastr.service';
interface SelectOption<V = number> {
  label: string;
  value: V;
}

@Component({
  selector: 'app-add-version',
  templateUrl: './add-version.component.html',
  styleUrls: ['./add-version.component.scss'],
})
export class AddVersionComponent {
  form!: FormGroup;
  disableSubmitBtn: boolean = false;
  lang: string = 'ar';
  readonly appOptions: SelectOption<Apps>[] = this.toSelectOptions(Apps);
  constructor(
    private location: Location,
    private manageApplicationSettingsService: ManageApplicationSettingsService,
    private toastr: CustomToastrService,
    private translateService: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.lang = this.languageService.language;
  }
  /** Generic helper to turn any TS enum into `{ label, value }[]` */
  private toSelectOptions(enumObj: object): SelectOption[] {
    return (
      Object.keys(enumObj)
        // filter out numeric keys from the reverse‐mapping
        .filter((key) => isNaN(Number(key)))
        .map((key) => ({
          label: key,
          value: (enumObj as any)[key] as number,
        }))
        .sort((a, b) => a.value - b.value)
        .reverse()
    );
  }

  initializeForm(): void {
    this.form = new FormGroup({
      version: new FormControl('', [Validators.required]),
      link: new FormControl('', [Validators.required]),
      app: new FormControl('', [Validators.required]),
      isForceUpdate: new FormControl(false, [Validators.required]),
    });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableSubmitBtn = true;
    let { version, link, isForceUpdate, app } = this.form.value;

    this.manageApplicationSettingsService.IosVersionsService.addIOSVersion({
      version,
      link,
      isForceUpdate,
      app,
    }).subscribe({
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

  isTouched(controlName: string): boolean | undefined {
    return isTouched(this.form, controlName);
  }
}
