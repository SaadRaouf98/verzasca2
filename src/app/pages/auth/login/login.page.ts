import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '@core/services/auth/auth.service';
import { NotificationsHubService } from '@core/services/backend-services/notifications-hub.service';
import { CustomToastrService } from '@core/services/custom-toastr.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  passwordInput = {
    type: 'password' as 'text' | 'password',
    iconSrc: 'assets/icons/eye-opened.png',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: CustomToastrService,
    private notificationsHubService: NotificationsHubService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      rememberMe: new FormControl(true),
    });
  }

  get userName(): FormControl {
    return this.loginForm.get('userName') as FormControl;
  }

  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  onSubmit(): void {
    if (!this.loginForm.valid) return;

    this.isLoading = true;
    const { userName, password } = this.loginForm.value;

    this.authService.login({ userName, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response) {
          this.handleSuccessfulLogin();
        } else {
          this.router.navigate(['auth', 'verify-otp']);
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('خطأ في البيانات المدخلة');
      },
    });
  }

  togglePasswordVisibility(): void {
    const isPassword = this.passwordInput.type === 'password';
    this.passwordInput.type = isPassword ? 'text' : 'password';
    this.passwordInput.iconSrc = isPassword
      ? 'assets/icons/eye-closed.png'
      : 'assets/icons/eye-opened.png';
  }

  // -----------------------------------------
  // --------- Private Utility Methods -------
  // -----------------------------------------

  private handleSuccessfulLogin(): void {
    this.notificationsHubService.initConnection();

    const redirectURL = this.route.snapshot.queryParamMap.get('redirectURL') || '/';

    this.router.navigateByUrl(redirectURL);
  }
}
