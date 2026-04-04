<script setup lang="ts">
import { ref } from 'vue'
import { useBangumiFilter } from '@/composables/useBangumiStats'

// 使用共享筛选状态
const { bangumi_filter, set_bangumi_filter } = useBangumiFilter()

// 搜索模式：番剧搜索 或 全站搜索
const search_mode = ref<'bangumi' | 'global'>('bangumi')
const search_query = ref('')

// 状态标签
const status_tags = [
    { key: 'watching', label: '在看', class: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
    { key: 'want_to_watch', label: '想看', class: 'bg-sky-100 text-sky-700 hover:bg-sky-200' },
    { key: 'watched', label: '看过', class: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
    { key: 'dropped', label: '抛弃', class: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
] as const

function toggle_search_mode() {
    search_mode.value = search_mode.value === 'bangumi' ? 'global' : 'bangumi'
}

function handle_search() {
    if (search_query.value.trim()) {
        console.log('搜索:', search_query.value, '模式:', search_mode.value)
    }
}

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
            <!-- 搜索模式切换 -->
            <div class="flex items-center gap-1 p-2 border-b border-[var(--c-border)]">
                <button
                    @click="toggle_search_mode"
                    class="flex-1 px-1 py-1 text-xs rounded transition-colors"
                    :class="search_mode === 'bangumi'
                        ? 'bg-[var(--c-primary)] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                    番剧
                </button>
                <button
                    @click="toggle_search_mode"
                    class="flex-1 px-1 py-1 text-xs rounded transition-colors"
                    :class="search_mode === 'global'
                        ? 'bg-[var(--c-primary)] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                    全站
                </button>
            </div>

            <!-- 输入框 -->
            <div class="relative">
                <div class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <div class="i-lucide-search w-3.5 h-3.5" />
                </div>
                <input
                    v-model="search_query"
                    type="text"
                    :placeholder="search_mode === 'bangumi' ? '搜索番剧...' : '搜索...'"
                    class="w-full pl-7 pr-2 py-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                    @keyup.enter="handle_search"
                />
            </div>
        </div>

        <!-- 状态标签筛选 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <div class="flex flex-wrap gap-2">
                <button
                    v-for="tag in status_tags"
                    :key="tag.key"
                    @click="toggle_filter(tag.key)"
                    class="flex-1 px-3 py-1.5 text-xs rounded-lg transition-all text-center border-2"
                    :class="bangumi_filter === tag.key
                        ? 'border-[var(--c-primary)] ring-2 ring-[var(--c-primary)]/30 ' + tag.class
                        : 'border-transparent ' + tag.class"
                >
                    {{ tag.label }}
                </button>
            </div>
        </div>
    </div>
</template>