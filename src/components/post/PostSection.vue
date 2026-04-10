<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Post } from '@/api/types'
import { delete_post, update_post_status, update_post_top } from '@/api/post'
import { usePostFilter } from '@/composables/usePostFilter'
import { usePostEdit } from '@/composables/usePostEdit'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { usePostStore } from '@/stores/post'
import BackToTop from '@/components/common/BackToTop.vue'
import { Pin, Eye, Heart, MessageCircle, Loader2, FileText } from 'lucide-vue-next'

const router = useRouter()
const { search_query, selected_tag, selected_category, reset_filters } = usePostFilter()
const { edit_mode, set_edit_mode } = usePostEdit()
const { can_toggle_visibility } = useAuth()
const { success, error } = useToast()
const { confirm } = useConfirm()
const post_store = usePostStore()

// 每次加载数量
const load_count = 5

// 当前显示数量
const display_count = ref(load_count)

// 底部观察元素引用
const bottom_trigger = ref<HTMLElement | null>(null)

// Intersection Observer
let observer: IntersectionObserver | null = null

// 加载文章列表
async function load_posts() {
  await post_store.load_posts(can_toggle_visibility.value)
}

// 筛选后的文章列表
const filtered_posts = computed(() => {
  // 先按编辑模式筛选
  let filtered = post_store.posts
  // 非管理模式下只显示已发布的文章
  if (edit_mode.value === 'none') {
    filtered = filtered.filter((p) => p.status === 'published')
  }

  // 搜索关键词筛选
  if (search_query.value.trim()) {
    const query = search_query.value.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.summary?.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)),
    )
  }

  // 标签筛选
  if (selected_tag.value) {
    filtered = filtered.filter((p) => p.tags.includes(selected_tag.value))
  }

  // 分类筛选
  if (selected_category.value) {
    filtered = filtered.filter((p) => p.category === selected_category.value)
  }

  // 置顶文章排在前面
  filtered.sort((a, b) => {
    if (a.top !== b.top) return a.top ? -1 : 1
    const a_time = a.published_at ? new Date(a.published_at).getTime() : 0
    const b_time = b.published_at ? new Date(b.published_at).getTime() : 0
    return b_time - a_time
  })

  return filtered
})

// 当前显示的文章
const posts_list = computed(() => {
  return filtered_posts.value.slice(0, display_count.value)
})

// 是否还有更多
const has_more = computed(() => display_count.value < filtered_posts.value.length)

// 加载更多
async function load_more() {
  if (post_store.loading || !has_more.value) return

  await new Promise((resolve) => setTimeout(resolve, 300))
  display_count.value += load_count
}

