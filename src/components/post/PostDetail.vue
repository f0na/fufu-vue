<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import type { PostDetail } from '@/api/types'
import { get_post } from '@/api/post'
import { useToast } from '@/composables/useToast'
import { preprocess_markdown_image_size } from '@/utils/markdown'
import CommentSection from '@/components/comment/CommentSection.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import {
  Loader2,
  Pin,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Folder,
  FileText,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { error } = useToast()

// 文章数据
const post = ref<PostDetail | null>(null)

// 加载状态
const loading = ref(false)

// 预处理后的 Markdown 内容
const processed_content = computed(() => {
  if (post.value?.content) {
    return preprocess_markdown_image_size(post.value.content)
  }
  return ''
})

// 格式化日期
function format_date(date_str: string | null): string {
  if (!date_str) return ''
  const date = new Date(date_str)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 加载文章详情
async function load_post() {
  const id_or_slug = route.params.id as string
  if (!id_or_slug) return

  loading.value = true
  try {
    post.value = await get_post(id_or_slug)
  } catch (e) {
    console.error('加载文章失败:', e)
    error('加载文章失败')
    post.value = null
  } finally {
    loading.value = false
  }
}

// 滚动到评论区
function scroll_to_comments() {
  const comments = document.getElementById('comments-section')
  if (comments) {
    comments.scrollIntoView({ behavior: 'smooth' })
  }
}

// 为 Markdown 标题添加 ID
onMounted(() => {
  load_post()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 加载中 -->
    <div v-if="loading" class="py-12 text-center text-slate-400">
      <Loader2 class="w-8 h-8 animate-spin mx-auto mb-3" />
      <p class="text-sm">加载中...</p>
    </div>

    <!-- 文章内容 -->
    <template v-else-if="post">
      <!-- 标题区 -->
      <div class="bg-white rounded-xl p-6 border border-[var(--c-border)] shadow-sm">
        <!-- 置顶标记 -->
        <div v-if="post.top" class="flex items-center gap-1 mb-2 text-xs text-[var(--c-primary)]">
          <Pin class="w-3 h-3" />
          <span>置顶</span>
        </div>

        <!-- 标题 -->
        <h1 class="text-xl font-bold text-slate-800 mb-3">
          {{ post.title }}
        </h1>

        <!-- 元信息 -->
        <div class="flex items-center gap-3 text-sm text-slate-500 mb-3">
          <div class="flex items-center gap-1">
            <Calendar class="w-3.5 h-3.5" />
            <span>{{ format_date(post.published_at) }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Eye class="w-3.5 h-3.5" />
            <span>{{ post.view_count }}</span>
          </div>
          <div class="flex items-center gap-1">
            <Heart class="w-3.5 h-3.5" />
            <span>{{ post.like_count }}</span>
          </div>
          <div v-if="post.comment_allowed" class="flex items-center gap-1">
            <MessageCircle class="w-3.5 h-3.5" />
            <span>{{ post.comment_count }}</span>
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="px-1.5 py-0.5 text-xs rounded"
            style="background-color: var(--c-tag-bg); color: var(--c-tag-text)"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 分类 -->
        <div v-if="post.category" class="flex items-center gap-1 text-xs text-slate-500">
          <Folder class="w-3 h-3" />
          <span>{{ post.category }}</span>
        </div>
      </div>

      <!-- 封面图 -->
      <div
        v-if="post.cover"
        class="rounded-xl overflow-hidden border border-[var(--c-border)] shadow-sm"
      >
        <img :src="post.cover" :alt="post.title" class="w-full object-cover max-h-64" />
      </div>

      <!-- Markdown 内容 -->
      <div class="bg-white rounded-xl p-6 border border-[var(--c-border)] shadow-sm">
        <div class="band-markdown prose prose-slate max-w-none">
          <MarkdownRenderer :content="processed_content" />
        </div>
      </div>

      <!-- 评论区 -->
      <div id="comments-section" v-if="post.comment_allowed">
        <CommentSection target_type="post" :target_id="post.id" />
      </div>
    </template>

    <!-- 文章不存在 -->
    <div v-else class="py-12 text-center text-slate-400">
      <FileText class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">文章不存在或已被删除</p>
      <button
        @click="router.push('/home/posts')"
        class="mt-4 px-4 py-2 text-sm rounded-lg bg-[var(--c-primary-bg)] text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)]/70 transition-all"
      >
        返回文章列表
      </button>
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>
