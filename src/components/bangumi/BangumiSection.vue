<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useBangumiFilter } from '@/composables/useBangumiStats'

// 使用共享筛选状态
const { bangumi_filter } = useBangumiFilter()

// 状态显示文本和样式
const status_map = {
    watching: { label: '在看', class: 'bg-[var(--c-primary-bg)] text-slate-700' },
    want_to_watch: { label: '想看', class: 'bg-[var(--c-primary-bg)] text-slate-700' },
    watched: { label: '看过', class: 'bg-[var(--c-primary-bg)] text-slate-700' },
    dropped: { label: '抛弃', class: 'bg-[var(--c-primary-bg)] text-slate-700' },
}

// 每次加载数量
const load_count = 6

// 当前显示数量
const display_count = ref(load_count)

// 加载状态
const loading = ref(false)

// 底部观察元素引用
const bottom_trigger = ref<HTMLElement | null>(null)

// Intersection Observer
let observer: IntersectionObserver | null = null

// 模拟番剧列表数据（实际应从 API 获取）
const all_bangumi = ref([
    { id: '1', title: '葬送的芙莉莲', cover: 'https://t.alcy.cc/moez', status: 'watching' as const, rating: 9.5, episodes: 28 },
    { id: '2', title: '药屋少女的呢喃', cover: 'https://t.alcy.cc/ycy', status: 'watching' as const, rating: 9.0, episodes: 24 },
    { id: '3', title: '咒术回战 第二季', cover: 'https://t.alcy.cc/fj', status: 'watched' as const, rating: 8.5, episodes: 23 },
    { id: '4', title: '鬼灭之刃 柱训练篇', cover: 'https://t.alcy.cc/acg', status: 'want_to_watch' as const, rating: 8.8, episodes: 8 },
    { id: '5', title: '进击的巨人 最终季', cover: 'https://www.loliapi.com/acg/', status: 'watched' as const, rating: 9.2, episodes: 16 },
    { id: '6', title: '间谍过家家 第二季', cover: 'https://t.alcy.cc/moez', status: 'watching' as const, rating: 8.7, episodes: 12 },
    { id: '7', title: '孤独摇滚！', cover: 'https://t.alcy.cc/ycy', status: 'watched' as const, rating: 9.3, episodes: 12 },
    { id: '8', title: '我推的孩子', cover: 'https://t.alcy.cc/fj', status: 'want_to_watch' as const, rating: 8.6, episodes: 11 },
    { id: '9', title: '迷宫饭', cover: 'https://t.alcy.cc/acg', status: 'dropped' as const, rating: 7.5, episodes: 24 },
    { id: '10', title: '物语系列', cover: 'https://www.loliapi.com/acg/', status: 'watched' as const, rating: 9.0, episodes: 30 },
    { id: '11', title: '辉夜大小姐想让我告白', cover: 'https://t.alcy.cc/moez', status: 'watched' as const, rating: 8.8, episodes: 12 },
    { id: '12', title: '赛博朋克：边缘行者', cover: 'https://t.alcy.cc/ycy', status: 'watched' as const, rating: 9.1, episodes: 10 },
    { id: '13', title: '无职转生', cover: 'https://t.alcy.cc/moez', status: 'watched' as const, rating: 8.9, episodes: 23 },
    { id: '14', title: 'Re:从零开始的异世界生活', cover: 'https://t.alcy.cc/ycy', status: 'watched' as const, rating: 8.8, episodes: 25 },
    { id: '15', title: '刀剑神域', cover: 'https://t.alcy.cc/fj', status: 'watched' as const, rating: 8.0, episodes: 24 },
    { id: '16', title: '紫罗兰永恒花园', cover: 'https://t.alcy.cc/acg', status: 'watched' as const, rating: 9.4, episodes: 13 },
    { id: '17', title: '你的名字', cover: 'https://www.loliapi.com/acg/', status: 'watched' as const, rating: 9.0, episodes: 1 },
    { id: '18', title: '天气之子', cover: 'https://t.alcy.cc/moez', status: 'watched' as const, rating: 8.5, episodes: 1 },
])

// 筛选后的番剧列表
const filtered_bangumi = computed(() => {
    if (bangumi_filter.value === 'all') {
        return all_bangumi.value
    }
    return all_bangumi.value.filter(b => b.status === bangumi_filter.value)
})

// 当前显示的番剧
const bangumi_list = computed(() => {
    return filtered_bangumi.value.slice(0, display_count.value)
})

// 是否还有更多
const has_more = computed(() => display_count.value < filtered_bangumi.value.length)

// 加载更多
async function load_more() {
    if (loading.value || !has_more.value) return

    loading.value = true
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    display_count.value += load_count
    loading.value = false
}

// 检查是否需要加载更多（用于筛选变化后）
async function check_and_load() {
    await nextTick()
    if (has_more.value && bottom_trigger.value) {
        const rect = bottom_trigger.value.getBoundingClientRect()
        // 如果触发器在视口内，加载更多
        if (rect.top < window.innerHeight) {
            load_more()
        }
    }
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

// 筛选变化时重置并检查是否需要加载更多
watch(bangumi_filter, () => {
    display_count.value = load_count
    check_and_load()
})
</script>

<template>
    <div>
        <!-- 番剧卡片网格 -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div
                v-for="bangumi in bangumi_list"
                :key="bangumi.id"
                class="cursor-pointer group"
            >
                <!-- 封面图 -->
                <div class="aspect-[3/4] overflow-hidden rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow border border-[var(--c-border)] relative">
                    <img
                        :src="bangumi.cover"
                        :alt="bangumi.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <!-- 状态标签 -->
                    <div class="absolute top-2 right-2">
                        <span
                            class="px-2 py-1 text-xs rounded-lg shadow-sm"
                            :class="status_map[bangumi.status].class"
                        >
                            {{ status_map[bangumi.status].label }}
                        </span>
                    </div>
                    <!-- 评分 -->
                    <div v-if="bangumi.rating" class="absolute bottom-2 left-2">
                        <span class="px-2 py-1 text-xs rounded-lg bg-white/90 shadow-sm text-slate-700 font-medium">
                            {{ bangumi.rating }}
                        </span>
                    </div>
                </div>

                <!-- 信息 -->
                <div class="mt-2">
                    <h3 class="text-sm text-slate-700 font-medium truncate">{{ bangumi.title }}</h3>
                    <div v-if="bangumi.episodes" class="text-xs text-slate-400 mt-1">
                        {{ bangumi.episodes }} 集
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
            <div v-else-if="!has_more && bangumi_list.length > 0" class="text-slate-400 text-sm">
                已经到底了 ~
            </div>
            <!-- 加载更多提示 -->
            <div v-else-if="has_more" class="text-slate-400 text-sm">
                下拉加载更多
            </div>
        </div>
    </div>
</template>