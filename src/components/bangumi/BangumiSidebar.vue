<script setup lang="ts">
import { useBangumiFilter } from '@/composables/useBangumiStats'

// 使用共享筛选状态
const { bangumi_filter, set_bangumi_filter, search_query } = useBangumiFilter()

// 状态标签
const status_tags = [
    { key: 'watching', label: '在看' },
    { key: 'want_to_watch', label: '想看' },
    { key: 'watched', label: '看过' },
    { key: 'dropped', label: '抛弃' },
] as const

function toggle_filter(status: typeof bangumi_filter.value) {
    if (bangumi_filter.value === status) {
        set_bangumi_filter('all')
    } else {
        set_bangumi_filter(status)
    }
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- 搜索框 -->
        <div class="rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--c-border)] shadow-sm overflow-hidden">
            <!-- 输入框 -->
            <div class="relative">
                <div class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <div class="i-lucide-search w-3.5 h-3.5" />
                </div>
                <input
                    v-model="search_query"
                    type="text"
                    placeholder="搜索番剧..."
                    class="w-full pl-7 pr-2 py-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
            </div>
        </div>

        <!-- 状态标签筛选 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <div class="flex flex-wrap justify-center gap-2">
                <button
                    v-for="tag in status_tags"
                    :key="tag.key"
                    @click="toggle_filter(tag.key)"
                    class="px-4 py-2 text-xs rounded-lg transition-all text-center border-2 whitespace-nowrap"
                    :class="bangumi_filter === tag.key
                        ? 'border-[var(--c-primary)] ring-2 ring-[var(--c-primary)]/30 bg-[var(--c-primary-bg)] text-slate-700'
                        : 'border-transparent bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'"
                >
                    {{ tag.label }}
                </button>
            </div>
        </div>
    </div>
</template>