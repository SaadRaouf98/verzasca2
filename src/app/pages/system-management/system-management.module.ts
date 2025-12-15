import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemManagementRoutingModule } from './system-management-routing.module';
import { SystemManagementPage } from './pages/system-management/system-management.page';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [SystemManagementPage],
  imports: [CommonModule, SystemManagementRoutingModule, SharedModule],
})
export class SystemManagementModule {}
