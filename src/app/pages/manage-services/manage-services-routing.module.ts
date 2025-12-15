import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllServicesPage } from './pages/all-services/all-services.page';

const routes: Routes = [
  {
    path: '',
    component: AllServicesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageServicesRoutingModule {}
