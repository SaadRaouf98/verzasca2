import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LanguageService } from '@core/services/language.service';
import { PermissionsObj } from '@core/constants/permissions.constant';

@Component({
  selector: 'app-workflow-design',
  templateUrl: './workflow-design.component.html',
  styleUrls: ['./workflow-design.component.scss'],
})
export class WorkflowDesignComponent implements OnInit {
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
