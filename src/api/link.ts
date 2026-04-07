/**
 * 链接 API
 */
import { get, post, del, patch } from './request'
import type { Link, CreateLinkRequest, UpdateLinkRequest, PaginatedData } from './types'

// ========== 公开接口 ==========

/**
 * 获取链接列表
 */
export function get_links(params?: {
  page?: number
  per_page?: number
  tag?: string
}): Promise<PaginatedData<Link>> {
  return get<PaginatedData<Link>>('/links', { params })
}

/**
 * 获取单个链接详情
 */
export function get_link(id: string): Promise<Link> {
  return get<Link>(`/links/${id}`)
}

// ========== 管理接口 ==========

/**
 * 获取链接列表（管理员，含隐藏链接）
 */
export function get_admin_links(params?: {
  page?: number
  per_page?: number
  tag?: string
  visible?: boolean
}): Promise<PaginatedData<Link>> {
  return get<PaginatedData<Link>>('/admin/links', { params })
}

/**
 * 创建链接（管理员）
 */
export function create_link(data: CreateLinkRequest): Promise<Link> {
  return post<Link>('/admin/links', data)
}

/**
 * 更新链接（管理员）
 */
export function update_link(id: string, data: UpdateLinkRequest): Promise<Link> {
  return patch<Link>(`/admin/links/${id}`, data)
}

/**
 * 删除链接（管理员）
 */
export function delete_link(id: string): Promise<void> {
  return del(`/admin/links/${id}`)
}

/**
 * 切换链接可见性（管理员）
 */
export function toggle_link_visibility(
  id: string,
  visible: boolean,
): Promise<{ id: string; visible: boolean }> {
  return patch<{ id: string; visible: boolean }>(`/admin/links/${id}/visibility`, { visible })
}
