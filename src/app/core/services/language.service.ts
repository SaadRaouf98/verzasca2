import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private lang: string = 'ar';

  constructor() {}

  get language(): string {
    this.lang = localStorage.getItem('lang') || 'ar';
    return this.lang;
  }

  set language(lang: string) {
    localStorage.setItem('lang', lang);
    this.lang = lang;
  }
}
