<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AdminPanel from './AdminPanel.vue'

const router = useRouter()
const { logout, loading, can_add, can_edit, can_delete, can_toggle_visibility, user, is_admin } = useAuth()

// 显示管理面板
const show_panel = ref(false)

// 角色显示文本
const role_text = computed(() => {
    return user.value?.role === 'admin' ? '管理员' : '用户'
})

async function handle_logout() {
    await logout()
    router.push('/home')
}

function handle_panel() {
    show_panel.value = true
}

function handle_add() {
    // TODO: 实现添加功能
}

function handle_edit() {
    // TODO: 实现编辑功能
}

function handle_toggle_visibility() {
    // TODO: 实现显隐功能
}

function handle_delete() {
    // TODO: 实现删除功能
}

// 点击头像跳转个人信息页
function go_to_profile() {
    // TODO: 跳转到个人信息页
}
</script>

<template>
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
        <!-- 用户信息区域 -->
        <div class="flex items-center gap-3 mb-3">
            <!-- 头像（可点击跳转个人信息页） -->
            <button
                @click="go_to_profile"
                class="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--c-border)] hover:border-[var(--c-primary)] transition-colors cursor-pointer flex-shrink-0"
            >
                <img
                    v-if="user?.avatar"
                    :src="user.avatar"
                    :alt="user.display_name || user.username"
                    class="w-full h-full object-cover"
                />
                <div
                    v-else
                    class="w-full h-full bg-[var(--c-primary-bg)] flex items-center justify-center"
                >
                    <span class="i-lucide-user text-[var(--c-primary)] text-lg" />
                </div>
            </button>

            <!-- 名字 -->
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-700 truncate">
                    {{ user?.display_name || user?.username }}
                </p>
            </div>
        </div>

        <!-- 身份和签名 -->
        <div class="flex items-center gap-2 mb-4 text-xs text-slate-500">
            <span class="px-2 py-0.5 rounded bg-[var(--c-primary-bg)] text-[var(--c-primary)] font-medium">
                {{ role_text }}
            </span>
            <span class="truncate flex-1" :class="{ 'text-slate-400': !user?.bio }">
                {{ user?.bio || '暂无签名' }}
            </span>
        </div>

        <!-- 操作按钮 -->
        <div class="space-y-2">
            <!-- 面板（仅管理员） -->
            <button
                v-if="is_admin"
                @click="handle_panel"
                :disabled="loading"
                class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
                <span class="i-lucide-layout-dashboard" />
                面板
            </button>

            <!-- 添加 -->
            <button
                v-if="can_add"
                @click="handle_add"
                :disabled="loading"
                class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
                <span class="i-lucide-plus" />
                添加
            </button>

            <!-- 编辑 -->
            <button
                v-if="can_edit"
                @click="handle_edit"
                :disabled="loading"
                class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
                <span class="i-lucide-edit" />
                编辑
            </button>

            <!-- 显/隐 -->
            <button
                v-if="can_toggle_visibility"
                @click="handle_toggle_visibility"
                :disabled="loading"
                class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
                <span class="i-lucide-eye" />
                显/隐
            </button>

            <!-- 删除 -->
            <button
                v-if="can_delete"
                @click="handle_delete"
                :disabled="loading"
                class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
                <span class="i-lucide-trash" />
                删除
            </button>

            <!-- 登出 -->
            <button
                @click="handle_logout"
                :disabled="loading"
                class="w-full px-3 py-2 bg-red-50 border border-red-200 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
                <span class="i-lucide-log-out" />
                登出
            </button>
        </div>
    </div>

    <!-- 管理面板 -->
    <teleport to="body">
        <AdminPanel v-if="show_panel" @close="show_panel = false" />
    </teleport>
</template>