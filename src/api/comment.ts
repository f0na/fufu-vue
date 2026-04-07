/**
 * 评论 API
 */
import { get, post, del, patch, upload } from './request'
import type {
  Comment,
  CreateCommentRequest,
  CreateGuestCommentRequest,
  CommentListResponse,
  PaginatedData,
  CommentTarget,
  UploadResponse,
  SensitiveWord,
} from './types'

// ========== 公开接口 ==========

/**
 * 获取评论列表
 */
export function get_comments(params: {
  target_type: CommentTarget
  target_id: string
  page?: number
  per_page?: number
}): Promise<CommentListResponse> {
  return get<CommentListResponse>('/comments', { params })
}

/**
 * 发布评论（登录用户）
 */
export function create_comment(data: CreateCommentRequest): Promise<Comment> {
  return post<Comment>('/comments', data)
}

/**
 * 发布评论（游客）
 */
export function create_guest_comment(data: CreateGuestCommentRequest): Promise<Comment> {
  return post<Comment>('/comments', data)
}

/**
 * 上传评论图片
 */
export function upload_comment_image(file: File): Promise<UploadResponse> {
  return upload<UploadResponse>('/comments/images', file)
}

// ========== 管理接口 ==========

/**
 * 获取所有评论列表（管理员）
 */
export function get_admin_comments(params?: {
  target_type?: CommentTarget
  target_id?: string
  status?: string
  keyword?: string
  page?: number
  per_page?: number
}): Promise<PaginatedData<Comment>> {
  return get<PaginatedData<Comment>>('/admin/comments', { params })
}

/**
 * 删除评论（管理员）
 */
export function delete_comment(id: string): Promise<void> {
  return del(`/admin/comments/${id}`)
}

/**
 * 修改评论状态（管理员）
 */
export function update_comment_status(id: string, status: 'normal' | 'hidden'): Promise<Comment> {
  return patch<Comment>(`/admin/comments/${id}/status`, { status })
}

// ========== 敏感词管理接口 ==========

/**
 * 获取敏感词列表（管理员）
 */
export function get_sensitive_words(params?: {
  level?: 'filter' | 'hide'
  keyword?: string
  page?: number
  per_page?: number
}): Promise<PaginatedData<SensitiveWord>> {
  return get<PaginatedData<SensitiveWord>>('/admin/sensitive-words', { params })
}

/**
 * 添加敏感词（管理员）
 */
export function add_sensitive_word(word: string, level: 'filter' | 'hide'): Promise<SensitiveWord> {
  return post<SensitiveWord>('/admin/sensitive-words', { word, level })
}

/**
 * 删除敏感词（管理员）
 */
export function delete_sensitive_word(id: string): Promise<void> {
  return del(`/admin/sensitive-words/${id}`)
}
