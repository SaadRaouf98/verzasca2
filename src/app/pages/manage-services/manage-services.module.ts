import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageServicesRoutingModule } from './manage-services-routing.module';
import { AllServicesPage } from './pages/all-services/all-services.page';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [AllServicesPage],
  imports: [CommonModule, ManageServicesRoutingModule, SharedModule],
})
export class ManageServicesModule {}
