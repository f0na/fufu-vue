/**
 * 操作按钮状态管理
 * 统一管理中间内容区操作按钮的显示/隐藏
 */
import { ref } from 'vue'

// 操作按钮显示状态
const show_operations = ref(false)

// 设置操作按钮显示状态
function set_show_operations(show: boolean) {
  show_operations.value = show
}

// 切换操作按钮显示状态
function toggle_operations() {
  show_operations.value = !show_operations.value
}

export function useOperations() {
  return {
    show_operations,
    set_show_operations,
    toggle_operations,
  }
}
