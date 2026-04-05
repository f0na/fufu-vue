/**
 * 友人帐 API
 */
import { get, post, del, patch } from './request'
import type { Friend, ApplyFriendRequest, PaginatedData, FriendStatus } from './types'

// ========== 公开接口 ==========

/**
 * 获取友链列表（仅返回活跃状态的友链）
 */
export function get_friends(): Promise<Friend[]> {
    return get<Friend[]>('/friends')
}

/**
 * 申请添加友链（无需登录）
 */
export function apply_friend(data: ApplyFriendRequest): Promise<Friend> {
    return post<Friend>('/friends/apply', data)
}

// ========== 管理接口 ==========

/**
 * 获取友链列表（管理员，含申请）
 */
export function get_admin_friends(params?: {
    status?: FriendStatus
    page?: number
    per_page?: number
}): Promise<PaginatedData<Friend>> {
    return get<PaginatedData<Friend>>('/admin/friends', { params })
}

/**
 * 添加友链（管理员）
 */
export function add_friend(data: {
    name: string
    url: string
    description?: string
    sort_order?: number
}): Promise<Friend> {
    return post<Friend>('/admin/friends', data)
}

/**
 * 更新友链（管理员）
 */
export function update_friend(id: string, data: {
    name?: string
    url?: string
    description?: string
    status?: FriendStatus
}): Promise<Friend> {
    return patch<Friend>(`/admin/friends/${id}`, data)
}

/**
 * 更新友链状态（管理员）
 * 批准申请: status = 'active'
 * 拒绝申请: status = 'inactive'
 */
export function update_friend_status(id: string, status: FriendStatus): Promise<Friend> {
    return patch<Friend>(`/admin/friends/${id}/status`, { status })
}

/**
 * 删除友链（管理员）
 */
export function delete_friend(id: string): Promise<void> {
    return del(`/admin/friends/${id}`)
}