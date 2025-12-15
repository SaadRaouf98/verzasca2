import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-secretariat-structure',
  templateUrl: './secretariat-structure.component.html',
  styleUrls: ['./secretariat-structure.component.scss'],
})
export class SecretariatStructureComponent {
  lang: string = 'ar';

  constructor(
    private location: Location,
    private langugaeService: LanguageService
  ) {}

  ngOnInit(): void {
    this.lang = this.langugaeService.language;
  }

  onNavigateBack(): void {
    this.location.back();
  }
}
