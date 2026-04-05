/**
 * 番剧 API
 */
import { get, post, del, patch } from './request'
import type { Bangumi, BangumiStatus, PaginatedData, CreateBangumiRequest, UpdateBangumiRequest } from './types'

// ========== 公开接口 ==========

/**
 * 获取番剧列表
 */
export function get_bangumi(params?: {
    page?: number
    per_page?: number
    status?: BangumiStatus
}): Promise<PaginatedData<Bangumi>> {
    return get<PaginatedData<Bangumi>>('/bangumi', { params })
}

/**
 * 获取单个番剧详情
 */
export function get_bangumi_detail(id: string): Promise<Bangumi> {
    return get<Bangumi>(`/bangumi/${id}`)
}

// ========== 管理接口 ==========

/**
 * 添加番剧（管理员）
 */
export function add_bangumi(data: CreateBangumiRequest): Promise<Bangumi> {
    return post<Bangumi>('/admin/bangumi', data)
}

/**
 * 更新番剧（管理员）
 */
export function update_bangumi(id: string, data: UpdateBangumiRequest): Promise<Bangumi> {
    return patch<Bangumi>(`/admin/bangumi/${id}`, data)
}

/**
 * 更新番剧观看状态（管理员）
 */
export function update_bangumi_status(id: string, status: BangumiStatus): Promise<Bangumi> {
    return patch<Bangumi>(`/admin/bangumi/${id}/status`, { status })
}

/**
 * 切换番剧可见性（管理员）
 */
export function toggle_bangumi_visibility(id: string, visible: boolean): Promise<Bangumi> {
    return patch<Bangumi>(`/admin/bangumi/${id}/visibility`, { visible })
}

/**
 * 删除番剧（管理员）
 */
export function delete_bangumi(id: string): Promise<void> {
    return del(`/admin/bangumi/${id}`)
}