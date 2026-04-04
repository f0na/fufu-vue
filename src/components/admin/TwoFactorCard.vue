<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits<{
    success: []
    cancel: []
}>()

const { verify_2fa, cancel_2fa, loading, error } = useAuth()

const code = ref('')
const local_error = ref<string | null>(null)

async function handle_verify() {
    local_error.value = null
    if (!code.value || code.value.length !== 6) {
        local_error.value = '请输入6位验证码'
        return
    }

    try {
        const success = await verify_2fa(code.value)
        if (success) {
            emit('success')
        }
    } catch (e) {
        local_error.value = error.value || '验证失败'
    }
}

function handle_cancel() {
    cancel_2fa()
    emit('cancel')
}

// 自动聚焦输入框
function focus_input(el: Element | null) {
    if (el && el instanceof HTMLInputElement) {
        el.focus()
    }
}
</script>

<template>
    <div class="bg-$bg border-$border rounded-lg p-4 shadow-lg w-64 animate-fade-in">
        <h3 class="text-$primary font-bold text-center mb-4">两步验证</h3>
        <p class="text-$secondary text-sm text-center mb-4">
            请输入6位验证码
        </p>

        <!-- 验证码输入 -->
        <div class="mb-3">
            <input
                :ref="focus_input"
                v-model="code"
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full px-3 py-2 bg-$primary-bg border-$border rounded text-$secondary text-center text-lg tracking-widest focus:outline-none focus:border-$primary"
                :disabled="loading"
                @keyup.enter="handle_verify"
            />
        </div>

        <!-- 错误提示 -->
        <div v-if="local_error" class="text-red-500 text-sm mb-3 text-center">
            {{ local_error }}
        </div>

        <!-- 按钮 -->
        <div class="flex gap-2">
            <button
                @click="handle_verify"
                :disabled="loading || code.length !== 6"
                class="flex-1 px-4 py-2 bg-$primary text-white rounded hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
                {{ loading ? '验证中...' : '确认' }}
            </button>
            <button
                @click="handle_cancel"
                :disabled="loading"
                class="flex-1 px-4 py-2 bg-$primary-bg border-$border text-$secondary rounded hover:bg-$primary hover:text-white transition-colors disabled:opacity-50"
            >
                取消
            </button>
        </div>
    </div>
</template>