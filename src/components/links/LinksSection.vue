<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLinksFilter } from '@/composables/useLinksFilter'
import { useToast } from '@/composables/useToast'
import { useLinkEdit } from '@/composables/useLinkEdit'
import { useAuth } from '@/composables/useAuth'
import { useConfirm } from '@/composables/useConfirm'
import { get_links, get_admin_links, delete_link, toggle_link_visibility } from '@/api/link'
import type { Link } from '@/api/types'
import BackToTop from '@/components/common/BackToTop.vue'
import { Copy, ArrowUpRight, Loader2, Inbox } from 'lucide-vue-next'

// 使用共享筛选状态
const { links_filter, search_query, set_all_tags } = useLinksFilter()
const { success, error } = useToast()
const { edit_mode, set_edit_mode } = useLinkEdit()
const { can_toggle_visibility } = useAuth()
const { confirm } = useConfirm()
const router = useRouter()

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

// 所有链接
const all_links = ref<Link[]>([])

// 所有标签
const all_tags = computed(() => {
  const tags = new Set<string>()
  all_links.value.forEach((link) => {
    link.tags.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags)
})

// 加载链接列表
async function load_links() {
  loading.value = true
  try {
    // 管理员使用管理接口获取所有链接（含隐藏）
    const res = can_toggle_visibility.value
      ? await get_admin_links({ per_page: 100 })
      : await get_links({ per_page: 100 })
    all_links.value = res.items
    set_all_tags(all_tags.value)
  } catch (e) {
    console.error('加载链接失败:', e)
    error('加载链接失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  load_links()
})

// 按标签分组的全部链接
const all_grouped_links = computed(() => {
  // 先按搜索关键词筛选
  let filtered_by_search = all_links.value

  // 显隐模式下显示所有链接，否则只显示可见的
  if (edit_mode.value !== 'visibility') {
    filtered_by_search = filtered_by_search.filter((l) => l.visible)
  }

  if (search_query.value.trim()) {
    const query = search_query.value.toLowerCase()
    filtered_by_search = filtered_by_search.filter(
      (l) =>
        l.title.toLowerCase().includes(query) ||
        (l.description?.toLowerCase().includes(query) ?? false) ||
        l.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  // 如果有标签筛选，只显示筛选的标签组
  if (links_filter.value !== 'all') {
    const filtered = filtered_by_search.filter((l) => l.tags.includes(links_filter.value))
    return [{ tag: links_filter.value, links: filtered }]
  }

  // 否则按标签分组
  const groups: Record<string, Link[]> = {}
  filtered_by_search.forEach((link) => {
    link.tags.forEach((tag) => {
      if (!groups[tag]) {
        groups[tag] = []
      }
      // 避免重复添加（如果链接有多个标签，在每个标签组中都显示）
      if (!groups[tag].find((l) => l.id === link.id)) {
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
  await new Promise((resolve) => setTimeout(resolve, 300))
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

// ========== 管理功能 ==========

// 删除链接
async function handle_delete(link: Link) {
  const confirmed = await confirm(`确定要删除「${link.title}」吗？`)
  if (!confirmed) return

  try {
    await delete_link(link.id)
    success('删除成功')
    load_links()
  } catch (e) {
    console.error('删除失败:', e)
    error('删除失败')
  }
}

// 切换可见性
async function handle_toggle_visibility(link: Link) {
  const new_visible = !link.visible
  try {
    await toggle_link_visibility(link.id, new_visible)
    // 本地更新状态
    const target = all_links.value.find((l) => l.id === link.id)
    if (target) {
      target.visible = new_visible
    }
    success(new_visible ? '已显示' : '已隐藏')
  } catch (e) {
    console.error('操作失败:', e)
    error('操作失败')
  }
}

// 点击链接卡片（根据编辑模式执行不同操作）
function handle_link_click(link: Link) {
  if (edit_mode.value === 'edit') {
    router.push(`/home/links/${link.id}/edit`)
  } else if (edit_mode.value === 'delete') {
    handle_delete(link)
  } else if (edit_mode.value === 'visibility') {
    handle_toggle_visibility(link)
  } else {
    open_link(link.url)
  }
}

// 获取操作提示
const mode_hint = computed(() => {
  if (edit_mode.value === 'edit') return '点击链接进行编辑'
  if (edit_mode.value === 'delete') return '点击链接进行删除'
  if (edit_mode.value === 'visibility') return '点击链接切换显/隐'
  return ''
})

// 设置 Intersection Observer
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && has_more.value) {
        load_more()
      }
    },
    { threshold: 0.1 },
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
    <!-- 编辑模式提示 -->
    <div
      v-if="edit_mode !== 'none'"
      class="flex items-center justify-between px-4 py-2 rounded-lg bg-[var(--c-primary-bg)] text-sm"
    >
      <span class="text-slate-600">
        {{ mode_hint }}
      </span>
      <button @click="set_edit_mode('none')" class="text-[var(--c-primary)] hover:underline">
        取消
      </button>
    </div>

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
          @click="handle_link_click(link)"
          class="cursor-pointer group p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm hover:shadow-md transition-all flex items-center gap-3"
          :class="{
            'opacity-50': !link.visible,
            'ring-2 ring-[var(--c-primary)]': edit_mode === 'edit',
          }"
        >
          <!-- 网站图标 -->
          <div
            class="w-9 h-9 rounded-lg bg-[var(--c-primary-bg)] flex items-center justify-center shrink-0 overflow-hidden"
          >
            <img
              v-if="link.icon"
              :src="link.icon"
              :alt="link.title"
              class="w-5 h-5 object-contain"
              loading="lazy"
              @error="(e: Event) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
            <img
              v-else
              :src="get_favicon_url(link.url)"
              :alt="link.title"
              class="w-5 h-5 object-contain"
              loading="lazy"
              @error="(e: Event) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
          </div>

          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <h3
              class="text-sm font-medium text-slate-700 group-hover:text-[var(--c-primary)] transition-colors"
            >
              {{ link.title }}
            </h3>
            <p v-if="link.description" class="text-xs text-slate-400 mt-0.5 truncate">
              {{ link.description }}
            </p>
          </div>

          <!-- 操作按钮 -->
          <div
            class="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
          >
            <!-- 复制链接 -->
            <button
              @click.stop="copy_link(link.url, link.title)"
              class="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              title="复制链接"
            >
              <Copy class="w-4 h-4" />
            </button>
            <!-- 打开链接 -->
            <button
              @click.stop="open_link(link.url)"
              class="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              title="打开链接"
            >
              <ArrowUpRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部加载触发器 -->
    <div ref="bottom_trigger" class="py-6 flex justify-center">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center gap-2 text-slate-400">
        <Loader2 class="w-5 h-5 animate-spin" />
        <span class="text-sm">加载中...</span>
      </div>
      <!-- 没有更多 -->
      <div v-else-if="!has_more && grouped_links.length > 0" class="text-slate-400 text-sm">
        已经到底了 ~
      </div>
      <!-- 加载更多提示 -->
      <div v-else-if="has_more" class="text-slate-400 text-sm">下拉加载更多</div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && grouped_links.length === 0" class="py-12 text-center text-slate-400">
      <Inbox class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">暂无链接</p>
    </div>

    <!-- 回到顶部 -->
    <back-to-top />
  </div>
</template>
