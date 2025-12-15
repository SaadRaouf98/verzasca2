import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersListComponent } from './pages/users-list/users-list.component';
import { SharedModule } from '@shared/shared.module';
import { UserPermissionsComponent } from './pages/user-permissions/user-permissions.component';
import { UpdateMainSectionComponent } from './pages/update-main-section/update-main-section.component';
import {UserLogsDialogComponent} from "@pages/users/components/user-logs-dialog/user-logs-dialog.component";

@NgModule({
  declarations: [UsersListComponent, UserPermissionsComponent, UpdateMainSectionComponent,UserLogsDialogComponent],
  imports: [CommonModule, SharedModule, UsersRoutingModule],
})
export class UsersModule {}
