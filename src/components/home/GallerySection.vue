<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 每页显示数量
const per_page = 4

// 当前页码
const current_page = ref(1)

// 模拟相册列表（实际应从 API 获取）
const all_galleries = ref([
    { id: 1, title: '日常随拍', cover: 'https://t.alcy.cc/moez', count: 12, tags: ['日常', '生活'] },
    { id: 2, title: '旅行记录', cover: 'https://t.alcy.cc/fj', count: 8, tags: ['旅行', '风景'] },
    { id: 3, title: '萌宠日常', cover: 'https://t.alcy.cc/ycy', count: 15, tags: ['萌宠', '可爱'] },
    { id: 4, title: '美食分享', cover: 'https://www.loliapi.com/acg/', count: 6, tags: ['美食', '记录'] },
])

// 总页数
const total_pages = computed(() => Math.ceil(all_galleries.value.length / per_page))

// 当前页的相册
const galleries = computed(() => {
    const start = (current_page.value - 1) * per_page
    const end = start + per_page
    return all_galleries.value.slice(start, end)
})

// 是否显示分页
const show_pagination = computed(() => total_pages.value > 1)

function open_gallery(id: number) {
    router.push(`/gallery/${id}`)
}

function go_to_page(page: number) {
    if (page >= 1 && page <= total_pages.value) {
        current_page.value = page
    }
}

function prev_page() {
    if (current_page.value > 1) {
        go_to_page(current_page.value - 1)
    }
}

function next_page() {
    if (current_page.value < total_pages.value) {
        go_to_page(current_page.value + 1)
    }
}
</script>

<template>
    <div>
        <!-- 相册列表 -->
        <div class="grid grid-cols-2 gap-4">
            <div
                v-for="gallery in galleries"
                :key="gallery.id"
                class="cursor-pointer group"
                @click="open_gallery(gallery.id)"
            >
                <!-- 封面图 -->
                <div class="aspect-square overflow-hidden rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow border border-[var(--c-border)]">
                    <img
                        :src="gallery.cover"
                        :alt="gallery.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                <!-- 信息 -->
                <div class="mt-2">
                    <h3 class="text-sm text-slate-700 font-medium">{{ gallery.title }}</h3>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-slate-400">{{ gallery.count }} 张照片</span>
                        <div class="flex gap-1">
                            <span
                                v-for="tag in gallery.tags"
                                :key="tag"
                                class="px-1.5 py-0.5 text-xs rounded"
                                style="background-color: var(--c-tag-bg); color: var(--c-tag-text)"
                            >
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页组件 -->
        <div v-if="show_pagination" class="flex items-center justify-center gap-2 mt-6">
            <!-- 上一页 -->
            <button
                class="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--c-border)] bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="current_page === 1"
                @click="prev_page"
            >
                <div class="i-lucide-chevron-left w-4 h-4 text-slate-600" />
            </button>

            <!-- 页码 -->
            <template v-for="page in total_pages" :key="page">
                <button
                    class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                    :class="page === current_page
                        ? 'bg-[var(--c-primary)] text-white'
                        : 'border border-[var(--c-border)] bg-white hover:bg-slate-50 text-slate-600'"
                    @click="go_to_page(page)"
                >
                    {{ page }}
                </button>
            </template>

            <!-- 下一页 -->
            <button
                class="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--c-border)] bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="current_page === total_pages"
                @click="next_page"
            >
                <div class="i-lucide-chevron-right w-4 h-4 text-slate-600" />
            </button>
        </div>
    </div>
</template>