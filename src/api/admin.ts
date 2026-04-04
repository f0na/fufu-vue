/**
 * 管理接口 - 用户资料管理
 * 基于后端 API 接口文档 v1
 */
import { get, patch, post, del, upload } from './request'
import type {
    UserProfile,
    SocialLink,
    UploadResponse,
    CreateSocialLinkRequest,
    UpdateSocialLinkRequest,
} from './types'

// 获取用户信息（管理视角）
export function fetch_admin_user(): Promise<{ id: string; name: string; avatar: string | null; greeting: string | null }> {
    return get('/admin/user')
}

// 更新用户信息
export function update_admin_user(data: { name?: string; greeting?: string; avatar?: string }): Promise<UserProfile> {
    return patch('/admin/user', data)
}

// 上传头像（一步式）
export async function upload_avatar(file: File): Promise<UploadResponse> {
    return upload<UploadResponse>('/admin/user/avatar', file)
}

// ========== 社交链接管理 ==========

// 创建社交链接
export function create_social_link(data: CreateSocialLinkRequest): Promise<SocialLink> {
    return post('/admin/user/social-links', data)
}

// 更新社交链接
export function update_social_link(id: string, data: UpdateSocialLinkRequest): Promise<SocialLink> {
    return patch(`/admin/user/social-links/${id}`, data)
}

// 删除社交链接
export function delete_social_link(id: string): Promise<void> {
    return del(`/admin/user/social-links/${id}`)
}