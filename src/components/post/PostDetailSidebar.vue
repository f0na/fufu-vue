<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { PostDetail, PostTocItem } from '@/api/types'
import { get_post } from '@/api/post'
import { toggle_like, check_like } from '@/api/like'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { success, error } = useToast()

// 文章数据
const post = ref<PostDetail | null>(null)

// 是否已点赞
const is_liked = ref(false)

// 点赞数（本地状态）
const like_count = ref(0)

// 加载状态
const loading = ref(false)

const emit = defineEmits<{
  scroll_comments: []
}>()

// 加载文章详情
async function load_post() {
  const id_or_slug = route.params.id as string
  if (!id_or_slug) return

  loading.value = true
  try {
    post.value = await get_post(id_or_slug)
    like_count.value = post.value.like_count
    // 检查点赞状态
    try {
      const res = await check_like({ target_type: 'post', target_id: post.value.id })
      is_liked.value = res.liked
    } catch {
      // 静默失败
    }
  } catch {
    post.value = null
  } finally {
    loading.value = false
  }
}

// 处理点赞
async function handle_like() {
  if (!post.value) return

  try {
    const res = await toggle_like({ target_type: 'post', target_id: post.value.id })
    is_liked.value = res.liked
    like_count.value = res.like_count
    success(res.liked ? '点赞成功' : '已取消点赞')
  } catch (e) {
    console.error('点赞失败:', e)
    error('点赞失败')
  }
}

// 滚动到评论区
function scroll_to_comments() {
  emit('scroll_comments')
}

// 从 Markdown 内容提取目录
function get_toc_from_content(content: string): PostTocItem[] {
  if (!content) return []

  const lines = content.split('\n')
  const headings: { id: string; text: string; level: number }[] = []

  lines.forEach((line, index) => {
    const match = line.match(/^#{1,6}\s+(.+)$/)
    if (match && match[1]) {
      const level = line.match(/^#+/)?.[0]?.length || 1
      const text = match[1].trim()
      const id = `heading-${index}`
      headings.push({ id, text, level })
    }
  })

  // 构建树形结构
  const root: PostTocItem[] = []
  const stack: PostTocItem[] = []

  headings.forEach((h) => {
    const item: PostTocItem = { id: h.id, text: h.text, level: h.level, children: [] }

    while (stack.length > 0 && stack[stack.length - 1]!.level >= h.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      root.push(item)
    } else {
      stack[stack.length - 1]!.children.push(item)
    }

    stack.push(item)
  })

  return root
}

// 目录数据
const toc_items = computed(() => {
  if (!post.value?.content) return []
  return get_toc_from_content(post.value.content)
})

// 目录项点击
function handle_toc_click(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 搜索跳转
function handle_search(e: KeyboardEvent) {
  const input = e.target as HTMLInputElement
  if (input.value.trim()) {
    window.location.href = `/home/posts?keyword=${encodeURIComponent(input.value.trim())}`
  }
}

// 监听路由变化加载文章
watch(() => route.params.id, () => {
  load_post()
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 搜索框（跳转搜索） -->
    <div
      class="rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--c-border)] shadow-sm overflow-hidden"
    >
      <div class="relative">
        <div class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
          <div class="i-lucide-search w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          placeholder="搜索文章..."
          class="w-full pl-7 pr-2 py-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
          @keydown.enter="handle_search"
        />
      </div>
    </div>

    <!-- 文章信息 -->
    <div v-if="post" class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-xs font-medium text-slate-500 mb-2">文章信息</h3>
      <div class="flex flex-col gap-2">
        <!-- 浏览数 -->
        <div class="flex items-center gap-2 text-xs text-slate-600">
          <div class="i-lucide-eye w-3.5 h-3.5" />
          <span>{{ post.view_count }}</span>
        </div>
        <!-- 点赞数（可点击） -->
        <button
          @click="handle_like"
          class="flex items-center gap-2 text-xs transition-all"
          :class="is_liked ? 'text-[var(--c-primary)]' : 'text-slate-600 hover:text-[var(--c-primary)]'"
        >
          <div class="i-lucide-heart w-3.5 h-3.5" :class="is_liked ? 'fill-current' : ''" />
          <span>{{ like_count }}</span>
        </button>
        <!-- 评论数（可点击） -->
        <button
          v-if="post.comment_allowed"
          @click="scroll_to_comments"
          class="flex items-center gap-2 text-xs text-slate-600 hover:text-[var(--c-primary)] transition-all"
        >
          <div class="i-lucide-message-circle w-3.5 h-3.5" />
          <span>{{ post.comment_count }}</span>
        </button>
      </div>
    </div>

    <!-- 摘要 -->
    <div v-if="post?.summary" class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
        <div class="i-lucide-file-text w-3 h-3" />
        摘要
      </h3>
      <p class="text-xs text-slate-600 line-clamp-4">{{ post.summary }}</p>
    </div>

    <!-- 目录 -->
    <div v-if="toc_items.length > 0" class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
        <div class="i-lucide-list w-3 h-3" />
        目录
      </h3>
      <nav class="text-xs">
        <template v-for="item in toc_items" :key="item.id">
          <button
            @click="handle_toc_click(item.id)"
            class="py-1 text-left text-slate-600 hover:text-[var(--c-primary)] transition-colors truncate block"
            :style="{ paddingLeft: `${(item.level - 1) * 8}px` }"
          >
            {{ item.text }}
          </button>
          <!-- 子标题 -->
          <template v-for="child in item.children" :key="child.id">
            <button
              @click="handle_toc_click(child.id)"
              class="py-1 text-left text-slate-600 hover:text-[var(--c-primary)] transition-colors truncate block"
              :style="{ paddingLeft: `${(child.level - 1) * 8}px` }"
            >
              {{ child.text }}
            </button>
          </template>
        </template>
      </nav>
    </div>
  </div>
</template>