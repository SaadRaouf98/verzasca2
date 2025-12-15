import { Component } from '@angular/core';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { LanguageService } from '@core/services/language.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-application-settings',
  templateUrl: './application-settings.component.html',
  styleUrls: ['./application-settings.component.scss'],
})
export class ApplicationSettingsComponent {
  lang: string = 'ar';
  PermissionsObj = PermissionsObj;

  constructor(
    private langugaeService: LanguageService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
  }

  onNavigateBack(): void {
    this.location.back();
  }
}
