import {Injectable} from '@angular/core';
import {Observable, of, switchMap, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthUtils} from '@core/helpers';
import jwtDecode from 'jwt-decode';
import {
  ClearStorage,
  GetPhoneNumber,
  GetRefreshToken,
  GetToken,
  GetUserId,
  GetUserPermissions,
  RemoveAuthData,
  SetRefreshToken,
  SetToken,
  SetUserId,
  SetUserPermissions,
  setPhoneNumber,
} from '@core/utils/local-storage-data';
import {ApiService} from '../api.service';
import {Account, RenewToken, UserToken} from '@core/models/account.model';
import {ActivatedRoute, Router} from '@angular/router';
import {UsersService} from '../backend-services/users.service';
import {NgxPermissionsService} from 'ngx-permissions';
import {DetailedUser} from '@core/models/user.model';
import {LoginUserTokenStatus} from '@core/enums/login-user-token-status.enum';
import {NotificationsHubService} from '../backend-services/notifications-hub.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly apiUrl = '/api/v1/account';
  private _authenticated: boolean = false;
  private _userPermissions: string[] = [];
  private _currentUserData!: DetailedUser;
  constructor(
    private apiService: ApiService,
    private usersService: UsersService,
    private router: Router,
    private permissionsService: NgxPermissionsService
  ) {
    const permissions = this.getUserPermissions();

    if (!permissions) {
      this.signInUsingRefreshToken().subscribe();
    } else {
      this.setUserPermissions(permissions);
    }
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  set authenticated(value: boolean) {
    this._authenticated = value;
  }

  get userPermissions(): string[] {
    return this._userPermissions;
  }

  getToken(): string {
    return GetToken();
  }

  setToken(token: string): void {
    SetToken(token);
  }

  getPhoneNumber(): string {
    return GetPhoneNumber();
  }

  setPhoneNumber(phoneNumber: string): void {
    setPhoneNumber(phoneNumber);
  }

  getRefreshToken(): any {
    return GetRefreshToken();
  }

  setRefreshToken(token: string): void {
    SetRefreshToken(token);
  }

  getUserId(): string {
    return GetUserId();
  }

  setUserId(userId: string): void {
    SetUserId(userId);
  }

  getUserPermissions(): string[] {
    return GetUserPermissions();
  }

  setUserPermissions(permissions: string[]): void {
    this._userPermissions = permissions;
    this.permissionsService.loadPermissions(permissions);

    //Save in local storage
    SetUserPermissions(permissions);
  }

  logout(intendedByUser: boolean = false): void {
    RemoveAuthData();
    if (intendedByUser) {
      this.router.navigate(['auth', 'login']);
      return;
    }

    const redirectURL = window.location.pathname + window.location.search;

    this.router.navigate(['auth', 'login'], {
      queryParams: {
        redirectURL: redirectURL !== '/auth/login' ? redirectURL : null,
      },
    });
  }

  // login(data: { userName: string; password: string }): Observable<boolean> {
  //   return this.apiService.post(`${this.apiUrl}/login`, data).pipe(
  //     switchMap((response: Account) => {
  //       //
  //
  //       if (response.tokenStatus === LoginUserTokenStatus.Otp) {
  //         this.setUserId(response.id);
  //         return of(false);
  //       } else if (response.tokenStatus === LoginUserTokenStatus.Token) {
  //         this.setToken(response.userToken!.token);
  //         this.setRefreshToken(response.userToken!.refreshToken);
  //         this.setUserId(response.userToken!.id);
  //         this.setPhoneNumber(response.phoneNumber);
  //         this._authenticated = true;
  //         this.setCurrentUserPermissions().subscribe();
  //         return of(true);
  //       }
  //       return of(false);
  //     })
  //   );
  // }
  login(credentials: { userName: string; password: string }): Observable<boolean> {
    return this.apiService.post(`${this.apiUrl}/login`, credentials).pipe(
      switchMap((response: Account) => {
        switch (response.tokenStatus) {
          case LoginUserTokenStatus.Otp:
            this.setUserId(response.id);
            return of(false);

          case LoginUserTokenStatus.Token:
            const tokenInfo = response.userToken;
            if (tokenInfo) {
              this.handleTokenLogin(tokenInfo, response.phoneNumber);
              return this.setCurrentUserPermissions().pipe(
                switchMap(() => of(true))
              );
            }
            return of(false);

          default:
            return of(false);
        }
      })
    );
  }

  private handleTokenLogin(token: UserToken, phoneNumber: string): void {
    this.setToken(token.token);
    this.setRefreshToken(token.refreshToken);
    this.setUserId(token.id);
    this.setPhoneNumber(phoneNumber);
    this._authenticated = true;
  }

  signInUsingRefreshToken(): Observable<string> {
    // Renew token
    return this.apiService
      .put(`${this.apiUrl}/refresh-token`, {
        refreshToken: this.getRefreshToken(),
      })
      .pipe(
        catchError((err) => {
          this._authenticated = false;

          this.logout();
          return of('');
        }),
        switchMap((response: RenewToken) => {
          if (!response) return of('');

          // Store the access token in the local storage
          this.setToken(response.token);

          // Set the authenticated flag to true
          this._authenticated = true;
          this.setCurrentUserPermissions().subscribe();
          // Return true
          return of(response.token);
        })
      );
  }

  get user(): {
    nameid: string;
    unique_name: string;
    role: string[];
    nbf: number;
    exp: number;
    iat: number;
    iss: string;
    aud: string;
  } {
    return jwtDecode(this.getToken());
  }
  get currentUserData(): DetailedUser {
    return this._currentUserData;
  }
  set currentUserData(value: DetailedUser) {
    this._currentUserData = value;
  }
  setCurrentUserPermissions(): Observable<string[]> {
    return this.usersService.getCurrentUser().pipe(
      switchMap((data: DetailedUser) => {
        this.currentUserData = data; // Assign data to a private variable
        this.setUserPermissions(data.permissions);
        // Return true
        return of(data.permissions);
      })
    );

    /* catchError((err) => {
        this._authenticated = false;

        this.logout();
        // Return ""
        //return of(false);
      }), */
  }

  verifyOtp(otpCode: string): Observable<boolean> {
    return this.apiService
      .put(`${this.apiUrl}/otp-validation`, {
        otpCode,
      })
      .pipe(
        switchMap((response: RenewToken) => {
          //
          this.setToken(response.token);
          this.setRefreshToken(response.refreshToken);
          this.setUserId(response.id);
          this._authenticated = true;
          this.setCurrentUserPermissions().subscribe();

          return of(true);
        })
      );
  }

  resendCode(): Observable<boolean> {
    return this.apiService
      .put(`${this.apiUrl}/otp-resending`, {
        id: this.getUserId(),
      })
      .pipe(
        switchMap((response: null) => {
          return of(true);
        })
      );
  }

  isLoggedIn(): Observable<boolean> {
    // Check if the user is logged in
    if (this._authenticated) {
      return of(true);
    }

    // Check the access token availability
    if (!this.getToken()) {
      return of(false);
    }

    // Check the access token expire date
    if (
      AuthUtils.isTokenExpired(this.getToken()) &&
      AuthUtils.isTokenExpired(this.getRefreshToken())
    ) {
      return of(false);
    }

    return of(true);
  }
}


