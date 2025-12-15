import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestTypesListComponent } from './pages/request-types-list/request-types-list.component';
import { AddRequestTypeComponent } from './pages/add-request-type/add-request-type.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';

const routes: Routes = [
  {
    path: '',
    component: RequestTypesListComponent,
  },
  {
    path: 'add',
    component: AddRequestTypeComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateRequestType,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id/edit',
    component: AddRequestTypeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestTypesRoutingModule {}
