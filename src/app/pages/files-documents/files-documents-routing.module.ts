import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsListComponent } from './pages/documents-list/documents-list.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentsListComponent,
  },
  {
    path: ':uniqueId/:name',
    component: DocumentsListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilesDocumentsRoutingModule {}
