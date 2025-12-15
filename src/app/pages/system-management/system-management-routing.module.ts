import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemManagementPage } from './pages/system-management/system-management.page';

const routes: Routes = [
  {
    path: '',
    component: SystemManagementPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemManagementRoutingModule {}
