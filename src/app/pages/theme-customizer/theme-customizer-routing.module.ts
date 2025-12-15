import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ngxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';
import {ThemeComponent} from "@pages/theme-customizer/pages/theme/theme.component";

const routes: Routes = [
  {
    path: '',
    component: ThemeComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.AddNewIosVersion,
        redirectTo: '/home',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemeCustomizerRoutingModule {}
