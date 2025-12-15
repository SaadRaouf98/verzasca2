import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesListComponent } from './pages/roles-list/roles-list.component';
import { RolePermissionsComponent } from './pages/manage-roles/manage-roles.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';

const routes: Routes = [
  {
    path: '',
    component: RolesListComponent,
  },
  {
    path: ':id',
    component: RolePermissionsComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ModifyRolePermissions,
        redirectTo: '/home',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PermissionsSettingsRoutingModule {}
