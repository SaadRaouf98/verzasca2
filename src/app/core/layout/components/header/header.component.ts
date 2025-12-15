import { Component, OnInit, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { NotificationsHubService } from '@core/services/backend-services/notifications-hub.service';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  selectedLang!: string;
  langs: string[] = ['ar', 'en'];
  currentUserName: string = '';
  @Input() isLoggedIn!: boolean;
  @Input() inputSideNav!: MatSidenav;
  user: any = this.authService.currentUserData;
  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private router: Router,
    private notificationsHubService: NotificationsHubService
  ) {}

  ngOnInit() {
    this.currentUserName = this.authService.user?.unique_name;
    this.selectedLang = this.languageService.language;
  }

  onNavigateToUserProfile(): void {
    this.router.navigateByUrl('my-profile');
  }
  /**
   * Called when user changes his selected language.
   * It set user selected language in local storage and reload the entire app.
   */
  onChangeLang() {
    localStorage.setItem('lang', this.selectedLang);
    window.location.reload();
  }

  onLogout(): void {
    this.notificationsHubService.disconnect();

    this.authService.logout(true);
  }
}

