<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLinksFilter } from '@/composables/useLinksFilter'
import { useToast } from '@/composables/useToast'

// 使用共享筛选状态
const { links_filter, set_all_tags } = useLinksFilter()
const { success } = useToast()

// 模拟链接列表数据（实际应从 API 获取）
const all_links = [
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

// 按标签分组的链接
const grouped_links = computed(() => {
    // 如果有筛选，只显示筛选的标签组
    if (links_filter.value !== 'all') {
        const filtered = all_links.filter(l => l.tags.includes(links_filter.value))
        return [{ tag: links_filter.value, links: filtered }]
    }

    // 否则按标签分组
    const groups: Record<string, typeof all_links> = {}
    all_links.forEach(link => {
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
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- 标签分组 -->
        <div v-for="group in grouped_links" :key="group.tag" class="flex flex-col gap-3">
            <!-- 标签标题 -->
            <h2 class="text-sm font-medium text-slate-600 px-1">
                {{ group.tag }}
            </h2>

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

        <!-- 空状态 -->
        <div v-if="grouped_links.length === 0" class="py-12 text-center text-slate-400">
            <div class="i-lucide-inbox w-12 h-12 mx-auto mb-3 opacity-50" />
            <p class="text-sm">暂无链接</p>
        </div>
    </div>
</template>