/**
 * 用户相关 API
 * 基于后端 API 接口文档 v1
 */
import { get, patch, post, del } from './request'
import type {
  UserProfile,
  UserSettings,
  MenuItem,
  PaginatedData,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from './types'

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

// ========== 菜单管理接口 ==========

// 获取菜单列表（管理视角，包含隐藏项）
export function get_admin_menu(): Promise<MenuItem[]> {
  return get<MenuItem[]>('/admin/menu')
}

// 创建菜单项
export function create_menu_item(data: CreateMenuItemRequest): Promise<MenuItem> {
  return post<MenuItem>('/admin/menu', data)
}

// 更新菜单项
export function update_menu_item(id: string, data: UpdateMenuItemRequest): Promise<MenuItem> {
  return patch<MenuItem>(`/admin/menu/${id}`, data)
}

// 删除菜单项
export function delete_menu_item(id: string): Promise<void> {
  return del(`/admin/menu/${id}`)
}

// 切换菜单项可见性
export function toggle_menu_visibility(
  id: string,
  visible: boolean,
): Promise<{ id: string; visible: boolean }> {
  return patch(`/admin/menu/${id}/visibility`, { visible })
}
