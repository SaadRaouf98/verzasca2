import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private ngxPermissionsService: NgxPermissionsService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    if (state.url.startsWith('/auth/login')) {
      return true;
    }

    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { redirectURL: state.url },
      });
    }

    return this.authService
      .setCurrentUserPermissions()
      .toPromise()
      .then((res) => {
        this.ngxPermissionsService.loadPermissions(res as string[]);
        return true;
      })
      .catch(() => false);
  }
}
