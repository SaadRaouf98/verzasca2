import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommitteesListComponent } from './pages/committees-list/committees-list.component';
import { AddCommitteeComponent } from './pages/add-committee/add-committee.component';
import { ViewMembersComponent } from './pages/view-members/view-members.component';
import { InternalDepartmentsDivisionsListComponent } from './pages/internal-departments-divisions-list/internal-departments-divisions-list.component';
import { AddInternalDepartmentDivisionComponent } from './pages/add-internal-department-division/add-internal-department-division.component';
import { HisExcellencyRelatedDepartmentsListComponent } from './pages/his-excellency-related-departments-list/his-excellency-related-departments-list.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';

const routes: Routes = [
  {
    path: '',
    component: CommitteesListComponent,
  },
  {
    path: 'add',
    component: AddCommitteeComponent,
    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateOrganizationStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id/edit',
    component: AddCommitteeComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.UpdateOrganizationStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id/members',
    component: ViewMembersComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.UpdateOrganizationStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id/members/:memberId/departments',
    component: HisExcellencyRelatedDepartmentsListComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.ViewOrganizationsStructure,
        redirectTo: '/home',
      },
    },
  },
  //////////////////////////////
  {
    path: ':committeeId/inner-divisions',
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
    path: ':committeeId/inner-divisions/add',
    component: AddInternalDepartmentDivisionComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.CreateOrganizationStructure,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':committeeId/inner-divisions/:id/edit',
    component: AddInternalDepartmentDivisionComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.UpdateOrganizationStructure,
        redirectTo: '/home',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommitteesRoutingModule {}
