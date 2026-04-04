/**
 * 认证相关 API
 * 基于后端 API 接口文档 v1
 */
import { get, post, save_auth_data, clear_auth_data, get_refresh_token } from './request'
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    RefreshTokenResponse,
    TwoFactorSetupResponse,
    TwoFactorCodeRequest,
    TwoFactorVerifyRequest,
    ResetPasswordRequest,
    ResetPasswordConfirmRequest,
    ResetPassword2FARequest,
    GitHubAuthUrlResponse,
    GitHubCallbackRequest,
    GitHubLoginResponse,
    GitHubBindRequest,
    GitHubBindResponse,
    AdminApplyRequest,
    AdminApplication,
    ReviewApplicationRequest,
    Manager,
    PaginatedData,
} from './types'

// ========== 注册 ==========

// 用户注册
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await post<RegisterResponse>('/auth/register', data)
    // 保存认证信息
    save_auth_data({
        token: response.token,
        refresh_token: response.refresh_token,
    })
    // 保存权限信息
    localStorage.setItem('user_permissions', JSON.stringify(response.permissions))
    return response
}

// ========== 登录/登出 ==========

// 登录
export async function login(data: LoginRequest): Promise<LoginResponse> {
    const response = await post<LoginResponse>('/auth/login', data)
    // 保存认证信息
    save_auth_data({
        token: response.token,
        refresh_token: response.refresh_token,
    })
    // 保存权限信息
    localStorage.setItem('user_permissions', JSON.stringify(response.permissions))
    return response
}

// 登出
export async function logout(): Promise<void> {
    try {
        await post('/auth/logout')
    } finally {
        clear_auth_data()
        localStorage.removeItem('user_permissions')
    }
}

// 刷新令牌
export async function refresh_token(): Promise<RefreshTokenResponse | null> {
    const refresh = get_refresh_token()
    if (!refresh) return null

    try {
        const response = await post<RefreshTokenResponse>('/auth/refresh', {
            refresh_token: refresh,
        })
        save_auth_data({
            token: response.token,
            refresh_token: response.refresh_token,
        })
        return response
    } catch {
        clear_auth_data()
        return null
    }
}

// 验证令牌
export function verify_token(): Promise<{ valid: boolean; user: { id: string; username: string } }> {
    return get('/auth/verify')
}

// ========== 两步验证 (2FA) ==========

// 生成2FA密钥
export function setup_2fa(): Promise<TwoFactorSetupResponse> {
    return post<TwoFactorSetupResponse>('/auth/2fa/setup')
}

// 启用2FA
export function enable_2fa(code: string): Promise<void> {
    return post('/auth/2fa/enable', { code })
}

// 禁用2FA
export function disable_2fa(code: string): Promise<void> {
    return post('/auth/2fa/disable', { code })
}

// 两步验证登录（第二步）- 使用临时令牌和验证码完成登录
export async function verify_2fa_login(data: TwoFactorVerifyRequest): Promise<LoginResponse> {
    const response = await post<LoginResponse>('/auth/2fa/verify', data)
    // 保存认证信息
    save_auth_data({
        token: response.token,
        refresh_token: response.refresh_token,
    })
    // 保存权限信息
    localStorage.setItem('user_permissions', JSON.stringify(response.permissions))
    return response
}

// ========== 密码重置 ==========

// 发送重置邮件
export function request_password_reset(data: ResetPasswordRequest): Promise<void> {
    return post('/auth/password/reset-request', data)
}

// 确认重置密码
export function confirm_password_reset(data: ResetPasswordConfirmRequest): Promise<void> {
    return post('/auth/password/reset-confirm', data)
}

// 2FA验证后重置密码
export function reset_password_with_2fa(data: ResetPassword2FARequest): Promise<void> {
    return post('/auth/password/reset-2fa', data)
}

// ========== GitHub OAuth ==========

// 获取GitHub授权URL
export async function get_github_auth_url(): Promise<GitHubAuthUrlResponse> {
    return get<GitHubAuthUrlResponse>('/auth/github')
}

// GitHub登录回调
export async function github_callback(data: GitHubCallbackRequest): Promise<GitHubLoginResponse> {
    const response = await post<GitHubLoginResponse>('/auth/github/callback', data)
    // 保存认证信息
    save_auth_data({
        token: response.token,
        refresh_token: response.refresh_token,
    })
    // 保存权限信息（如果有）
    const permissions = (response as LoginResponse).permissions
    if (permissions) {
        localStorage.setItem('user_permissions', JSON.stringify(permissions))
    }
    return response
}

// 绑定GitHub账号
export function bind_github(data: GitHubBindRequest): Promise<GitHubBindResponse> {
    return post<GitHubBindResponse>('/auth/github/bind', data)
}

// 解绑GitHub账号
export function unbind_github(): Promise<void> {
    return post('/auth/github/unbind')
}

// ========== 管理员申请 ==========

// 申请成为管理员
export function apply_for_admin(data: AdminApplyRequest): Promise<AdminApplication> {
    return post<AdminApplication>('/admin/apply', data)
}

// 获取我的申请记录
export function get_my_application(): Promise<AdminApplication | null> {
    return get<AdminApplication | null>('/admin/apply/me')
}

// ========== 管理员审批接口 ==========

// 获取申请列表（管理员）
export function get_admin_applications(params?: {
    status?: 'pending' | 'approved' | 'rejected'
    page?: number
    per_page?: number
}): Promise<PaginatedData<AdminApplication>> {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.page) query.set('page', String(params.page))
    if (params?.per_page) query.set('per_page', String(params.per_page))
    const query_str = query.toString()
    return get<PaginatedData<AdminApplication>>(`/admin/applications${query_str ? '?' + query_str : ''}`)
}

// 审批申请（管理员）
export function review_application(id: string, data: ReviewApplicationRequest): Promise<AdminApplication> {
    return post<AdminApplication>(`/admin/applications/${id}/review`, data)
}

// 获取管理员列表（管理员）
export function get_managers(): Promise<Manager[]> {
    return get<Manager[]>('/admin/managers')
}

// 撤销管理员权限（管理员）
export function revoke_admin(id: string): Promise<{ id: string; username: string; role: string }> {
    return post(`/admin/managers/${id}/revoke`)
}

// ========== 辅助函数 ==========

// 检查是否已登录
export function is_logged_in(): boolean {
    return !!localStorage.getItem('auth_token')
}

// 获取当前用户权限
export function get_permissions(): import('./types').AdminPermission | null {
    const stored = localStorage.getItem('user_permissions')
    if (stored) {
        try {
            return JSON.parse(stored)
        } catch {
            return null
        }
    }
    return null
}