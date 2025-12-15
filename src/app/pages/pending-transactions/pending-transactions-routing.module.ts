import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingTransactionsListPage } from './pages/pending-transactions-list/pending-transactions-list.page';
import { RequestDetailsComponent } from '@pages/imports-exports/pages/request-details/request-details.component';
import { ExportableDocumentDetailsComponent } from '@pages/imports-exports/pages/exportable-document-details/exportable-document-details.component';
import { PendingRequestListComponent } from '@features/containers/pending-request/pending-request-list/pending-request-list.component';

const routes: Routes = [
  {
    path: '',
    // component: PendingTransactionsListPage,
    component: PendingRequestListComponent,
  },
  {
    path: ':id', //تفاصيل الوارد
    component: RequestDetailsComponent,
  },
  {
    path: ':id/exportable-document-details', //تفاصيل الصادر
    component: ExportableDocumentDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PendingTransactionsRoutingModule {}
