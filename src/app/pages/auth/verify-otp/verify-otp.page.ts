import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { markInvalidFormControls } from '@core/utils';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.page.html',
  styleUrls: ['./verify-otp.page.scss'],
})
export class VerifyOtpPage implements OnInit {
  form!: FormGroup;
  disableLoginBtn = false;
  disableSendCodeBtn = true;
  failedLogin: boolean = false;
  phoneNumber: string = '';
  readonly otpLength = 6;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.phoneNumber = this.authService.getPhoneNumber();
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      otp: new FormControl('', [
        Validators.required,
        Validators.minLength(this.otpLength),
        Validators.maxLength(this.otpLength),
      ]),
    });
  }

  get otp(): FormControl {
    return this.form.get('otp') as FormControl;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.disableLoginBtn = true;
    const { otp } = this.form.value;
    this.authService.verifyOtp(otp).subscribe({
      next: (status) => {
        if (status) {
          this.navigateUserIntoSystem();
        }
      },
      error: (e) => {
        this.disableLoginBtn = false;
        this.disableSendCodeBtn = false;
      },
    });
  }

  resendCode(): void {
    this.disableSendCodeBtn = true;
    this.authService.resendCode().subscribe({
      next: (status) => {
        if (status) {
          this.disableSendCodeBtn = false;
        }
      },
      error: (e) => {
        this.disableSendCodeBtn = false;
      },
    });
  }

  tryLoginAgain(): void {}

  private navigateUserIntoSystem(): void {
    const redirectURL =
      this.activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/';

    this.router.navigate([redirectURL]).then();
  }
}
