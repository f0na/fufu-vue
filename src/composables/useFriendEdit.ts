/**
 * 友链编辑状态管理
 */
import { ref } from 'vue'

// 当前操作模式
export type FriendEditMode = 'none' | 'add' | 'edit' | 'delete' | 'visibility'

// 当前编辑模式
const edit_mode = ref<FriendEditMode>('none')

// 设置编辑模式
function set_edit_mode(mode: FriendEditMode) {
  edit_mode.value = mode
}

// 重置编辑模式
function reset_edit_mode() {
  edit_mode.value = 'none'
}

// 切换编辑模式
function toggle_edit_mode(mode: FriendEditMode) {
  if (edit_mode.value === mode) {
    edit_mode.value = 'none'
  } else {
    edit_mode.value = mode
  }
}

export function useFriendEdit() {
  return {
    edit_mode,
    set_edit_mode,
    reset_edit_mode,
    toggle_edit_mode,
  }
}