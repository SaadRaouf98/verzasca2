import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentsListComponent } from './pages/departments-list/departments-list.component';
import { AddDepartmentComponent } from './pages/add-department/add-department.component';
import { InternalDepartmentsDivisionsListComponent } from './pages/internal-departments-divisions-list/internal-departments-divisions-list.component';
import { AddInternalDepartmentDivisionComponent } from './pages/add-internal-department-division/add-internal-department-division.component';
import { AddSecretariatComponent } from './pages/add-secretariat/add-secretariat.component';
import { SecretariatStructureComponent } from './pages/secretariat-structure/secretariat-structure.component';
import { SecretariatsListComponent } from './pages/secretariats-list/secretariats-list.component';
import { ViewEmployeesComponent } from './pages/view-employees/view-employees.component';
import { PermissionsObj } from '@core/constants/permissions.constant';
import { NgxPermissionsGuard } from 'ngx-permissions';

const routes: Routes = [
  {
    path: '',
    component: SecretariatStructureComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewOrganizationsStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'secretarials',
    component: SecretariatsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewOrganizationsStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'secretarials/add',
    component: AddSecretariatComponent,
  },
  {
    path: 'secretarials/:id/edit',
    component: AddSecretariatComponent,
  },
  {
    path: 'secretarials/:id/employees',
    component: ViewEmployeesComponent,
  },
  //////////////////////////////////////
  {
    path: 'secretarials/:secretarialId/departments',
    component: DepartmentsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewOrganizationsStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'secretarials/:secretarialId/departments/add',
    component: AddDepartmentComponent,
  },
  {
    path: 'secretarials/:secretarialId/departments/:id/edit',
    component: AddDepartmentComponent,
  },
  //////////////////////////////////////////
  {
    path: 'secretarials/:secretarialId/departments/:departmentId/inner-divisions',
    component: InternalDepartmentsDivisionsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewOrganizationsStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: 'secretarials/:secretarialId/departments/:departmentId/inner-divisions/add',
    component: AddInternalDepartmentDivisionComponent,
  },
  {
    path: 'secretarials/:secretarialId/departments/:departmentId/inner-divisions/:id/edit',
    component: AddInternalDepartmentDivisionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecretarialRoutingModule {}
