import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth.routing.module';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';
import { SharedModule } from '@shared/shared.module';
import { VerifyOtpPage } from './verify-otp/verify-otp.page';
import { NgOtpInputModule } from 'ng-otp-input';
import {LayoutModule} from "@core/layout/layout.module";

@NgModule({
  declarations: [LoginPage, VerifyOtpPage, RegisterPage],
    imports: [CommonModule, AuthRoutingModule, SharedModule, NgOtpInputModule, LayoutModule],

})
export class AuthModule {}
