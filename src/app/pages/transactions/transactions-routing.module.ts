import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionsListComponent } from './pages/transactions-list/transactions-list.component';
import { TransactionDetailsComponent } from './pages/transaction-details/transaction-details.component';
import { EditTransactionComponent } from './pages/edit-transaction/edit-transaction.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsObj } from '@core/constants/permissions.constant';

const routes: Routes = [
  {
    path: '',
    component: TransactionsListComponent,
  },
  {
    path: ':id/edit',
    component: EditTransactionComponent,

    canActivate: [NgxPermissionsGuard],
    data: {
      permissions: {
        only: PermissionsObj.UpdateRequestContainer,
        redirectTo: '/home',
      },
    },
  },
  {
    path: ':id',
    component: TransactionDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionsRoutingModule {}
