import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private location = inject(Location);
  iconActions = [
    {
      icon: 'operationUrl',
      label: 'ImportsExportsModule.RequestDetailsComponent.operationUrl',
      callback: () => this.onOperationUrl(),
    },
    {
      icon: 'settings',
      label: 'ImportsExportsModule.RequestDetailsComponent.settings',
      callback: () => this.onSettings(),
    },
    {
      icon: 'share',
      label: 'ImportsExportsModule.RequestDetailsComponent.share',
      callback: () => this.onShare(),
    },
    {
      icon: 'printer',
      label: 'ImportsExportsModule.RequestDetailsComponent.printer',
      callback: () => this.onPrinter(),
    },
  ];
  onNavigateBack(): void {
    this.location.back();
  }
  onOperationUrl() {
    /* ... */
  }
  onSettings() {
    /* ... */
  }
  onShare() {
    /* ... */
  }
  onPrinter() {
    /* ... */
  }
}
