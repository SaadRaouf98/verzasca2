import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { LanguageService } from '@core/services/language.service';
import { debounceTime, map } from 'rxjs';

@Component({
  selector: 'app-all-services',
  templateUrl: './all-services.page.html',
  styleUrls: ['./all-services.page.scss'],
})
export class AllServicesPage implements OnInit {
  searchKeywordControl = new FormControl();
  lang: string = 'ar';

  constructor(private languageService: LanguageService) {}
  ngOnInit(): void {
    this.lang = this.languageService.language;

    this.searchKeywordControl.valueChanges
      .pipe(
        debounceTime(200),
        map((value) => {})
      )
      .subscribe();
  }
}
