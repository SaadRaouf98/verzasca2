import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { QueryParamsHandling, Router } from '@angular/router';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { StatisticsSummary } from '@core/models/statistics-summary.model';
import { NotificationsHubService } from '@core/services/backend-services/notifications-hub.service';
import { StatisticsService } from '@core/services/backend-services/statistics.service';
import { Observable, debounceTime, fromEvent } from 'rxjs';
import { NAV_ITEMS, NavItem } from '@core/layout/models/nav-items';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContainerComponent implements OnInit, OnDestroy {
  opened: boolean = true;
  sideNavMode: 'side' | 'over' = 'side';
  PermissionsObj = PermissionsObj;
  selectedOption:'export' | 'import';
  windowresizeObserv$ = new Observable();
  navItems: NavItem[] = NAV_ITEMS;
  StatisticsSummary: StatisticsSummary = {
    PendingRequests: 0,
    HoldingRequests: 0,
    ActiveRecords: 0,
    UnSignedDocuments: 0,
    CurrentMeetings: 0,
  };
  // start “expanded” by default
  isCollapsed = false;
  isLightTheme = false;

  // flip the flag
  toggleSidenav() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem(
      'MENU_CONFIG',
      JSON.stringify({ isMenuCollapsed: this.isCollapsed })
    );
  }

  constructor(
    private statisticsService: StatisticsService,
    private notificationsHubService: NotificationsHubService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document // <-- Inject DOCUMENT
  ) {
    this.isLightTheme = this.document.body.classList.contains('light-theme');
  }
  changeThemeColor() {}
  ngOnInit(): void {
    this.getStatisticsSummary();
    this.initRealTime();
    const isInMobileView = this.isInMobileView();
    this.getConfigFromStorage();
    this.opened = !isInMobileView;
    this.sideNavMode = isInMobileView ? 'over' : 'side';

    this.detectWindowSizeChanging();
    this.updateThemeFlag();

    // Watch for class changes on body
    const observer = new MutationObserver(() => this.updateThemeFlag());
    observer.observe(this.document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
  navigateTo(val){
    
      this.selectedOption = val;
    if(val == 'export' ){    
      this.router.navigateByUrl('imports-exports/export')
    }else{
      this.router.navigateByUrl('imports-exports/add')
    }
  }
  getConfigFromStorage() {
    let config = JSON.parse(localStorage.getItem('MENU_CONFIG') as any);
    this.isCollapsed = config ? config['isMenuCollapsed'] : false;
  }

  getStatisticsSummary(): void {
    this.statisticsService.getSummary().subscribe({
      next: (res) => {
        this.StatisticsSummary = res;
      },
    });
  }

  trackByRoute(_: number, item: NavItem) {
    return item.route;
  }

  initRealTime(): void {
    this.notificationsHubService.registerMethod(
      'StatisticsReceiver',
      (data: { value: StatisticsSummary }) => {
        console.info('StatisticsReceiver data received:', data);
        const {
          PendingRequests,
          HoldingRequests,
          ActiveRecords,
          UnSignedDocuments,
          CurrentMeetings,
        } = data.value;
        if (PendingRequests) {
          this.StatisticsSummary.PendingRequests = PendingRequests;
        }

        if (HoldingRequests) {
          this.StatisticsSummary.HoldingRequests = HoldingRequests;
        }

        if (ActiveRecords) {
          this.StatisticsSummary.ActiveRecords = ActiveRecords;
        }

        if (UnSignedDocuments) {
          this.StatisticsSummary.UnSignedDocuments = UnSignedDocuments;
        }

        if (CurrentMeetings) {
          this.StatisticsSummary.CurrentMeetings = CurrentMeetings;
        }
      }
    );
  }

  private detectWindowSizeChanging(): void {
    this.windowresizeObserv$ = fromEvent(window, 'resize').pipe(
      debounceTime(20)
    );

    this.windowresizeObserv$.subscribe(() => {
      this.sideNavMode = this.isInMobileView() ? 'over' : 'side';
    });
  }

  getMergingBehaviour(path: string): QueryParamsHandling | null {
    const currentPath = this.router.url.split('?')[0];
    return path === currentPath ? 'merge' : null;
  }

  private isInMobileView(): boolean {
    if (window.innerWidth < 576) {
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.windowresizeObserv$.subscribe();
  }

  updateThemeFlag() {
    this.isLightTheme = this.document.body.classList.contains('light-theme');
  }
}
