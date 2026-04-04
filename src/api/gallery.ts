/**
 * 相册相关 API
 * 基于后端 API 接口文档 v1
 */
import { get, post, patch, del, upload } from './request'
import type {
    Gallery,
    GalleryWithPhotos,
    Photo,
    PhotoUpdate,
    PaginatedData,
    UploadResponse,
    CreateGalleryRequest,
    UpdateGalleryRequest,
} from './types'

// ========== 公开接口 ==========

// 获取相册列表（分页）
export interface FetchGalleriesParams {
    page?: number
    per_page?: number
}

export function fetch_galleries(params: FetchGalleriesParams = {}): Promise<PaginatedData<Gallery>> {
    const { page = 1, per_page = 10 } = params
    return get<PaginatedData<Gallery>>(`/galleries?page=${page}&per_page=${per_page}`)
}

// 获取单个相册详情（含照片）
export function fetch_gallery(id: string): Promise<GalleryWithPhotos> {
    return get<GalleryWithPhotos>(`/galleries/${id}`)
}

// ========== 管理接口 ==========

// 创建相册
export function create_gallery(data: CreateGalleryRequest): Promise<Gallery> {
    return post<Gallery>('/admin/galleries', data)
}

// 更新相册
export function update_gallery(id: string, data: UpdateGalleryRequest): Promise<Gallery> {
    return patch<Gallery>(`/admin/galleries/${id}`, data)
}

// 删除相册
export function delete_gallery(id: string): Promise<void> {
    return del(`/admin/galleries/${id}`)
}

// 切换相册可见性
export function toggle_gallery_visibility(id: string, visible: boolean): Promise<{ id: string; visible: boolean }> {
    return patch(`/admin/galleries/${id}/visibility`, { visible })
}

// ========== 照片管理 ==========

// 上传照片到相册（一步式）
export interface UploadPhotoParams {
    gallery_id: string
    file: File
    x?: number
    y?: number
    rotation?: number
    width?: number
    height?: number
}

export async function upload_photo(params: UploadPhotoParams): Promise<Photo> {
    const { gallery_id, file, ...extra } = params
    return upload<Photo>(`/admin/galleries/${gallery_id}/photos`, file, extra)
}

// 批量更新照片布局
export function update_photos_layout(gallery_id: string, photos: PhotoUpdate[]): Promise<{ updated: number }> {
    return patch(`/admin/galleries/${gallery_id}/photos`, { photos })
}

// 更新单张照片
export function update_photo(photo_id: string, data: Partial<PhotoUpdate>): Promise<Photo> {
    return patch<Photo>(`/admin/photos/${photo_id}`, data)
}

// 删除照片
export function delete_photo(photo_id: string): Promise<void> {
    return del(`/admin/photos/${photo_id}`)
}