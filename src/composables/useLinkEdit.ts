/**
 * 链接编辑状态管理
 */
import { ref } from 'vue'

// 当前操作模式
export type LinkEditMode = 'none' | 'add' | 'edit' | 'delete' | 'visibility'

// 当前编辑模式
const edit_mode = ref<LinkEditMode>('none')

// 当前编辑的链接 ID
const editing_link_id = ref<string | null>(null)

// 设置编辑模式
function set_edit_mode(mode: LinkEditMode) {
  edit_mode.value = mode
  if (mode === 'none') {
    editing_link_id.value = null
  }
}

// 设置编辑的链接
function set_editing_link(id: string | null) {
  editing_link_id.value = id
}

// 切换编辑模式
function toggle_edit_mode(mode: LinkEditMode) {
  if (edit_mode.value === mode) {
    edit_mode.value = 'none'
  } else {
    edit_mode.value = mode
  }
}

// 重置编辑模式
function reset_edit_mode() {
  edit_mode.value = 'none'
  editing_link_id.value = null
}

export function useLinkEdit() {
  return {
    edit_mode,
    editing_link_id,
    set_edit_mode,
    set_editing_link,
    toggle_edit_mode,
    reset_edit_mode,
  }
}
