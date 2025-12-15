import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MyProfileRoutingModule} from './my-profile-routing.module';
import {MyProfileComponent} from './pages/my-profile/my-profile.component';
import {SharedModule} from '@shared/shared.module';
import {
  NumbersAndTransactionsCardComponent
} from "@pages/my-profile/components/numbers-and-transactions-card/numbers-and-transactions-card.component";
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLinkButton, NgbNavOutlet} from "@ng-bootstrap/ng-bootstrap";
import {
  AttendanceAndDepartureCardComponent
} from "@pages/my-profile/components/attendance-and-departure-card/attendance-and-departure-card.component";
import {
  UserWorkInfoCardComponent
} from "@pages/my-profile/components/user-work-info-card/user-work-info-card.component";

@NgModule({
  declarations: [MyProfileComponent, UserWorkInfoCardComponent, AttendanceAndDepartureCardComponent,NumbersAndTransactionsCardComponent],
  imports: [CommonModule, SharedModule, MyProfileRoutingModule, NgbNav, NgbNavLinkButton, NgbNavContent, NgbNavItem, NgbNavOutlet],
})
export class MyProfileModule {
}
