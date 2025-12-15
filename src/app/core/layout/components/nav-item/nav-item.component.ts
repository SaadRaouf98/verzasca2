import { Component, inject, Input, OnInit } from '@angular/core';
import { StatisticsSummary } from '@core/models/statistics-summary.model';
import { NavItem } from '@core/layout/models/nav-items';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { AuthService } from '@core/services/auth/auth.service';
import { NotificationsHubService } from '@core/services/backend-services/notifications-hub.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss'],
})
export class NavItemComponent implements OnInit {
  @Input() item!: NavItem;
  @Input() statistics!: StatisticsSummary;
  @Input() mergeFn!: (route: string) => any;
  @Input() isLightTheme: boolean = false;
  @Input() isCollapsed: boolean = false;
  openSub: boolean = false;
  subActive: boolean = false;

  PermissionsObj = PermissionsObj;
  authService = inject(AuthService);
  private notificationsHubService = inject(NotificationsHubService);
  constructor(private router: Router) {}
  ngOnInit() {}

  get countValue(): number {
    return this.item.countProp ? this.statistics[this.item.countProp] || 0 : 0;
  }

  get queryParamsHandling() {
    return this.item.queryParamsMerge ? this.mergeFn(this.item.route) : null;
  }
  openMenuFn(check: boolean) {
    if (check) {
      this.openSub = !this.openSub;
    }
  }

  isChildActive(url: string): boolean {
    const currentUrl = this.router.url.split('?')[0];
    this.subActive = url.includes('active');
    return currentUrl === url;
  }

  logout() {
    this.notificationsHubService.disconnect();
    this.authService.logout(true);
  }
}
