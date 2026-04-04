<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'
import { ErrorCodes } from '@/api/types'

const router = useRouter()

const email = ref('')
const username = ref('')
const password = ref('')
const confirm_password = ref('')
const display_name = ref('')

const loading = ref(false)
const error = ref<string | null>(null)

async function handle_register() {
    error.value = null

    // 验证
    if (!email.value || !username.value || !password.value) {
        error.value = '请填写必填信息'
        return
    }

    if (password.value !== confirm_password.value) {
        error.value = '两次输入的密码不一致'
        return
    }

    if (password.value.length < 8 || password.value.length > 32) {
        error.value = '密码长度需为8-32位'
        return
    }

    loading.value = true

    try {
        await register({
            email: email.value,
            username: username.value,
            password: password.value,
            display_name: display_name.value || undefined,
        })
        // 注册成功，跳转到首页
        router.push('/home')
    } catch (e) {
        const err = e as Error & { code: number }
        if (err.code === ErrorCodes.EMAIL_ALREADY_REGISTERED) {
            error.value = '该邮箱已被注册'
        } else if (err.code === ErrorCodes.USERNAME_ALREADY_USED) {
            error.value = '该用户名已被使用'
        } else if (err.code === ErrorCodes.NEW_PASSWORD_FORMAT_ERROR) {
            error.value = '密码格式错误，请使用8-32位密码'
        } else {
            error.value = err.message || '注册失败'
        }
    } finally {
        loading.value = false
    }
}

function handle_go_login() {
    router.push('/home/login')
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

        <!-- 邮箱 -->
        <div class="mb-4">
            <label class="block text-slate-600 text-sm mb-1">
                邮箱 <span class="text-red-400">*</span>
            </label>
            <input
                v-model="email"
                type="email"
                placeholder="请输入邮箱"
                class="w-full px-4 py-3 bg-[var(--c-primary-bg)] border border-[var(--c-border)] rounded-lg text-slate-700 focus:outline-none focus:border-[var(--c-primary)] transition-colors"
                :disabled="loading"
            />
        </div>

        <!-- 用户名 -->
        <div class="mb-4">
            <label class="block text-slate-600 text-sm mb-1">
                用户名 <span class="text-red-400">*</span>
            </label>
            <input
                v-model="username"
                type="text"
                placeholder="3-32位字符"
                class="w-full px-4 py-3 bg-[var(--c-primary-bg)] border border-[var(--c-border)] rounded-lg text-slate-700 focus:outline-none focus:border-[var(--c-primary)] transition-colors"
                :disabled="loading"
            />
        </div>

        <!-- 显示名称 -->
        <div class="mb-4">
            <label class="block text-slate-600 text-sm mb-1">
                显示名称
            </label>
            <input
                v-model="display_name"
                type="text"
                placeholder="可选，默认为用户名"
                class="w-full px-4 py-3 bg-[var(--c-primary-bg)] border border-[var(--c-border)] rounded-lg text-slate-700 focus:outline-none focus:border-[var(--c-primary)] transition-colors"
                :disabled="loading"
            />
        </div>

        <!-- 密码 -->
        <div class="mb-4">
            <label class="block text-slate-600 text-sm mb-1">
                密码 <span class="text-red-400">*</span>
            </label>
            <input
                v-model="password"
                type="password"
                placeholder="8-32位字符"
                class="w-full px-4 py-3 bg-[var(--c-primary-bg)] border border-[var(--c-border)] rounded-lg text-slate-700 focus:outline-none focus:border-[var(--c-primary)] transition-colors"
                :disabled="loading"
            />
        </div>

        <!-- 确认密码 -->
        <div class="mb-4">
            <label class="block text-slate-600 text-sm mb-1">
                确认密码 <span class="text-red-400">*</span>
            </label>
            <input
                v-model="confirm_password"
                type="password"
                placeholder="再次输入密码"
                class="w-full px-4 py-3 bg-[var(--c-primary-bg)] border border-[var(--c-border)] rounded-lg text-slate-700 focus:outline-none focus:border-[var(--c-primary)] transition-colors"
                :disabled="loading"
                @keyup.enter="handle_register"
            />
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="text-red-500 text-sm mb-4 text-center">
            {{ error }}
        </div>

        <!-- 按钮 -->
        <div class="flex gap-2 mb-4 justify-center">
            <button
                @click="handle_register"
                :disabled="loading"
                class="w-24 px-3 py-2 bg-[var(--c-primary)] text-white rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity text-sm"
            >
                {{ loading ? '注册中...' : '注册' }}
            </button>
            <button
                @click="handle_go_login"
                :disabled="loading"
                class="w-24 px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm"
            >
                返回登录
            </button>
        </div>
    </div>
</template>