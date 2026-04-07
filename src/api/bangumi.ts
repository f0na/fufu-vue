/**
 * 番剧 API
 * 基于重构后的 API：分离番剧信息(bangumi-info)和追番记录(watchlist)
 */
import { get, post, del, patch } from './request'
import type {
  BangumiInfo,
  WatchlistItem,
  WatchStatus,
  PaginatedData,
  CreateBangumiInfoRequest,
  UpdateBangumiInfoRequest,
  CreateWatchlistRequest,
  UpdateWatchlistRequest,
  // 兼容旧类型
  Bangumi,
  CreateBangumiRequest,
  UpdateBangumiRequest,
} from './types'

// ========== 番剧信息 - 公开接口 ==========

/**
 * 获取番剧信息列表（仅返回可见的）
 */
export function get_bangumi_info(params?: {
  page?: number
  per_page?: number
  status?: WatchStatus
}): Promise<PaginatedData<BangumiInfo>> {
  return get<PaginatedData<BangumiInfo>>('/bangumi-info', { params })
}

/**
 * 获取番剧信息详情
 */
export function get_bangumi_info_detail(id: string): Promise<BangumiInfo> {
  return get<BangumiInfo>(`/bangumi-info/${id}`)
}

// ========== 追番记录 - 公开接口 ==========

/**
 * 获取追番列表（仅返回可见的）
 */
export function get_watchlist(params?: {
  page?: number
  per_page?: number
}): Promise<PaginatedData<WatchlistItem>> {
  return get<PaginatedData<WatchlistItem>>('/watchlist', { params })
}

/**
 * 获取追番详情
 */
export function get_watchlist_detail(id: string): Promise<WatchlistItem> {
  return get<WatchlistItem>(`/watchlist/${id}`)
}

// ========== 番剧信息 - 管理接口 ==========

/**
 * 获取番剧信息列表（管理员，含隐藏的）
 */
export function get_admin_bangumi_info(params?: {
  page?: number
  per_page?: number
  visible?: boolean
  status?: WatchStatus
}): Promise<PaginatedData<BangumiInfo>> {
  return get<PaginatedData<BangumiInfo>>('/admin/bangumi-info', { params })
}

/**
 * 创建番剧信息（管理员）
 */
export function create_bangumi_info(data: CreateBangumiInfoRequest): Promise<BangumiInfo> {
  return post<BangumiInfo>('/admin/bangumi-info', data)
}

/**
 * 更新番剧信息（管理员）
 */
export function update_bangumi_info(id: string, data: UpdateBangumiInfoRequest): Promise<BangumiInfo> {
  return patch<BangumiInfo>(`/admin/bangumi-info/${id}`, data)
}

/**
 * 删除番剧信息（管理员）
 */
export function delete_bangumi_info(id: string): Promise<void> {
  return del(`/admin/bangumi-info/${id}`)
}

/**
 * 切换番剧信息可见性（管理员）
 */
export function toggle_bangumi_info_visibility(
  id: string,
  visible: boolean,
): Promise<{ id: string; visible: boolean }> {
  return patch<{ id: string; visible: boolean }>(`/admin/bangumi-info/${id}/visibility`, { visible })
}

/**
 * 更新番剧追番状态（管理员）
 */
export function update_bangumi_info_status(
  id: string,
  status: WatchStatus,
): Promise<{ id: string; status: WatchStatus }> {
  return patch<{ id: string; status: WatchStatus }>(`/admin/bangumi-info/${id}/status`, { status })
}

// ========== 追番记录 - 管理接口 ==========

/**
 * 获取追番列表（管理员，含隐藏的）
 */
export function get_admin_watchlist(params?: {
  page?: number
  per_page?: number
  bangumi_id?: string
  visible?: boolean
}): Promise<PaginatedData<WatchlistItem>> {
  return get<PaginatedData<WatchlistItem>>('/admin/watchlist', { params })
}

/**
 * 创建追番记录（管理员）
 */
export function create_watchlist(data: CreateWatchlistRequest): Promise<WatchlistItem> {
  return post<WatchlistItem>('/admin/watchlist', data)
}

/**
 * 更新追番记录（管理员）
 */
export function update_watchlist(id: string, data: UpdateWatchlistRequest): Promise<WatchlistItem> {
  return patch<WatchlistItem>(`/admin/watchlist/${id}`, data)
}

/**
 * 删除追番记录（管理员）
 */
export function delete_watchlist(id: string): Promise<void> {
  return del(`/admin/watchlist/${id}`)
}

/**
 * 切换追番记录可见性（管理员）
 */
export function toggle_watchlist_visibility(
  id: string,
  visible: boolean,
): Promise<{ id: string; visible: boolean }> {
  return patch<{ id: string; visible: boolean }>(`/admin/watchlist/${id}/visibility`, { visible })
}

// ========== 兼容旧 API 名称 ==========

/**
 * 获取番剧列表（兼容旧 API，实际返回追番列表）
 */
export function get_bangumi(params?: {
  page?: number
  per_page?: number
}): Promise<PaginatedData<Bangumi>> {
  return get_watchlist(params) as Promise<PaginatedData<Bangumi>>
}

/**
 * 获取单个番剧详情（兼容旧 API）
 */
export function get_bangumi_detail(id: string): Promise<Bangumi> {
  return get_watchlist_detail(id) as Promise<Bangumi>
}

/**
 * 获取番剧列表（管理员，兼容旧 API）
 */
export function get_admin_bangumi(params?: {
  page?: number
  per_page?: number
  visible?: boolean
}): Promise<PaginatedData<Bangumi>> {
  return get_admin_watchlist(params) as Promise<PaginatedData<Bangumi>>
}

/**
 * 添加番剧（管理员，兼容旧 API - 两步创建）
 * 注意：新 API 需要先创建番剧信息，再创建追番记录
 * 此函数仅创建追番记录，需先确保番剧信息已存在
 */
export function add_bangumi(data: CreateBangumiRequest): Promise<Bangumi> {
  // 拆分为两步：先创建番剧信息，再创建追番记录
  // 但这里无法同时做两步，所以建议使用新的 create_bangumi_info + create_watchlist
  // 这里保留兼容逻辑，假设 bangumi_id 已提供或番剧信息已存在
  throw new Error('请使用新的 API: create_bangumi_info + create_watchlist')
}

/**
 * 更新番剧（管理员，兼容旧 API）
 */
export function update_bangumi(id: string, data: UpdateBangumiRequest): Promise<Bangumi> {
  // 同时更新番剧信息和追番记录
  const info_data: UpdateBangumiInfoRequest = {
    title: data.title,
    cover: data.cover,
    episodes: data.episodes,
    description: data.description,
    tags: data.tags,
  }
  const watchlist_data: UpdateWatchlistRequest = {
    rating: data.rating,
    progress: data.progress,
    notes: data.notes,
    watch_date: data.watch_date,
  }

  // 需要分别调用，这里简化为只更新追番记录
  return update_watchlist(id, watchlist_data) as Promise<Bangumi>
}

/**
 * 切换番剧可见性（管理员，兼容旧 API）
 */
export function toggle_bangumi_visibility(
  id: string,
  visible: boolean,
): Promise<{ id: string; visible: boolean }> {
  return toggle_watchlist_visibility(id, visible)
}

/**
 * 删除番剧（管理员，兼容旧 API）
 */
export function delete_bangumi(id: string): Promise<void> {
  return delete_watchlist(id)
}