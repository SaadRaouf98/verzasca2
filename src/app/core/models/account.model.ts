import { LoginUserTokenStatus } from '@core/enums/login-user-token-status.enum';

export interface Account {
  id: string;
  phoneNumber: string;
  tokenStatus: LoginUserTokenStatus;
  userToken: UserToken | null;
}
export interface UserToken {
  id: string;
  name: string;
  token: string;
  refreshToken: string;
}
export interface RenewToken {
  id: string;
  name: string;
  token: string;
  refreshToken: string;
}
