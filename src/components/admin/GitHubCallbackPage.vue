<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { github_callback } from '@/api/auth'
import { ErrorCodes } from '@/api/types'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { set_github_2fa, set_user_after_login } = useAuth()

const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const code = route.query.code as string
  const state = route.query.state as string

  if (!code || !state) {
    error.value = '无效的回调参数'
    loading.value = false
    return
  }

  // 注意：state 验证由后端完成，前端不再验证 sessionStorage
  // 因为 sessionStorage 跨标签页不共享，会导致验证失败

  try {
    const result = await github_callback({ code, state })
    // 登录成功，设置用户信息
    set_user_after_login(result.user, (result as any).permissions)
    router.push('/home')
  } catch (e: unknown) {
    const err = e as Error & { code: number; data?: { temp_token: string } }
    if (err.code === ErrorCodes.GITHUB_AUTH_FAILED) {
      error.value = 'GitHub授权失败'
    } else if (err.code === ErrorCodes.GITHUB_NO_PUBLIC_EMAIL) {
      error.value = 'GitHub账号未设置公开邮箱，请先在GitHub设置公开邮箱'
    } else if (err.code === ErrorCodes.TWO_FACTOR_REQUIRED && err.data?.temp_token) {
      // 需要两步验证，保存temp_token并跳转
      set_github_2fa(err.data.temp_token)
      router.push('/home/2fa')
      return
    } else {
      error.value = err.message || '登录失败'
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6 rounded-xl bg-white border border-[var(--c-border)] shadow-sm max-w-md mx-auto">
    <div class="text-center">
      <!-- 加载中 -->
      <template v-if="loading">
        <div
          class="i-lucide-loader-2 w-12 h-12 text-[var(--c-primary)] animate-spin mx-auto mb-4"
        />
        <p class="text-slate-600">正在登录...</p>
      </template>

      <!-- 错误状态 -->
      <template v-else-if="error">
        <div class="i-lucide-x-circle w-12 h-12 text-red-500 mx-auto mb-4" />
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button
          @click="router.push('/home/login')"
          class="px-4 py-2 bg-[var(--c-primary)] text-white rounded-lg hover:opacity-80 transition-opacity text-sm"
        >
          返回登录
        </button>
      </template>
    </div>
  </div>
</template>
