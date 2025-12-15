import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { LanguageService } from '@core/services/language.service';
import { PermissionsObj } from '@core/constants/permissions.constant';

@Component({
  selector: 'app-users-roles',
  templateUrl: './users-roles.component.html',
  styleUrls: ['./users-roles.component.scss'],
})
export class UsersRolesComponent {
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
