<script setup lang="ts">
import { useGalleryFilter } from '@/composables/useGalleryFilter'

// 使用共享筛选状态
const { gallery_filter, all_tags, set_gallery_filter, search_query } = useGalleryFilter()

function toggle_filter(tag: string) {
    if (gallery_filter.value === tag) {
        set_gallery_filter('all')
    } else {
        set_gallery_filter(tag)
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
                    placeholder="搜索相册..."
                    class="w-full pl-7 pr-2 py-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
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
                    :class="gallery_filter === tag
                        ? 'border-[var(--c-primary)] ring-2 ring-[var(--c-primary)]/30 bg-[var(--c-primary-bg)] text-slate-700'
                        : 'border-transparent bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'"
                >
                    {{ tag }}
                </button>
            </div>
        </div>
    </div>
</template>