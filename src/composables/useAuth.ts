/**
 * 认证状态管理
 * 处理登录、登出、2FA验证等
 */
import { ref, computed } from 'vue'
import {
  login as api_login,
  logout as api_logout,
  verify_2fa_login,
  is_logged_in as check_is_logged_in,
  get_permissions,
} from '@/api/auth'
import type { User, UserPermission, LoginResponse } from '@/api/types'
import { ErrorCodes } from '@/api/types'

// 认证状态
const is_logged_in = ref(false)
const user = ref<User | null>(null)
const permissions = ref<UserPermission | null>(null)

// 2FA验证状态
const temp_token = ref<string | null>(null)
const pending_2fa = ref(false)
const github_2fa = ref(false) // 是否是GitHub登录的2FA

// 加载状态
const loading = ref(false)
const error = ref<string | null>(null)

// 初始化 - 检查本地存储的登录状态
function init() {
  const logged_in = check_is_logged_in()
  if (logged_in) {
    is_logged_in.value = true
    permissions.value = get_permissions()
    // 恢复用户信息
    const stored_user = localStorage.getItem('user_info')
    if (stored_user) {
      try {
        user.value = JSON.parse(stored_user)
      } catch {
        // 忽略解析错误
      }
    }
  }
}

// 登录（第一步）
async function login(
  username: string,
  password: string,
): Promise<{ success: boolean; need_2fa: boolean }> {
  loading.value = true
  error.value = null

  try {
    const response = await api_login({ username, password })
    // 直接登录成功
    set_auth_data(response)
    return { success: true, need_2fa: false }
  } catch (e) {
    const err = e as Error & { code: number; data: { temp_token: string } }
    if (err.code === ErrorCodes.TWO_FACTOR_REQUIRED) {
      // 需要两步验证
      temp_token.value = err.data.temp_token
      pending_2fa.value = true
      return { success: false, need_2fa: true }
    }
    error.value = err.message || '登录失败'
    throw e
  } finally {
    loading.value = false
  }
}

// 两步验证（第二步）
async function verify_2fa(code: string): Promise<boolean> {
  if (!temp_token.value) {
    error.value = '临时令牌无效'
    return false
  }

  loading.value = true
  error.value = null

  try {
    const response = await verify_2fa_login({
      temp_token: temp_token.value,
      code,
    })
    set_auth_data(response)
    // 清除2FA状态
    temp_token.value = null
    pending_2fa.value = false
    github_2fa.value = false
    return true
  } catch (e) {
    const err = e as Error
    error.value = err.message || '验证失败'
    throw e
  } finally {
    loading.value = false
  }
}

// 取消2FA验证
function cancel_2fa() {
  temp_token.value = null
  pending_2fa.value = false
  github_2fa.value = false
  error.value = null
}

// 设置认证数据
function set_auth_data(response: LoginResponse) {
  is_logged_in.value = true
  user.value = response.user
  permissions.value = response.permissions
  // 保存用户信息到本地存储
  localStorage.setItem('user_info', JSON.stringify(response.user))
}

// 设置GitHub 2FA状态
function set_github_2fa(token: string) {
  temp_token.value = token
  pending_2fa.value = true
  github_2fa.value = true
}

// 登录成功后设置用户信息（用于GitHub登录等场景）
function set_user_after_login(user_data: User, permissions_data?: UserPermission) {
  is_logged_in.value = true
  user.value = user_data
  if (permissions_data) {
    permissions.value = permissions_data
  }
  localStorage.setItem('user_info', JSON.stringify(user_data))
  if (permissions_data) {
    localStorage.setItem('user_permissions', JSON.stringify(permissions_data))
  }
}

// 登出
async function logout() {
  loading.value = true
  try {
    await api_logout()
  } finally {
    // 无论 API 是否成功，都清除本地状态
    is_logged_in.value = false
    user.value = null
    permissions.value = null
    temp_token.value = null
    pending_2fa.value = false
    github_2fa.value = false
    loading.value = false
    // 清除本地存储
    localStorage.removeItem('user_info')
    localStorage.removeItem('user_permissions')
  }
}

// 检查权限
function has_permission(
  type: 'can_add' | 'can_edit' | 'can_delete' | 'can_toggle_visibility',
): boolean {
  if (!permissions.value) return false
  return permissions.value[type]
}

// 检查是否是管理员
const is_admin = computed(() => user.value?.role === 'admin')

// 计算属性
const can_add = computed(() => has_permission('can_add'))
const can_edit = computed(() => has_permission('can_edit'))
const can_delete = computed(() => has_permission('can_delete'))
const can_toggle_visibility = computed(() => has_permission('can_toggle_visibility'))

// 导出
export function useAuth() {
  // 初始化
  init()

  return {
    // 状态
    is_logged_in,
    is_admin,
    user,
    permissions,
    temp_token,
    pending_2fa,
    github_2fa,
    loading,
    error,

    // 方法
    login,
    verify_2fa,
    cancel_2fa,
    logout,
    set_github_2fa,
    set_user_after_login,

    // 权限检查
    has_permission,
    can_add,
    can_edit,
    can_delete,
    can_toggle_visibility,
  }
}
