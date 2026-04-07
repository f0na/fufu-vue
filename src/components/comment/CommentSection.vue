<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { get_comments, create_comment, create_guest_comment } from '@/api/comment'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useDataCacheStore } from '@/stores/dataCache'
import type { Comment, CommentTarget } from '@/api/types'
import CommentItem from './CommentItem.vue'
import CommentForm from './CommentForm.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import { Loader2, MessageCircle } from 'lucide-vue-next'

const props = defineProps<{
  target_type: CommentTarget
  target_id: string
}>()

const { is_logged_in, user } = useAuth()
const { success, error } = useToast()
const cache_store = useDataCacheStore()

// 加载状态
const loading = ref(false)

// 当前页码
const page = ref(1)

// 是否有更多
const has_more = ref(false)

// 回复状态 - 记录当前正在回复的评论ID
const replying_id = ref<string | null>(null)

// 底部观察元素引用
const bottom_trigger = ref<HTMLElement | null>(null)

// Intersection Observer
let observer: IntersectionObserver | null = null

// 评论列表 - 从缓存获取，如果没有则使用本地数据
const comments = computed(() => {
  const cached = cache_store.get_comments(props.target_id)
  return cached || []
})

// 加载评论
async function load_comments(is_load_more = false) {
  if (loading.value) return

  loading.value = true
  try {
    const res = await get_comments({
      target_type: props.target_type,
      target_id: props.target_id,
      page: page.value,
    })

    if (is_load_more) {
      // 加载更多：追加到缓存
      const cached = cache_store.get_comments(props.target_id) || []
      cache_store.set_comments(props.target_id, [...cached, ...res.items])
    } else {
      // 初次加载：设置缓存
      cache_store.set_comments(props.target_id, res.items)
    }
    has_more.value = res.has_more
  } catch (e) {
    console.error('加载评论失败:', e)
    error('加载评论失败')
  } finally {
    loading.value = false
  }
}

// 加载更多
async function load_more() {
  if (!has_more.value) return

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))
  page.value++
  await load_comments(true)
}

// 检查是否需要加载更多
async function check_and_load() {
  await nextTick()
  if (has_more.value && bottom_trigger.value) {
    const rect = bottom_trigger.value.getBoundingClientRect()
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
    { threshold: 0.1 },
  )

  if (bottom_trigger.value) {
    observer.observe(bottom_trigger.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

// 提交评论（支持顶级评论和回复）
async function handle_submit(data: {
  content: string
  markdown: boolean
  guest_name?: string
  guest_email?: string
  guest_avatar?: string
}, comment_id?: string) {
  try {
    const request_data: {
      target_type: CommentTarget
      target_id: string
      parent_id?: string | null
      reply_to_user_id?: string | null
      reply_to_guest_name?: string | null
      content: string
      markdown: boolean
      guest_name?: string
      guest_email?: string
      guest_avatar?: string
    } = {
      target_type: props.target_type,
      target_id: props.target_id,
      content: data.content,
      markdown: data.markdown,
    }

    // 回复信息 - 根据comment_id查找被回复的评论
    if (comment_id) {
      const reply_comment = find_comment(comments.value, comment_id)
      if (reply_comment) {
        // parent_id 设置为顶级评论的 id
        request_data.parent_id = reply_comment.parent_id || reply_comment.id
        // 只有回复嵌套评论时才设置 reply_to（回复顶级评论不需要 @）
        if (reply_comment.parent_id) {
          if (reply_comment.author.user_id) {
            request_data.reply_to_user_id = reply_comment.author.user_id
          } else {
            request_data.reply_to_guest_name = reply_comment.author.name
          }
        }
      }
    }

    // 游客信息
    if (!is_logged_in.value) {
      request_data.guest_name = data.guest_name
      request_data.guest_email = data.guest_email
      request_data.guest_avatar = data.guest_avatar
    }

    const new_comment = is_logged_in.value
      ? await create_comment(request_data)
      : await create_guest_comment(request_data as Parameters<typeof create_guest_comment>[0])

    // 添加到缓存
    cache_store.add_comment(props.target_id, new_comment, request_data.parent_id || undefined)

    // 关闭回复表单
    replying_id.value = null
    success('评论发表成功')
  } catch (e) {
    console.error('发表评论失败:', e)
    error('发表评论失败')
  }
}

// 递归查找评论
function find_comment(comment_list: Comment[], id: string): Comment | undefined {
  for (const comment of comment_list) {
    if (comment.id === id) return comment
    if (comment.replies.length > 0) {
      const found = find_comment(comment.replies, id)
      if (found) return found
    }
  }
  return undefined
}

// 回复评论 - 设置正在回复的评论ID
function handle_reply(comment: Comment) {
  replying_id.value = comment.id
}

// 取消回复
function handle_cancel_reply() {
  replying_id.value = null
}

// 初始化
onMounted(() => {
  // 如果缓存中没有数据，则加载
  if (!cache_store.get_comments(props.target_id)) {
    load_comments()
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 标题 -->
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium text-slate-700">
        评论
      </h3>
    </div>

    <!-- 评论表单 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <CommentForm @submit="(data) => handle_submit(data)" />
    </div>

    <!-- 评论列表 -->
    <div v-if="comments.length > 0" class="flex flex-col divide-y divide-[var(--c-border)]">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :replying_id="replying_id"
        @reply="handle_reply"
        @submit="handle_submit"
        @cancel="handle_cancel_reply"
      />
    </div>

    <!-- 底部加载触发器 -->
    <div ref="bottom_trigger" class="py-6 flex justify-center">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center gap-2 text-slate-400">
        <Loader2 class="w-5 h-5 animate-spin" />
        <span class="text-sm">加载中...</span>
      </div>
      <!-- 没有更多 -->
      <div v-else-if="!has_more && comments.length > 0" class="text-slate-400 text-sm">
        已经到底了 ~
      </div>
      <!-- 加载更多提示 -->
      <div v-else-if="has_more" class="text-slate-400 text-sm">下拉加载更多</div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && comments.length === 0" class="py-12 text-center">
      <MessageCircle class="w-12 h-12 mx-auto mb-3 text-slate-200" />
      <p class="text-sm text-slate-400">暂无评论，来说点什么吧~</p>
    </div>

    <!-- 加载中 -->
    <div v-if="loading && comments.length === 0" class="py-8 text-center">
      <Loader2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>