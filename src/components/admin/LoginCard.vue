<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits<{
    need_2fa: []
    close: []
    show_reset_password: []
}>()

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
            emit('need_2fa')
        } else if (result.success) {
            emit('close')
        }
    } catch (e) {
        local_error.value = error.value || '登录失败'
    }
}

function handle_reset_password() {
    emit('show_reset_password')
}

// GitHub 登录（预留）
function handle_github_login() {
    // TODO: 实现 GitHub OAuth 登录
    local_error.value = 'GitHub 登录暂未开放'
}
</script>

<template>
    <div class="bg-$bg border-$border rounded-lg p-4 shadow-lg w-64 animate-fade-in">
        <h3 class="text-$primary font-bold text-center mb-4">登录</h3>

        <!-- 用户名 -->
        <div class="mb-3">
            <input
                v-model="username"
                type="text"
                placeholder="用户名"
                class="w-full px-3 py-2 bg-$primary-bg border-$border rounded text-$secondary focus:outline-none focus:border-$primary"
                :disabled="loading"
            />
        </div>

        <!-- 密码 -->
        <div class="mb-3">
            <input
                v-model="password"
                type="password"
                placeholder="密码"
                class="w-full px-3 py-2 bg-$primary-bg border-$border rounded text-$secondary focus:outline-none focus:border-$primary"
                :disabled="loading"
            />
        </div>

        <!-- 错误提示 -->
        <div v-if="local_error" class="text-red-500 text-sm mb-3 text-center">
            {{ local_error }}
        </div>

        <!-- 按钮 -->
        <div class="flex gap-2 mb-3">
            <button
                @click="handle_login"
                :disabled="loading"
                class="flex-1 px-4 py-2 bg-$primary text-white rounded hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
                {{ loading ? '登录中...' : '登录' }}
            </button>
            <button
                @click="handle_reset_password"
                :disabled="loading"
                class="flex-1 px-4 py-2 bg-$primary-bg border-$border text-$secondary rounded hover:bg-$primary hover:text-white transition-colors disabled:opacity-50"
            >
                重置密码
            </button>
        </div>

        <!-- GitHub 登录 -->
        <button
            @click="handle_github_login"
            :disabled="loading"
            class="w-full px-4 py-2 bg-gray-700 text-white rounded hover:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
        >
            <span class="i-simple-icons-github text-lg" />
            GitHub 登录
        </button>
    </div>
</template>