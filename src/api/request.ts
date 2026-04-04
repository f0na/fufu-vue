/**
 * HTTP 请求封装
 * 基于后端 API 接口文档 v1
 */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse, ErrorCodes } from './types'

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30秒超时，适应GitHub OAuth等耗时操作
    headers: {
        'Content-Type': 'application/json',
    },
})

// 请求拦截器 - 添加 token
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
        const { data } = response
        // code !== 0 表示业务错误
        if (data.code !== 0) {
            const error = new Error(data.message || '请求失败')
            ;(error as Error & { code: number; data: unknown }).code = data.code
            ;(error as Error & { code: number; data: unknown }).data = data.data
            return Promise.reject(error)
        }
        return response
    },
    (error) => {
        // HTTP 错误处理
        if (error.response) {
            const { status, data } = error.response
            // 如果响应体有业务错误码，使用它
            if (data?.code !== undefined) {
                error.code = data.code
                error.message = data.message || '请求失败'
            } else {
                // 根据 HTTP 状态码处理
                switch (status) {
                    case 401:
                        // 未授权，清除 token
                        localStorage.removeItem('auth_token')
                        localStorage.removeItem('refresh_token')
                        // 可以跳转到登录页
                        break
                    case 403:
                        error.message = '没有权限访问该资源'
                        break
                    case 404:
                        error.message = '请求的资源不存在'
                        break
                    case 413:
                        error.message = '文件大小超出限制'
                        break
                    case 415:
                        error.message = '不支持的文件类型'
                        break
                    case 429:
                        error.message = '请求过于频繁，请稍后再试'
                        break
                    case 500:
                        error.message = '服务器内部错误'
                        break
                    case 503:
                        error.message = '服务暂时不可用'
                        break
                    default:
                        error.message = data?.message || '请求失败'
                }
            }
        } else if (error.request) {
            error.message = '网络错误，请检查网络连接'
        }
        return Promise.reject(error)
    }
)

// 封装 GET 请求
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await request.get<ApiResponse<T>>(url, config)
    return response.data.data as T
}

// 封装 POST 请求
export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await request.post<ApiResponse<T>>(url, data, config)
    return response.data.data as T
}

// 封装 PATCH 请求
export async function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await request.patch<ApiResponse<T>>(url, data, config)
    return response.data.data as T
}

// 封装 PUT 请求
export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await request.put<ApiResponse<T>>(url, data, config)
    return response.data.data as T
}

// 封装 DELETE 请求（204 无响应体）
export async function del(url: string, config?: AxiosRequestConfig): Promise<void> {
    await request.delete(url, config)
}

// 上传文件
export async function upload<T>(url: string, file: File, extra_fields?: Record<string, string | number>): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    if (extra_fields) {
        for (const [key, value] of Object.entries(extra_fields)) {
            formData.append(key, String(value))
        }
    }
    const response = await request.post<ApiResponse<T>>(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data.data as T
}

// 保存认证信息
export function save_auth_data(data: { token: string; refresh_token: string }) {
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('refresh_token', data.refresh_token)
}

// 清除认证信息
export function clear_auth_data() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
}

// 获取刷新令牌
export function get_refresh_token(): string | null {
    return localStorage.getItem('refresh_token')
}

// 导出 axios 实例（用于特殊情况）
export { request }