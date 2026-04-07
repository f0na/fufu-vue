<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { get_github_auth_url } from '@/api/auth'
import { Github } from 'lucide-vue-next'

const router = useRouter()
const { login, loading, error } = useAuth()

const username = ref('')
const password = ref('')
const local_error = ref<string | null>(null)

async function handle_login() {
  local_error.value = null
  if (!username.value || !password.value) {
    local_error.value = '请输入用户名和密码'
    return
  }

  try {
    const result = await login(username.value, password.value)
    if (result.need_2fa) {
      router.push('/home/2fa')
    } else if (result.success) {
      router.push('/home')
    }
  } catch (e) {
    local_error.value = error.value || '登录失败'
  }
}

function handle_reset_password() {
  router.push('/home/reset-password')
}

async function handle_github_login() {
  local_error.value = null
  try {
    const result = await get_github_auth_url()
    // 直接跳转到GitHub授权页面（state验证由后端完成）
    window.location.href = result.url
  } catch (e) {
    local_error.value = '获取GitHub授权链接失败'
  }
}
</script>

<template>
  <div class="p-6 rounded-xl bg-white border border-[var(--c-border)] shadow-sm max-w-md mx-auto">
    <!-- 动漫插画 -->
    <div class="mb-6">
      <img
        src="https://t.alcy.cc/moez"
        alt="插画"
        class="w-full h-auto rounded-xl"
        loading="lazy"
      />
    </div>

    <!-- 用户名 -->
    <div class="mb-4">
      <input
        v-model="username"
        type="text"
        placeholder="账号"
        class="w-full px-4 py-3 bg-[var(--c-primary-bg)] border border-[var(--c-border)] rounded-lg text-slate-700 focus:outline-none focus:border-[var(--c-primary)] transition-colors"
        :disabled="loading"
      />
    </div>

    <!-- 密码 -->
    <div class="mb-4">
      <input
        v-model="password"
        type="password"
        placeholder="密码"
        class="w-full px-4 py-3 bg-[var(--c-primary-bg)] border border-[var(--c-border)] rounded-lg text-slate-700 focus:outline-none focus:border-[var(--c-primary)] transition-colors"
        :disabled="loading"
        @keyup.enter="handle_login"
      />
    </div>

    <!-- 错误提示 -->
    <div v-if="local_error" class="text-red-500 text-sm mb-4 text-center">
      {{ local_error }}
    </div>

    <!-- 按钮行 -->
    <div class="flex gap-2 mb-3 justify-center">
      <button
        @click="handle_login"
        :disabled="loading"
        class="w-24 px-3 py-2 bg-[var(--c-primary)] text-white rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity text-sm"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <button
        @click="handle_reset_password"
        :disabled="loading"
        class="w-24 px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm"
      >
        重置密码
      </button>
    </div>

    <!-- GitHub 登录 -->
    <div class="flex justify-center mb-4">
      <button
        @click="handle_github_login"
        :disabled="loading"
        class="w-48 px-3 py-2 bg-gray-700 text-white rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 text-sm"
      >
        <Github class="w-5 h-5" />
        GitHub 登录
      </button>
    </div>

    <!-- 注册链接 -->
    <div class="text-center text-sm text-slate-500">
      还没有账号？
      <router-link to="/home/register" class="text-[var(--c-primary)] hover:underline">
        立即注册
      </router-link>
    </div>
  </div>
</template>
