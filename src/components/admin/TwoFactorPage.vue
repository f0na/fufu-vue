<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { verify_2fa, cancel_2fa, loading, error, temp_token } = useAuth()

const code = ref('')
const local_error = ref<string | null>(null)

onMounted(() => {
    if (!temp_token.value) {
        router.push('/home/login')
    }
})

async function handle_verify() {
    local_error.value = null
    if (!code.value || code.value.length !== 6) {
        local_error.value = '请输入6位验证码'
        return
    }

    try {
        const success = await verify_2fa(code.value)
        if (success) {
            router.push('/home')
        }
    } catch (e) {
        local_error.value = error.value || '验证失败'
    }
}

function handle_cancel() {
    cancel_2fa()
    router.push('/home/login')
}
</script>

<template>
    <div class="p-6 rounded-xl bg-white border border-[var(--c-border)] shadow-sm max-w-sm mx-auto">
        <h1 class="text-2xl font-bold text-slate-700 mb-2 text-center">
            两步验证
        </h1>
        <p class="text-[var(--c-primary)] font-medium mb-6 text-center">
            请输入验证器中的6位验证码
        </p>

        <!-- 验证码输入 -->
        <div class="mb-4">
            <input
                v-model="code"
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full px-4 py-4 bg-[var(--c-primary-bg)] border border-[var(--c-border)] rounded-lg text-slate-700 text-center text-2xl tracking-widest focus:outline-none focus:border-[var(--c-primary)] transition-colors"
                :disabled="loading"
                @keyup.enter="handle_verify"
            />
        </div>

        <!-- 错误提示 -->
        <div v-if="local_error" class="text-red-500 text-sm mb-4 text-center">
            {{ local_error }}
        </div>

        <!-- 按钮 -->
        <div class="flex gap-3">
            <button
                @click="handle_verify"
                :disabled="loading || code.length !== 6"
                class="flex-1 px-4 py-3 bg-[var(--c-primary)] text-white rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity font-medium"
            >
                {{ loading ? '验证中...' : '确认' }}
            </button>
            <button
                @click="handle_cancel"
                :disabled="loading"
                class="flex-1 px-4 py-3 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50"
            >
                取消
            </button>
        </div>
    </div>
</template>