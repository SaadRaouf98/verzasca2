import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';
import { DepartmentsListComponent } from './pages/departments-list/departments-list.component';
import { AddDepartmentComponent } from './pages/add-department/add-department.component';
import { InternalDepartmentsDivisionsListComponent } from './pages/internal-departments-divisions-list/internal-departments-divisions-list.component';
import { AddInternalDepartmentDivisionComponent } from './pages/add-internal-department-division/add-internal-department-division.component';
import { AddSecretariatComponent } from './pages/add-secretariat/add-secretariat.component';
import { SecretariatStructureComponent } from './pages/secretariat-structure/secretariat-structure.component';
import { SecretariatsListComponent } from './pages/secretariats-list/secretariats-list.component';
import { SecretarialRoutingModule } from './secretariats-routing.module';
import { ViewEmployeesComponent } from './pages/view-employees/view-employees.component';

@NgModule({
  declarations: [
    SecretariatStructureComponent,
    SecretariatsListComponent,
    AddSecretariatComponent,
    DepartmentsListComponent,
    AddDepartmentComponent,
    InternalDepartmentsDivisionsListComponent,
    AddInternalDepartmentDivisionComponent,
    ViewEmployeesComponent,
  ],
  imports: [CommonModule, SharedModule, SecretarialRoutingModule],
})
export class SecretariatsModule {}
