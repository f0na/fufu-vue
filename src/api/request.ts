/**
 * HTTP 请求封装
 * 基于后端 API 接口文档 v1
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiResponse, ErrorCodes } from './types'

// 扩展 AxiosRequestConfig 以支持 _retry 标记
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

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

// 刷新状态管理
let is_refreshing = false
let refresh_subscribers: Array<(token: string) => void> = []

// 订阅刷新完成事件
function subscribe_token_refresh(callback: (token: string) => void) {
  refresh_subscribers.push(callback)
}

// 通知所有订阅者刷新完成
function on_refreshed(token: string) {
  refresh_subscribers.forEach((callback) => callback(token))
  refresh_subscribers = []
}

// 刷新失败，清除所有订阅
function on_refresh_failed() {
  refresh_subscribers = []
  clear_auth_data()
}

// 解析 JWT 获取过期时间
function parse_jwt_exp(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(atob(payload))
    return decoded.exp ? decoded.exp * 1000 : null // 转换为毫秒
  } catch {
    return null
  }
}

// 检查 token 是否需要刷新（距离过期少于 5 分钟）
function should_refresh_token(): boolean {
  const token = localStorage.getItem('auth_token')
  if (!token) return false

  const exp = parse_jwt_exp(token)
  if (!exp) return false

  const now = Date.now()
  const threshold = 5 * 60 * 1000 // 5 分钟
  return exp - now < threshold && exp > now
}

// 执行 token 刷新
async function do_refresh_token(): Promise<string | null> {
  const refresh_token_value = localStorage.getItem('refresh_token')
  if (!refresh_token_value) return null

  try {
    const response = await axios.post<ApiResponse<{ token: string; refresh_token: string }>>(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refresh_token_value },
    )

    if (response.data.code !== 0) {
      return null
    }

    const { token, refresh_token: new_refresh } = response.data.data
    save_auth_data({ token, refresh_token: new_refresh })
    return token
  } catch {
    return null
  }
}

// 请求拦截器 - 添加 token 和自动刷新
request.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token')

    // 如果正在刷新，等待刷新完成
    if (is_refreshing) {
      return new Promise((resolve) => {
        subscribe_token_refresh((new_token: string) => {
          config.headers.Authorization = `Bearer ${new_token}`
          resolve(config)
        })
      })
    }

    // 检查是否需要刷新 token
    if (token && should_refresh_token()) {
      is_refreshing = true
      const new_token = await do_refresh_token()
      is_refreshing = false

      if (new_token) {
        config.headers.Authorization = `Bearer ${new_token}`
        on_refreshed(new_token)
      } else {
        on_refresh_failed()
        // 不设置 Authorization，让请求失败
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器 - 统一错误处理和 401 自动刷新
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    // 204 No Content 没有响应体，直接返回
    if (response.status === 204) {
      return response
    }
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
  async (error) => {
    const original_request = error.config

    // HTTP 错误处理
    if (error.response) {
      const { status, data } = error.response

      // 401 处理 - 尝试刷新 token 并重试
      if (status === 401 && !original_request._retry) {
        original_request._retry = true

        // 如果正在刷新，等待刷新完成后重试
        if (is_refreshing) {
          return new Promise((resolve, reject) => {
            subscribe_token_refresh((new_token: string) => {
              original_request.headers.Authorization = `Bearer ${new_token}`
              resolve(request(original_request))
            })
            // 设置超时防止无限等待
            setTimeout(() => {
              reject(error)
            }, 10000)
          })
        }

        is_refreshing = true
        const new_token = await do_refresh_token()
        is_refreshing = false

        if (new_token) {
          original_request.headers.Authorization = `Bearer ${new_token}`
          on_refreshed(new_token)
          return request(original_request)
        } else {
          on_refresh_failed()
          error.message = '登录已过期，请重新登录'
          return Promise.reject(error)
        }
      }

      // 如果响应体有业务错误码，使用它
      if (data?.code !== undefined) {
        error.code = data.code
        error.message = data.message || '请求失败'
      } else {
        // 根据 HTTP 状态码处理
        switch (status) {
          case 401:
            error.message = '登录已过期，请重新登录'
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
  },
)

// 封装 GET 请求
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await request.get<ApiResponse<T>>(url, config)
  return response.data.data as T
}

// 封装 POST 请求
export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await request.post<ApiResponse<T>>(url, data, config)
  return response.data.data as T
}

// 封装 PATCH 请求
export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
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
export async function upload<T>(
  url: string,
  file: File,
  extra_fields?: Record<string, string | number>,
): Promise<T> {
  const form_data = new FormData()
  form_data.append('file', file)
  if (extra_fields) {
    for (const [key, value] of Object.entries(extra_fields)) {
      form_data.append(key, String(value))
    }
  }
  const response = await request.post<ApiResponse<T>>(url, form_data, {
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
