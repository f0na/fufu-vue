/**
 * 全局通知状态管理 - 使用 vue-sonner
 */
import { toast } from 'vue-sonner'

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

function show_toast(message: string, type: ToastType = 'success', duration = 2000) {
  return toast[type](message, { duration })
}

export function useToast() {
  return {
    show_toast,
    // 快捷方法
    success: (message: string, duration?: number) => show_toast(message, 'success', duration),
    error: (message: string, duration?: number) => show_toast(message, 'error', duration),
    info: (message: string, duration?: number) => show_toast(message, 'info', duration),
    warning: (message: string, duration?: number) => show_toast(message, 'warning', duration),
    loading: (message: string, duration?: number) => show_toast(message, 'loading', duration),
    // 直接访问 toast 函数以获得更多控制
    toast,
  }
}