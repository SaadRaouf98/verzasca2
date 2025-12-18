import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecordsListComponent } from './pages/records-list/records-list.component';
import { RecordDetailsComponent } from './pages/record-details/record-details.component';
import { RecordFileViewerComponent } from './pages/record-file-viewer/record-file-viewer.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'active',
    pathMatch: 'full',
  },
  {
    path: 'all',
    component: RecordsListComponent,
  },
   {
    path: 'active',
    component: RecordsListComponent,
  },
  {
    path: 'all/:id',
    component: RecordDetailsComponent,
  },
  {
    path: 'active/:id',
    component: RecordDetailsComponent,
  },
  {
    path: ':id/record-file',
    component: RecordFileViewerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageRecordsRoutingModule {}
