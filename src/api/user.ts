/**
 * 用户相关 API
 * 基于后端 API 接口文档 v1
 */
import { get, patch } from './request'
import type { UserProfile, UserSettings, MenuItem } from './types'

// ========== 公开接口 ==========

// 获取用户信息
export function fetch_user_profile(): Promise<UserProfile> {
    return get<UserProfile>('/user/profile')
}

// 获取用户设置
export function fetch_user_settings(): Promise<UserSettings> {
    return get<UserSettings>('/user/settings')
}

// 获取导航菜单
export function fetch_menu(): Promise<MenuItem[]> {
    return get<MenuItem[]>('/menu')
}

// ========== 管理接口 ==========

// 更新用户设置
export function update_user_settings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return patch<UserSettings>('/admin/settings', settings)
}