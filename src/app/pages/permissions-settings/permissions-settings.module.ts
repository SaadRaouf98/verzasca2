import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PermissionsSettingsRoutingModule } from './permissions-settings-routing.module';
import { SharedModule } from '@shared/shared.module';
import { RolesListComponent } from './pages/roles-list/roles-list.component';
import { RolePermissionsComponent } from './pages/manage-roles/manage-roles.component';

@NgModule({
  declarations: [RolesListComponent, RolePermissionsComponent],
  imports: [CommonModule, SharedModule, PermissionsSettingsRoutingModule],
})
export class PermissionsSettingsModule {}
