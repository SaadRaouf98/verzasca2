import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { ManageSharedService } from '@shared/services/manage-shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  lang: string = 'ar';

  constructor(
    private translateService: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private manageSharedService: ManageSharedService
  ) {
    this.document.body.classList.add('dark-theme');
    this.translateService.setDefaultLang('ar'); // Set default language
    this.translateService.use('ar');
    let lastUrl = '';

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const cleanUrl = event.urlAfterRedirects.split('?')[0];

        if (lastUrl && cleanUrl !== lastUrl) {
          this.manageSharedService.clearPageFilters(lastUrl);
        }

        lastUrl = cleanUrl;
      }
    });
  }

  ngOnInit(): void {
    fromEvent(window, 'load').subscribe(() => {
      const divGlobalLoader = document.querySelector('#glb-loader');
      //

      if (divGlobalLoader) {
        divGlobalLoader?.classList.remove('loaderShow');
      }
    });
    this.adjustLanguage();
    this.adjustStyle();
    setTimeout(() => {
      //
      // removeEditorFromDom();
    }, 7000);
  }

  private adjustLanguage(): void {
    this.lang = localStorage.getItem('lang') ?? 'ar';
    if (this.lang != 'ar' && this.lang != 'en') {
      this.lang = 'ar';
      localStorage.setItem('lang', this.lang);
    }

    if (this.lang === 'en') {
      document.body.classList.add('app-en');
    }
    this.translateService.setDefaultLang(this.lang);
  }

  private adjustStyle() {
    document.documentElement.lang = this.lang;
    document.documentElement.dir = this.lang === 'ar' ? 'rtl' : 'ltr';
    if (this.lang == 'ar') {
      const head = document.querySelector('head');
      const style = document.createElement('STYLE');
      style.innerText = `[dir="ltr"] * {direction:rtl !important;}`;
      head?.appendChild(style);
    }
  }
}

