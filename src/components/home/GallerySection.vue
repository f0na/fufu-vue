<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 每次加载数量
const load_count = 4

// 当前显示数量
const display_count = ref(load_count)

// 加载状态
const loading = ref(false)

// 底部观察元素引用
const bottom_trigger = ref<HTMLElement | null>(null)

// Intersection Observer
let observer: IntersectionObserver | null = null

// 模拟相册列表（实际应从 API 获取）
const all_galleries = ref([
    { id: 1, title: '日常随拍', cover: 'https://t.alcy.cc/moez', count: 12, tags: ['日常', '生活'] },
    { id: 2, title: '旅行记录', cover: 'https://t.alcy.cc/fj', count: 8, tags: ['旅行', '风景'] },
    { id: 3, title: '萌宠日常', cover: 'https://t.alcy.cc/ycy', count: 15, tags: ['萌宠', '可爱'] },
    { id: 4, title: '美食分享', cover: 'https://www.loliapi.com/acg/', count: 6, tags: ['美食', '记录'] },
    { id: 5, title: '城市街拍', cover: 'https://t.alcy.cc/moez', count: 20, tags: ['城市', '街拍'] },
    { id: 6, title: '自然风光', cover: 'https://t.alcy.cc/fj', count: 18, tags: ['自然', '风景'] },
    { id: 7, title: '人像摄影', cover: 'https://t.alcy.cc/ycy', count: 10, tags: ['人像', '摄影'] },
    { id: 8, title: '夜景集锦', cover: 'https://www.loliapi.com/acg/', count: 14, tags: ['夜景', '城市'] },
])

// 当前显示的相册
const galleries = computed(() => {
    return all_galleries.value.slice(0, display_count.value)
})

// 是否还有更多
const has_more = computed(() => display_count.value < all_galleries.value.length)

// 加载更多
async function load_more() {
    if (loading.value || !has_more.value) return

    loading.value = true
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    display_count.value += load_count
    loading.value = false
}

function open_gallery(id: number) {
    router.push(`/gallery/${id}`)
}

// 设置 Intersection Observer
onMounted(() => {
    observer = new IntersectionObserver(
        (entries) => {
            if (entries[0]?.isIntersecting && has_more.value) {
                load_more()
            }
        },
        { threshold: 0.1 }
    )

    if (bottom_trigger.value) {
        observer.observe(bottom_trigger.value)
    }
})

onUnmounted(() => {
    observer?.disconnect()
})
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

        <!-- 底部加载触发器 -->
        <div ref="bottom_trigger" class="py-6 flex justify-center">
            <!-- 加载中 -->
            <div v-if="loading" class="flex items-center gap-2 text-slate-400">
                <div class="i-lucide-loader-2 w-5 h-5 animate-spin" />
                <span class="text-sm">加载中...</span>
            </div>
            <!-- 没有更多 -->
            <div v-else-if="!has_more && galleries.length > 0" class="text-slate-400 text-sm">
                已经到底了 ~
            </div>
            <!-- 加载更多提示 -->
            <div v-else-if="has_more" class="text-slate-400 text-sm">
                下拉加载更多
            </div>
        </div>
    </div>
</template>