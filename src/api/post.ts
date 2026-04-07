/**
 * 文章 API
 */
import { get, post, patch, del } from './request'
import type {
  Post,
  PostDetail,
  PostStatus,
  ArchiveGroup,
  TagCount,
  CategoryCount,
  CreatePostRequest,
  UpdatePostRequest,
  UpdatePostStatusRequest,
  UpdatePostTopRequest,
  PaginatedData,
} from './types'

// ========== 公开接口 ==========

/**
 * 获取文章列表
 */
export function get_posts(params?: {
  page?: number
  per_page?: number
  tag?: string
  category?: string
  keyword?: string
}): Promise<PaginatedData<Post>> {
  return get<PaginatedData<Post>>('/posts', { params })
}

/**
 * 获取文章详情（支持 ID 或 slug）
 */
export function get_post(id_or_slug: string): Promise<PostDetail> {
  return get<PostDetail>(`/posts/${id_or_slug}`)
}

/**
 * 获取归档列表
 */
export function get_archive(params?: {
  year?: number
  tag?: string
}): Promise<ArchiveGroup[]> {
  return get<ArchiveGroup[]>('/posts/archive', { params })
}

/**
 * 获取标签统计
 */
export function get_tags(): Promise<TagCount[]> {
  return get<TagCount[]>('/posts/tags')
}

/**
 * 获取分类统计
 */
export function get_categories(): Promise<CategoryCount[]> {
  return get<CategoryCount[]>('/posts/categories')
}

// ========== 管理接口 ==========

/**
 * 获取文章列表（管理员，含所有状态）
 */
export function get_admin_posts(params?: {
  page?: number
  per_page?: number
  status?: PostStatus
  tag?: string
  category?: string
  keyword?: string
}): Promise<PaginatedData<Post>> {
  return get<PaginatedData<Post>>('/admin/posts', { params })
}

/**
 * 创建文章
 */
export function create_post(data: CreatePostRequest): Promise<PostDetail> {
  return post<PostDetail>('/admin/posts', data)
}

/**
 * 更新文章
 */
export function update_post(id: string, data: UpdatePostRequest): Promise<PostDetail> {
  return patch<PostDetail>(`/admin/posts/${id}`, data)
}

/**
 * 删除文章
 */
export function delete_post(id: string): Promise<void> {
  return del(`/admin/posts/${id}`)
}

/**
 * 切换文章状态
 */
export function update_post_status(id: string, data: UpdatePostStatusRequest): Promise<Post> {
  return patch<Post>(`/admin/posts/${id}/status`, data)
}

/**
 * 切换置顶
 */
export function update_post_top(id: string, data: UpdatePostTopRequest): Promise<Post> {
  return patch<Post>(`/admin/posts/${id}/top`, data)
}