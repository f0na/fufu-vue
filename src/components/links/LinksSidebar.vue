<script setup lang="ts">
import { ref } from 'vue'
import { useLinksFilter } from '@/composables/useLinksFilter'

// 使用共享筛选状态
const { links_filter, all_tags, set_links_filter } = useLinksFilter()

// 搜索模式：链接搜索 或 全站搜索
const search_mode = ref<'links' | 'global'>('links')
const search_query = ref('')

function toggle_search_mode() {
    search_mode.value = search_mode.value === 'links' ? 'global' : 'links'
}

function handle_search() {
    if (search_query.value.trim()) {
        console.log('搜索:', search_query.value, '模式:', search_mode.value)
    }
}

function toggle_filter(tag: string) {
    if (links_filter.value === tag) {
        set_links_filter('all')
    } else {
        set_links_filter(tag)
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
                    :class="search_mode === 'links'
                        ? 'bg-[var(--c-primary)] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                    链接
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
                    :placeholder="search_mode === 'links' ? '搜索链接...' : '搜索...'"
                    class="w-full pl-7 pr-2 py-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                    @keyup.enter="handle_search"
                />
            </div>
        </div>

        <!-- 标签筛选 -->
        <div v-if="all_tags.length > 0" class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <div class="flex flex-wrap justify-center gap-2">
                <button
                    v-for="tag in all_tags"
                    :key="tag"
                    @click="toggle_filter(tag)"
                    class="px-4 py-2 text-xs rounded-lg transition-all border-2 whitespace-nowrap"
                    :class="links_filter === tag
                        ? 'border-[var(--c-primary)] ring-2 ring-[var(--c-primary)]/30 bg-[var(--c-primary-bg)] text-slate-700'
                        : 'border-transparent bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'"
                >
                    {{ tag }}
                </button>
            </div>
        </div>
    </div>
</template>