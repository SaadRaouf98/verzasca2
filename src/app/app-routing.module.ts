import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnderconstructionPage } from '@core/ui/pages/underconstruction/underconstruction.page';
import { HomeComponent } from '@pages/home/home/home.page';
import { LogoutGuard } from '@core/guards/logout.guard';
import { content } from '@shared/routes/content.routes';
import { AuthGuard } from '@core/guards/auth.guard';
import { ContainerComponent } from '@core/layout/components/container/container.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: ContainerComponent,
    canActivate: [AuthGuard],
    children: content,
  },

  {
    path: '**',
    redirectTo: 'under-construction',
    pathMatch: 'full',
  },

  //////////////////////////////////////////////////////////////

  // -------------------- Auxiliary Routes --------------------

  {
    path: 'under-construction',
    component: UnderconstructionPage,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
