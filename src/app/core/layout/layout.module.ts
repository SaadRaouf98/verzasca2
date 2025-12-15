import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NgxPermissionsModule } from 'ngx-permissions';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { FooterComponent } from '@core/layout/components/footer/footer.component';
import { HeaderComponent } from '@core/layout/components/header/header.component';
import { ContainerComponent } from '@core/layout/components/container/container.component';
import { NotificationsMenuComponent } from '@core/layout/components/notifications-menu/notifications-menu.component';
import { NavItemComponent } from '@core/layout/components/nav-item/nav-item.component';
import { LeftTopHeaderComponent } from '@core/layout/components/top-right-header/left-top-header.component';
import { SharedModule } from '@shared/shared.module';
import { TopRightHeaderComponent } from '@core/layout/components/left-top-header/top-right-header.component';
import { SlideToggleComponent } from '@shared/components/sidenav-toggle/sidenav-toggle.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ContainerComponent,
    NotificationsMenuComponent,
    NavItemComponent,
    LeftTopHeaderComponent,
    TopRightHeaderComponent,
  ],
  exports: [ContainerComponent, HeaderComponent, FooterComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatSidenavModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatToolbarModule,
    TranslateModule,
    NgxPermissionsModule.forChild(),
    MatMenuModule,
    MatBadgeModule,
    SharedModule,
    SlideToggleComponent,
  ],
})
export class LayoutModule {}
