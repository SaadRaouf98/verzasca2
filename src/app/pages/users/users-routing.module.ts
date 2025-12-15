import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from './pages/users-list/users-list.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { UserPermissionsComponent } from './pages/user-permissions/user-permissions.component';
import { UpdateMainSectionComponent } from './pages/update-main-section/update-main-section.component';

const routes: Routes = [
  {
    path: '',
    component: UsersListComponent,
  },
  {
    path: ':id',
    component: UserPermissionsComponent,

    canActivate: [NgxPermissionsGuard],
    /*  data: {
      permissions: {
        only: PermissionsObj.ModifyUserPermissions,
        redirectTo: '/home',
      },
    }, */
  },

  {
    path: ':id/update-main-section',
    component: UpdateMainSectionComponent,

    data: {
      permissions: {
        only: PermissionsObj.UpdateOrganizationStructure,
        redirectTo: '/home',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
