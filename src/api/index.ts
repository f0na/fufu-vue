/**
 * API 统一入口
 * 基于后端 API 接口文档 v1
 */

// 类型定义
export * from './types'

// 请求工具
export {
  request,
  get,
  post,
  patch,
  put,
  del,
  upload,
  save_auth_data,
  clear_auth_data,
} from './request'

// 各模块 API
export * from './user'
export * from './gallery'
export * from './announcement'
export * from './auth'
export * from './email'
export * from './admin'
