import { Component, OnInit, Input, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { AuthService } from '@core/services/auth/auth.service';
import { NotificationsHubService } from '@core/services/backend-services/notifications-hub.service';
import { LanguageService } from '@core/services/language.service';
import { AddPolicyComponent } from '@pages/home/components/home-policies/add-policy/add-policy.component';
import { ModalStatusCode } from '@shared/enums/modal-status-code.enum';
interface MenuItem {
  label: string;
  icon: string; // e.g. your SVG/icon-font class
  route?: string; // where to navigate
  action?: () => void; // function to call on click
  children?: MenuItem[]; // for dropdowns
  isOpen?: boolean; // track open state
}
@Component({
  selector: 'app-top-right-header',
  templateUrl: './top-right-header.component.html',
  styleUrls: ['./top-right-header.component.scss'],
})
export class TopRightHeaderComponent implements OnInit {
  selectedOption = '';
  PermissionsObj = PermissionsObj;
  activeItem: MenuItem | null = null;
  menu: MenuItem[] = [
    {
      label: 'الخدمات الإلكترونية',
      icon: 'header-services',
      children: [
        { label: 'shared.ocr', icon: 'menu-ocr', route: '/ocr' },
        { label: 'shared.timeAttendance', icon: 'menu-attendance', route: '/time-attendance' },
        { label: 'shared.launchDoc', icon: 'menu-launch', route: '' },
      ],
    },
    {
      label: 'هيكل المنشأة',
      icon: 'header-structure',
      route: '/system-management/secretarial-structure',
    },
    // {
    //   label: 'آخر الأخبار',
    //   icon: 'header-news',
    //   route: '/home/posts',
    // },
    // {
    //   label: 'الحضور والانصراف',
    //   icon: 'header-attendance',
    //   route: '/time-attendance',
    // },
  ];
  constructor(
    private languageService: LanguageService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private notificationsHubService: NotificationsHubService
  ) {}

  toggleMenu(item: MenuItem, event?: Event) {
    // Prevent closing when clicking on the menu item itself
    if (event) {
      event.stopPropagation();
    }

    // Only toggle if item has children
    if (item.children && item.children.length > 0) {
      item.isOpen = !item.isOpen;
      // Set active item only when opening, clear when closing
      if (item.isOpen) {
        this.activeItem = item;
      } else {
        this.activeItem = null;
      }
    }
  }
  ngOnInit() {
    if (this.authService.userPermissions.includes(this.PermissionsObj.CreateNewsPost)) {
      this.menu
        .filter((item) => item.label === 'الخدمات الإلكترونية')[0]
        .children.push(
          { label: 'shared.allNews', icon: 'menu-policy', route: '/latest-news' },
          { label: 'shared.policies', icon: 'menu-policy', route: '/policies-admin' }
        );
    }
  }

  closeAllMenus() {
    this.menu.forEach((item) => {
      if (item.children) {
        item.isOpen = false;
      }
    });
    this.activeItem = null;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeAllMenus();
  }
}
