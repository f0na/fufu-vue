<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommentSection from '@/components/comment/CommentSection.vue'

interface BangumiInfo {
    id: string
    title: string
    cover: string
    status: 'watching' | 'want_to_watch' | 'watched' | 'dropped'
    rating: number | null
    episodes: number
    description?: string
    tags?: string[]
}

const route = useRoute()
const router = useRouter()

// 番剧 ID
const bangumi_id = computed(() => route.params.id as string)

// 状态显示文本和样式
const status_map = {
    watching: { label: '在看', class: 'bg-[var(--c-primary-bg)] text-slate-700' },
    want_to_watch: { label: '想看', class: 'bg-[var(--c-primary-bg)] text-slate-700' },
    watched: { label: '看过', class: 'bg-[var(--c-primary-bg)] text-slate-700' },
    dropped: { label: '抛弃', class: 'bg-red-100 text-red-600' },
}

// 模拟番剧数据（实际应从 API 获取）
const bangumi = ref<BangumiInfo | null>(null)

// 加载番剧信息
function load_bangumi() {
    // 模拟数据，实际应从 API 获取
    const mock_data: Record<string, BangumiInfo> = {
        '1': { id: '1', title: '葬送的芙莉莲', cover: 'https://t.alcy.cc/moez', status: 'watching', rating: 9.5, episodes: 28, description: '魔王被打倒之后的故事，讲述了活了上千年的精灵魔法使芙莉莲在勇者一行人结束冒险后的旅程。', tags: ['奇幻', '冒险', '治愈'] },
        '2': { id: '2', title: '药屋少女的呢喃', cover: 'https://t.alcy.cc/ycy', status: 'watching', rating: 9.0, episodes: 24, description: '宫廷悬疑题材，讲述了在皇帝后宫中工作的药屋少女猫猫解决各种谜团的故事。', tags: ['悬疑', '古装', '推理'] },
        '3': { id: '3', title: '咒术回战 第二季', cover: 'https://t.alcy.cc/fj', status: 'watched', rating: 8.5, episodes: 23, description: '怀玉·玉折篇，五条悟的高中时代与夏油杰的决裂。', tags: ['战斗', '热血', '黑暗'] },
        '4': { id: '4', title: '鬼灭之刃 柱训练篇', cover: 'https://t.alcy.cc/acg', status: 'want_to_watch', rating: 8.8, episodes: 8, description: '柱训练篇，为了与鬼舞辻无惨的最终决战做准备。', tags: ['战斗', '热血'] },
        '5': { id: '5', title: '进击的巨人 最终季', cover: 'https://www.loliapi.com/acg/', status: 'watched', rating: 9.2, episodes: 16, description: '最终季，艾伦与调查兵团面临世界的真相。', tags: ['战斗', '黑暗', '史诗'] },
    }

    bangumi.value = mock_data[bangumi_id.value] || {
        id: bangumi_id.value,
        title: '未知番剧',
        cover: 'https://t.alcy.cc/moez',
        status: 'want_to_watch' as const,
        rating: null,
        episodes: 12,
        description: '暂无简介',
        tags: []
    }
}

// 返回
function go_back() {
    router.push('/home/bangumi')
}

onMounted(() => {
    load_bangumi()
})
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- 返回按钮 -->
        <button
            @click="go_back"
            class="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--c-primary)] transition-colors self-start"
        >
            <div class="i-lucide-arrow-left w-4 h-4" />
            返回番剧列表
        </button>

        <!-- 番剧信息 -->
        <div v-if="bangumi" class="bg-white rounded-xl shadow-sm border border-[var(--c-border)] overflow-hidden">
            <!-- 封面和基本信息 -->
            <div class="flex flex-col md:flex-row">
                <!-- 封面 -->
                <div class="md:w-48 shrink-0">
                    <div class="aspect-[3/4] md:rounded-l-xl overflow-hidden">
                        <img
                            :src="bangumi.cover"
                            :alt="bangumi.title"
                            class="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <!-- 信息 -->
                <div class="flex-1 p-4">
                    <!-- 标题 -->
                    <h1 class="text-lg md:text-xl font-bold text-slate-800 mb-2">
                        {{ bangumi.title }}
                    </h1>

                    <!-- 状态和评分 -->
                    <div class="flex flex-wrap items-center gap-2 mb-3">
                        <span
                            class="px-2 py-0.5 text-xs rounded-lg"
                            :class="status_map[bangumi.status].class"
                        >
                            {{ status_map[bangumi.status].label }}
                        </span>
                        <span v-if="bangumi.rating" class="px-2 py-0.5 text-xs rounded-lg bg-amber-100 text-amber-700 font-medium">
                            {{ bangumi.rating }} 分
                        </span>
                        <span class="text-xs text-slate-500">
                            {{ bangumi.episodes }} 集
                        </span>
                    </div>

                    <!-- 标签 -->
                    <div v-if="bangumi.tags && bangumi.tags.length > 0" class="flex flex-wrap gap-1.5 mb-3">
                        <span
                            v-for="tag in bangumi.tags"
                            :key="tag"
                            class="px-1.5 py-0.5 text-xs rounded bg-[var(--c-primary-bg)] text-slate-600"
                        >
                            {{ tag }}
                        </span>
                    </div>

                    <!-- 简介 -->
                    <p v-if="bangumi.description" class="text-sm text-slate-600 leading-relaxed">
                        {{ bangumi.description }}
                    </p>
                </div>
            </div>
        </div>

        <!-- 评论区 -->
        <div class="bg-white rounded-xl shadow-sm border border-[var(--c-border)] p-4">
            <CommentSection
                target_type="bangumi"
                :target_id="bangumi_id"
            />
        </div>
    </div>
</template>