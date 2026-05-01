export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginStep1Response {
  temp_token: string;
  require_2fa: boolean;
  require_email_verify: boolean;
}

export interface LoginStep2Request {
  temp_token: string;
  code: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  totp_enabled: boolean;
  role: string;
  created_at: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TotpSetupResponse {
  secret: string;
  uri: string;
}

export interface TotpVerifyRequest {
  code: string;
}

export interface TotpDisableRequest {
  password: string;
}

export interface LogoutRequest {
  refresh_token: string;
}
