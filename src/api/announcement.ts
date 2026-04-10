/**
 * 公告相关 API
 * 基于后端 API 接口文档 v1
 */
import { get, post, patch, del } from './request'
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  PaginatedData,
} from './types'

// ========== 公开接口 ==========

// 获取公告列表
export function fetch_announcements(limit: number = 10): Promise<Announcement[]> {
  return get<Announcement[]>(`/announcements?limit=${limit}`)
}

// ========== 管理接口 ==========

// 获取公告列表（管理视角，包含隐藏项）
export function get_admin_announcements(params?: {
  visible?: boolean
  page?: number
  per_page?: number
}): Promise<PaginatedData<Announcement>> {
  return get<PaginatedData<Announcement>>('/admin/announcements', { params })
}

// 创建公告
export function create_announcement(data: CreateAnnouncementRequest): Promise<Announcement> {
  return post<Announcement>('/admin/announcements', data)
}

// 更新公告
export function update_announcement(
  id: string,
  data: UpdateAnnouncementRequest,
): Promise<Announcement> {
  return patch<Announcement>(`/admin/announcements/${id}`, data)
}

// 删除公告
export function delete_announcement(id: string): Promise<void> {
  return del(`/admin/announcements/${id}`)
}

// 切换公告可见性
export function toggle_announcement_visibility(
  id: string,
  visible: boolean,
): Promise<{ id: string; visible: boolean }> {
  return patch(`/admin/announcements/${id}/visibility`, { visible })
}
