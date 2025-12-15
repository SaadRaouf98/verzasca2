import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteesRoutingModule } from './committees-routing.module';
import { CommitteesListComponent } from './pages/committees-list/committees-list.component';
import { AddCommitteeComponent } from './pages/add-committee/add-committee.component';
import { SharedModule } from '@shared/shared.module';
import { ViewMembersComponent } from './pages/view-members/view-members.component';
import { InternalDepartmentsDivisionsListComponent } from './pages/internal-departments-divisions-list/internal-departments-divisions-list.component';
import { AddInternalDepartmentDivisionComponent } from './pages/add-internal-department-division/add-internal-department-division.component';
import { AddRelatedDepartmentComponent } from './components/add-related-department/add-related-department.component';
import { HisExcellencyRelatedDepartmentsListComponent } from './pages/his-excellency-related-departments-list/his-excellency-related-departments-list.component';

@NgModule({
  declarations: [
    CommitteesListComponent,
    AddCommitteeComponent,
    ViewMembersComponent,
    InternalDepartmentsDivisionsListComponent,
    AddInternalDepartmentDivisionComponent,
    AddRelatedDepartmentComponent,
    HisExcellencyRelatedDepartmentsListComponent,
  ],
  imports: [CommonModule, SharedModule, CommitteesRoutingModule],
})
export class CommitteesModule {}
