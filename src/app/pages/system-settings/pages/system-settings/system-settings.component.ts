import { Component, OnInit } from '@angular/core';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsPage implements OnInit {
  lang: string = 'ar';
  PermissionsObj = PermissionsObj;

  constructor(private langugaeService: LanguageService) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
  }
}
