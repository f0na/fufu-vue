/**
 * API 配置
 */

// API 基础 URL (v1)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// 是否启用 Mock 数据（开发时使用）
export const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK === 'true'

// 上传文件大小限制 (bytes)
export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024 // 20MB

// 支持的图片格式
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// Token 有效期（秒）
export const TOKEN_EXPIRES_IN = 7200 // 2小时

// 刷新令牌有效期（秒）
export const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 // 7天
