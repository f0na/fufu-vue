/**
 * 全局通知状态管理
 */
import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
    id: number
    message: string
    type: ToastType
}

const toasts = ref<ToastItem[]>([])
let toast_id = 0

function show_toast(message: string, type: ToastType = 'success', duration = 2000) {
    const id = ++toast_id
    toasts.value.push({ id, message, type })

    setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)

    return id
}

function remove_toast(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
}

export function useToast() {
    return {
        toasts,
        show_toast,
        remove_toast,
        // 快捷方法
        success: (message: string, duration?: number) => show_toast(message, 'success', duration),
        error: (message: string, duration?: number) => show_toast(message, 'error', duration),
        info: (message: string, duration?: number) => show_toast(message, 'info', duration),
        warning: (message: string, duration?: number) => show_toast(message, 'warning', duration),
    }
}