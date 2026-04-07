<script setup lang="ts">
import { ref } from 'vue'
import { request_password_reset } from '@/api/auth'

const emit = defineEmits<{
  close: []
}>()

const username = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

async function handle_submit() {
  error.value = null
  if (!username.value) {
    error.value = '请输入用户名'
    return
  }

  loading.value = true
  try {
    await request_password_reset({ username: username.value })
    success.value = true
  } catch (e) {
    const err = e as Error
    error.value = err.message || '发送失败'
  } finally {
    loading.value = false
  }
}

function handle_close() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center z-[100]">
    <div class="bg-$bg border-$border rounded-lg p-6 shadow-lg w-80">
      <!-- 成功状态 -->
      <template v-if="success">
        <div class="text-center">
          <span class="i-lucide-check-circle text-green-500 text-4xl mb-4" />
          <h3 class="text-$primary font-bold mb-2">发送成功</h3>
          <p class="text-$secondary text-sm mb-4">重置链接已发送到管理员邮箱</p>
          <button @click="handle_close" class="px-4 py-2 bg-$primary text-white rounded">
            关闭
          </button>
        </div>
      </template>

      <!-- 表单状态 -->
      <template v-else>
        <h3 class="text-$primary font-bold text-center mb-4">重置密码</h3>
        <p class="text-$secondary text-sm text-center mb-4">
          输入用户名，重置链接将发送到管理员邮箱
        </p>

        <!-- 用户名 -->
        <div class="mb-4">
          <input
            v-model="username"
            type="text"
            placeholder="用户名"
            class="w-full px-3 py-2 bg-$primary-bg border-$border rounded text-$secondary focus:outline-none focus:border-$primary"
            :disabled="loading"
          />
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="text-red-500 text-sm mb-4 text-center">
          {{ error }}
        </div>

        <!-- 按钮 -->
        <div class="flex gap-2">
          <button
            @click="handle_submit"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-$primary text-white rounded disabled:opacity-50"
          >
            {{ loading ? '发送中...' : '发送' }}
          </button>
          <button
            @click="handle_close"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-$primary-bg border-$border text-$secondary rounded disabled:opacity-50"
          >
            取消
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
