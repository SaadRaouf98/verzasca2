import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestTypesRoutingModule } from './request-types-routing.module';
import { RequestTypesListComponent } from './pages/request-types-list/request-types-list.component';
import { AddRequestTypeComponent } from './pages/add-request-type/add-request-type.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [RequestTypesListComponent, AddRequestTypeComponent],
  imports: [CommonModule, SharedModule, RequestTypesRoutingModule],
})
export class RequestTypesModule {}
