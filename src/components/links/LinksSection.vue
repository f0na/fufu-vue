<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useLinksFilter } from '@/composables/useLinksFilter'
import { useToast } from '@/composables/useToast'
import BackToTop from '@/components/common/BackToTop.vue'

// 链接数据类型
interface LinkItem {
    id: string
    title: string
    url: string
    description: string
    tags: string[]
}

// 使用共享筛选状态
const { links_filter, search_query, set_all_tags } = useLinksFilter()
const { success } = useToast()

// 每次加载的分组数量
const load_count = 3

// 当前显示的分组数量
const display_group_count = ref(load_count)

// 加载状态
const loading = ref(false)

// 底部观察元素引用
const bottom_trigger = ref<HTMLElement | null>(null)

// Intersection Observer
let observer: IntersectionObserver | null = null

// 模拟链接列表数据（实际应从 API 获取）
const all_links: LinkItem[] = [
    { id: '1', title: 'GitHub', url: 'https://github.com', description: '全球最大的代码托管平台', tags: ['开发'] },
    { id: '2', title: 'Vue.js', url: 'https://vuejs.org', description: '渐进式 JavaScript 框架', tags: ['开发', '前端'] },
    { id: '3', title: 'Bilibili', url: 'https://bilibili.com', description: '国内知名视频弹幕网站', tags: ['视频'] },
    { id: '4', title: 'Twitter / X', url: 'https://twitter.com', description: '社交媒体平台', tags: ['社交'] },
    { id: '5', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Web 开发者文档', tags: ['开发', '文档'] },
    { id: '6', title: 'Stack Overflow', url: 'https://stackoverflow.com', description: '程序员问答社区', tags: ['开发', '社区'] },
    { id: '7', title: 'Dribbble', url: 'https://dribbble.com', description: '设计师作品展示平台', tags: ['设计'] },
    { id: '8', title: 'Figma', url: 'https://figma.com', description: '在线协作设计工具', tags: ['设计', '工具'] },
    { id: '9', title: 'Notion', url: 'https://notion.so', description: '笔记与协作工具', tags: ['工具', '效率'] },
    { id: '10', title: 'Vercel', url: 'https://vercel.com', description: '前端部署平台', tags: ['开发', '部署'] },
    { id: '11', title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: '实用优先的 CSS 框架', tags: ['开发', '前端'] },
    { id: '12', title: 'Unsplash', url: 'https://unsplash.com', description: '免费高质量图片库', tags: ['图片', '资源'] },
    { id: '13', title: '知乎', url: 'https://zhihu.com', description: '中文问答社区', tags: ['社区'] },
    { id: '14', title: '豆瓣', url: 'https://douban.com', description: '书影音评分网站', tags: ['娱乐'] },
    { id: '15', title: '微博', url: 'https://weibo.com', description: '中文社交媒体', tags: ['社交'] },
    { id: '16', title: 'YouTube', url: 'https://youtube.com', description: '全球最大视频平台', tags: ['视频'] },
    { id: '17', title: 'Spotify', url: 'https://spotify.com', description: '音乐流媒体服务', tags: ['音乐'] },
    { id: '18', title: 'Netflix', url: 'https://netflix.com', description: '流媒体影视平台', tags: ['视频', '娱乐'] },
]

// 所有标签
const all_tags = computed(() => {
    const tags = new Set<string>()
    all_links.forEach(link => {
        link.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
})

// 组件挂载时设置标签
onMounted(() => {
    set_all_tags(all_tags.value)
})

// 按标签分组的全部链接
const all_grouped_links = computed(() => {
    // 先按搜索关键词筛选
    let filtered_by_search = all_links
    if (search_query.value.trim()) {
        const query = search_query.value.toLowerCase()
        filtered_by_search = all_links.filter(l =>
            l.title.toLowerCase().includes(query) ||
            l.description.toLowerCase().includes(query) ||
            l.tags.some(tag => tag.toLowerCase().includes(query))
        )
    }

    // 如果有标签筛选，只显示筛选的标签组
    if (links_filter.value !== 'all') {
        const filtered = filtered_by_search.filter(l => l.tags.includes(links_filter.value))
        return [{ tag: links_filter.value, links: filtered }]
    }

    // 否则按标签分组
    const groups: Record<string, LinkItem[]> = {}
    filtered_by_search.forEach(link => {
        link.tags.forEach(tag => {
            if (!groups[tag]) {
                groups[tag] = []
            }
            // 避免重复添加（如果链接有多个标签，在每个标签组中都显示）
            if (!groups[tag].find(l => l.id === link.id)) {
                groups[tag].push(link)
            }
        })
    })

    // 转换为数组并按标签名排序
    return Object.entries(groups)
        .map(([tag, links]) => ({ tag, links }))
        .sort((a, b) => a.tag.localeCompare(b.tag, 'zh-CN'))
})

// 当前显示的分组链接
const grouped_links = computed(() => {
    return all_grouped_links.value.slice(0, display_group_count.value)
})

// 是否还有更多
const has_more = computed(() => display_group_count.value < all_grouped_links.value.length)

// 加载更多
async function load_more() {
    if (loading.value || !has_more.value) return

    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    display_group_count.value += load_count
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

// 获取网站图标 URL（使用国内友好的服务）
function get_favicon_url(url: string): string {
    try {
        const domain = new URL(url).hostname
        // 使用 favicon.im 服务（国内友好）
        return `https://favicon.im/${domain}?icon=icon`
    } catch {
        return ''
    }
}

// 打开链接
function open_link(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
}

// 复制链接
async function copy_link(url: string, title: string) {
    try {
        await navigator.clipboard.writeText(url)
        success(`已复制 ${title} 链接`)
    } catch {
        console.error('复制失败')
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
watch(links_filter, () => {
    display_group_count.value = load_count
    check_and_load()
})
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- 标签分组 -->
        <div v-for="group in grouped_links" :key="group.tag" class="flex flex-col gap-3">
            <!-- 标签标题 -->
            <div class="flex items-center gap-2">
                <div class="w-1 h-4 rounded-full bg-[var(--c-primary)]" />
                <h2 class="text-sm font-medium text-slate-700">
                    {{ group.tag }}
                </h2>
                <span class="text-xs text-slate-400">{{ group.links.length }}</span>
            </div>

            <!-- 链接列表 -->
            <div class="flex flex-col gap-2">
                <div
                    v-for="link in group.links"
                    :key="link.id"
                    class="cursor-pointer group p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm hover:shadow-md transition-all flex items-center gap-3"
                >
                    <!-- 点击区域：打开链接 -->
                    <div @click="open_link(link.url)" class="flex items-center gap-3 flex-1 min-w-0">
                        <!-- 网站图标 -->
                        <div class="w-9 h-9 rounded-lg bg-[var(--c-primary-bg)] flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                                :src="get_favicon_url(link.url)"
                                :alt="link.title"
                                class="w-5 h-5 object-contain"
                                loading="lazy"
                                @error="(e: Event) => (e.target as HTMLImageElement).style.display = 'none'"
                            />
                        </div>

                        <!-- 内容 -->
                        <div class="flex-1 min-w-0">
                            <h3 class="text-sm font-medium text-slate-700 group-hover:text-[var(--c-primary)] transition-colors">
                                {{ link.title }}
                            </h3>
                            <p v-if="link.description" class="text-xs text-slate-400 mt-0.5 truncate">
                                {{ link.description }}
                            </p>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <!-- 复制链接 -->
                        <button
                            @click.stop="copy_link(link.url, link.title)"
                            class="px-3 py-2 flex items-center justify-center gap-1 rounded-lg hover:bg-slate-100 transition-colors text-xs text-slate-400 hover:text-slate-600"
                            title="复制链接"
                        >
                            <div class="i-lucide-copy w-4 h-4" />
                            <span>复制</span>
                        </button>
                        <!-- 打开链接 -->
                        <button
                            @click.stop="open_link(link.url)"
                            class="px-3 py-2 flex items-center justify-center gap-1 rounded-lg hover:bg-slate-100 transition-colors text-xs text-slate-400 hover:text-slate-600"
                            title="打开链接"
                        >
                            <div class="i-lucide-arrow-up-right w-4 h-4" />
                            <span>打开</span>
                        </button>
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
            <div v-else-if="!has_more && grouped_links.length > 0" class="text-slate-400 text-sm">
                已经到底了 ~
            </div>
            <!-- 加载更多提示 -->
            <div v-else-if="has_more" class="text-slate-400 text-sm">
                下拉加载更多
            </div>
        </div>

        <!-- 空状态 -->
        <div v-if="grouped_links.length === 0" class="py-12 text-center text-slate-400">
            <div class="i-lucide-inbox w-12 h-12 mx-auto mb-3 opacity-50" />
            <p class="text-sm">暂无链接</p>
        </div>

        <!-- 回到顶部 -->
        <BackToTop />
    </div>
</template>