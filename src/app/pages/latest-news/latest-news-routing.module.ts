import { LatestNewsListComponent } from './pages/latest-news-list/latest-news-list.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddLatestNewsComponent } from './pages/add-latest-news/add-latest-news.component';

const routes: Routes = [
  {
    path: '',
    component: LatestNewsListComponent,
  },
  {
    path: 'add',
    component: AddLatestNewsComponent,
  },
  {
    path: ':id/edit',
    component: AddLatestNewsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LatestNewsRoutingModule {}
