import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RegularReportsListComponent} from './pages/regular-reports-list/regular-reports-list.component';
import {AddRegularReportComponent} from './pages/add-regular-report/add-regular-report.component';

const routes: Routes = [
  {
    path: '',
    component: RegularReportsListComponent,
  },
  {
    path: 'add',
    component: AddRegularReportComponent,
  }, {
    path: 'edit/:id',
    component: AddRegularReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegularReportsRoutingModule {
}
