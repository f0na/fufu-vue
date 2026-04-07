import { ref } from 'vue'
import type ConfirmModal from '@/components/common/ConfirmModal.vue'

// 全局确认弹窗组件引用
const modal_ref = ref<InstanceType<typeof ConfirmModal> | null>(null)

/**
 * 确认弹窗 composable
 */
export function useConfirm() {
  /**
   * 设置弹窗组件引用
   */
  function set_modal_ref(ref: InstanceType<typeof ConfirmModal> | null) {
    modal_ref.value = ref
  }

  /**
   * 显示确认弹窗
   * @param message 确认消息
   * @param options 可选配置
   * @returns Promise<boolean>
   */
  function confirm(
    message: string,
    options?: {
      title?: string
      confirm_text?: string
      cancel_text?: string
      danger?: boolean
    },
  ): Promise<boolean> {
    if (!modal_ref.value) {
      // 如果弹窗组件未挂载，降级为原生 confirm
      return Promise.resolve(window.confirm(message))
    }
    return modal_ref.value.show({
      message,
      ...options,
    })
  }

  return {
    set_modal_ref,
    confirm,
  }
}