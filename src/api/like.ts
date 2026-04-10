/**
 * 点赞 API（通用）
 */
import { get, post } from './request'
import type {
  LikeTarget,
  LikeRequest,
  LikeResponse,
  LikeCheckResponse,
  LikeCountResponse,
} from './types'

/**
 * 点赞/取消点赞（toggle）
 */
export function toggle_like(data: LikeRequest): Promise<LikeResponse> {
  return post<LikeResponse>('/likes', data)
}

/**
 * 检查是否已点赞
 */
export function check_like(params: {
  target_type: LikeTarget
  target_id?: string
}): Promise<LikeCheckResponse> {
  return get<LikeCheckResponse>('/likes/check', { params })
}

/**
 * 获取点赞数
 */
export function get_like_count(params: {
  target_type: LikeTarget
  target_id?: string
}): Promise<LikeCountResponse> {
  return get<LikeCountResponse>('/likes/count', { params })
}