// 格式化日期
function format_date(date_str: string | null): string {
  if (!date_str) return ''
  const date = new Date(date_str)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// ========== 管理功能 ==========

// 删除文章
async function handle_delete(post: Post) {
  const confirmed = await confirm(`确定要删除「${post.title}」吗？`)
  if (!confirmed) return

  try {
    await delete_post(post.id)
    post_store.remove_post_local(post.id)
    success('删除成功')
  } catch (e) {
    console.error('删除失败:', e)
    error('删除失败')
  }
}

// 切换状态
async function handle_toggle_status(post: Post) {
  const new_status = post.status === 'published' ? 'draft' : 'published'
  try {
    await update_post_status(post.id, { status: new_status })
    post_store.update_post_local(post.id, { status: new_status })
    success(new_status === 'published' ? '已发布' : '已转为草稿')
  } catch (e) {
    console.error('操作失败:', e)
    error('操作失败')
  }
}

// 切换置顶
async function handle_toggle_top(post: Post) {
  const new_top = !post.top
  try {
    await update_post_top(post.id, { top: new_top })
    post_store.update_post_local(post.id, { top: new_top })
    success(new_top ? '已置顶' : '已取消置顶')
  } catch (e) {
    console.error('操作失败:', e)
    error('操作失败')
  }
}

// 点击文章卡片
function handle_post_click(post: Post) {
  if (edit_mode.value === 'edit') {
    router.push(`/home/posts/${post.id}/edit`)
  } else if (edit_mode.value === 'delete') {
    handle_delete(post)
  } else if (edit_mode.value === 'status') {
    handle_toggle_status(post)
  } else if (edit_mode.value === 'top') {
    handle_toggle_top(post)
  } else {
    router.push(`/home/posts/${post.slug || post.id}`)
  }
}

// 状态显示文本和样式
const status_map: Record<string, { label: string; class: string }> = {
  published: { label: '已发布', class: 'bg-green-100 text-green-700' },
  draft: { label: '草稿', class: 'bg-amber-100 text-amber-700' },
  hidden: { label: '隐藏', class: 'bg-slate-100 text-slate-600' },
}

// 获取操作提示
const mode_hint = computed(() => {
  if (edit_mode.value === 'edit') return '点击文章进行编辑'
  if (edit_mode.value === 'delete') return '点击文章进行删除'
  if (edit_mode.value === 'status') return '点击文章切换发布/草稿状态'
  if (edit_mode.value === 'top') return '点击文章切换置顶'
  return ''
})

// 组件挂载
onMounted(() => {
  load_posts()

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

// 搜索/筛选时重置显示数量
watch([search_query, selected_tag, selected_category], () => {
  display_count.value = load_count
})

// 路由变化时重置编辑模式
watch(
  () => router.currentRoute.value.path,
  () => {
    set_edit_mode('none')
    reset_filters()
  },
)
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

    <!-- 文章卡片列表 -->
    <div class="flex flex-col gap-4">
      <div
        v-for="post in posts_list"
        :key="post.id"
        @click="handle_post_click(post)"
        class="cursor-pointer group p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm hover:shadow-md transition-all"
        :class="{
          'opacity-50': post.status !== 'published' && edit_mode === 'none',
          'ring-2 ring-[var(--c-primary)]': edit_mode !== 'none',
        }"
      >
        <div class="flex gap-4">
          <!-- 左侧内容 -->
          <div class="flex-1 min-w-0">
            <!-- 置顶标记 -->
            <div
              v-if="post.top"
              class="flex items-center gap-1 mb-2 text-xs text-[var(--c-primary)]"
            >
              <Pin class="w-3 h-3" />
              <span>置顶</span>
            </div>

            <!-- 标题 -->
            <h3
              class="text-base font-medium text-slate-700 group-hover:text-[var(--c-primary)] transition-colors mb-2"
            >
              {{ post.title }}
            </h3>

            <!-- 摘要 -->
            <p v-if="post.summary" class="text-sm text-slate-500 line-clamp-2 mb-2">
              {{ post.summary }}
            </p>

            <!-- 标签 -->
            <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1 mb-2">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="px-1.5 py-0.5 text-xs rounded"
                style="background-color: var(--c-tag-bg); color: var(--c-tag-text)"
              >
                {{ tag }}
              </span>
            </div>

            <!-- 统计信息 -->
            <div class="flex items-center gap-3 text-xs text-slate-400">
              <div class="flex items-center gap-1">
                <Eye class="w-3 h-3" />
                <span>{{ post.view_count }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Heart class="w-3 h-3" />
                <span>{{ post.like_count }}</span>
              </div>
              <div class="flex items-center gap-1">
                <MessageCircle class="w-3 h-3" />
                <span>{{ post.comment_count }}</span>
              </div>
              <span>{{ format_date(post.published_at) }}</span>
            </div>

            <!-- 状态标记（管理模式下） -->
            <div v-if="edit_mode !== 'none' && post.status !== 'published'" class="mt-2">
              <span class="px-2 py-1 text-xs rounded-lg" :class="status_map[post.status]?.class">
                {{ status_map[post.status]?.label }}
              </span>
            </div>
          </div>

          <!-- 右侧封面图 -->
          <div v-if="post.cover" class="w-24 h-24 rounded-lg overflow-hidden shrink-0">
            <img :src="post.cover" :alt="post.title" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部加载触发器 -->
    <div ref="bottom_trigger" class="py-6 flex justify-center">
      <!-- 加载中 -->
      <div v-if="post_store.loading" class="flex items-center gap-2 text-slate-400">
        <Loader2 class="w-5 h-5 animate-spin" />
        <span class="text-sm">加载中...</span>
      </div>
      <!-- 没有更多 -->
      <div v-else-if="!has_more && posts_list.length > 0" class="text-slate-400 text-sm">
        已经到底了 ~
      </div>
      <!-- 加载更多提示 -->
      <div v-else-if="has_more" class="text-slate-400 text-sm">下拉加载更多</div>
    </div>

    <!-- 空状态 -->
    <div v-if="posts_list.length === 0" class="py-12 text-center text-slate-400">
      <FileText class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">暂无文章</p>
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>
