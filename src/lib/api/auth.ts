import { api } from '@/lib/api-client';
import type {
  LoginStep1Response,
  TokenPair,
  AuthUser,
  TotpSetupResponse,
  TotpDisableRequest,
} from '@/lib/types/auth';
import type { ApiMessageResponse } from '@/lib/types/api';

export function login(email: string, password: string) {
  return api.post<LoginStep1Response>('/api/auth/login', { email, password });
}

export function login_2fa(temp_token: string, code: string) {
  return api.post<TokenPair>('/api/auth/login/2fa', { temp_token, code });
}

export function login_verify(temp_token: string, code: string) {
  return api.post<TokenPair>('/api/auth/login/verify', { temp_token, code });
}

export function register(username: string, email: string, password: string) {
  return api.post<AuthUser>('/api/auth/register', { username, email, password });
}

export function refresh_token(refresh: string) {
  return api.post<TokenPair>('/api/auth/refresh', { refresh_token: refresh });
}

export function logout(refresh: string) {
  return api.post<ApiMessageResponse>('/api/auth/logout', { refresh_token: refresh });
}

export function get_me() {
  return api.get<AuthUser>('/api/auth/me');
}

export function setup_2fa() {
  return api.post<TotpSetupResponse>('/api/auth/2fa/setup');
}

export function verify_2fa(code: string) {
  return api.post<ApiMessageResponse>('/api/auth/2fa/verify', { code });
}

export function disable_2fa(data: TotpDisableRequest) {
  return api.post<ApiMessageResponse>('/api/auth/2fa/disable', data);
}
