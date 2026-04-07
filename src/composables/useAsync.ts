/**
 * 异步操作封装
 * 统一处理 loading/error 状态
 */
import { ref, type Ref } from 'vue'

interface UseAsyncResult<T> {
  loading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<T | null>
  execute: () => Promise<T | null>
}

export function useAsync<T>(async_fn: () => Promise<T>): UseAsyncResult<T> {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null) as Ref<T | null>

  async function execute(): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      const result = await async_fn()
      data.value = result
      return result
    } catch (e) {
      error.value = e as Error
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, execute }
}

// 用于多个异步操作
interface UseAsyncListResult {
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute_all: () => Promise<void>
}

export function useAsyncList(async_fns: (() => Promise<unknown>)[]): UseAsyncListResult {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function execute_all(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await Promise.all(async_fns.map((fn) => fn()))
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { loading, error, execute_all }
}
