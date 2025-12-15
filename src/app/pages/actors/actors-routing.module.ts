import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddActorComponent } from './pages/add-actor/add-actor.component';
import { ActorsListComponent } from './pages/actors-list/actors-list.component';
import { NgxPermissionsGuard, ngxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';

const routes: Routes = [
  {
    path: '',
    component: ActorsListComponent,
  },
  {
    path: 'add',
    component: AddActorComponent,

    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateActor,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id/edit',
    component: AddActorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActorsRoutingModule {}
