/**
 * 表单状态缓存 composable
 * 用于在浏览器中缓存表单输入状态，下次访问时恢复
 */
import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

export function useFormCache<T extends Record<string, unknown>>(
  cache_key: string,
  default_value: T,
): {
  form_data: Ref<T>
  save: () => void
  restore: () => void
  reset: () => void
  clear_cache: () => void
} {
  const form_data = ref<T>({ ...default_value }) as Ref<T>

  // 从 localStorage 恢复数据
  function restore() {
    try {
      const cached = localStorage.getItem(`form_cache_${cache_key}`)
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<T>
        // 合并缓存数据和默认值
        form_data.value = { ...default_value, ...parsed } as T
      }
    } catch {
      // 解析失败，使用默认值
      form_data.value = { ...default_value } as T
    }
  }

  // 保存数据到 localStorage
  function save() {
    try {
      localStorage.setItem(`form_cache_${cache_key}`, JSON.stringify(form_data.value))
    } catch {
      // 存储失败，忽略
    }
  }

  // 清除缓存
  function clear_cache() {
    try {
      localStorage.removeItem(`form_cache_${cache_key}`)
    } catch {
      // 忽略
    }
  }

  // 重置表单
  function reset() {
    form_data.value = { ...default_value } as T
    clear_cache()
  }

  // 初始化时恢复数据
  onMounted(() => {
    restore()
  })

  // 监听变化自动保存
  watch(
    form_data,
    () => {
      save()
    },
    { deep: true },
  )

  // 组件卸载时保存
  onUnmounted(() => {
    save()
  })

  return {
    form_data,
    save,
    restore,
    reset,
    clear_cache,
  }
}
