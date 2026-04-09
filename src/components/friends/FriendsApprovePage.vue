<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { get_admin_friends, update_friend_status } from '@/api/friend'
import { useConfirm } from '@/composables/useConfirm'
import { useFriendsStore } from '@/stores/friends'
import type { Friend } from '@/api/types'
import BackToTop from '@/components/common/BackToTop.vue'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const { success, error } = useToast()
const { confirm } = useConfirm()
const friends_store = useFriendsStore()

// 待审批友链列表
const pending_friends = ref<Friend[]>([])

// 加载状态
const loading = ref(false)
const action_loading = ref<string | null>(null)

// 获取网站图标 URL
function get_favicon_url(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://favicon.im/${domain}?icon=icon`
  } catch {
    return ''
  }
}

// 加载待审批友链
async function load_pending_friends() {
  loading.value = true
  try {
    const res = await get_admin_friends({ status: 'pending', per_page: 100 })
    pending_friends.value = res.items
  } catch (e) {
    console.error('加载待审批友链失败:', e)
    error('加载待审批友链失败')
  } finally {
    loading.value = false
  }
}

// 批准友链
async function handle_approve(friend: Friend) {
  const confirmed = await confirm(`确定批准「${friend.name}」的友链申请吗？`)
  if (!confirmed) return

  action_loading.value = friend.id
  try {
    await update_friend_status(friend.id, 'active')
    // 更新或添加到缓存（确保审批后的友链立即可见）
    friends_store.upsert_friend_local({
      ...friend,
      status: 'active',
      visible: true,
    })
    pending_friends.value = pending_friends.value.filter((f) => f.id !== friend.id)
    success('已批准')
  } catch (e) {
    console.error('批准失败:', e)
    error('批准失败')
  } finally {
    action_loading.value = null
  }
}

// 拒绝友链
async function handle_reject(friend: Friend) {
  const confirmed = await confirm(`确定拒绝「${friend.name}」的友链申请吗？`)
  if (!confirmed) return

  action_loading.value = friend.id
  try {
    await update_friend_status(friend.id, 'inactive')
    friends_store.remove_friend_local(friend.id)
    pending_friends.value = pending_friends.value.filter((f) => f.id !== friend.id)
    success('已拒绝')
  } catch (e) {
    console.error('拒绝失败:', e)
    error('拒绝失败')
  } finally {
    action_loading.value = null
  }
}

// 返回
function go_back() {
  router.back()
}

// 打开链接
function open_link(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// 初始化
onMounted(() => {
  load_pending_friends()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 返回按钮 -->
    <button
      @click="go_back"
      class="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--c-primary)] transition-colors self-start"
    >
      <ArrowLeft class="w-4 h-4" />
      返回
    </button>

    <!-- 标题 -->
    <h1 class="text-xl font-medium text-slate-700">待审批友链</h1>

    <!-- 加载中 -->
    <div v-if="loading" class="py-12 flex justify-center">
      <Loader2 class="w-8 h-8 animate-spin text-slate-400" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="pending_friends.length === 0" class="py-12 text-center text-slate-400">
      <CheckCircle class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">暂无待审批的友链申请</p>
    </div>

    <!-- 待审批列表 -->
    <div v-else class="flex flex-col gap-4">
      <div
        v-for="friend in pending_friends"
        :key="friend.id"
        class="p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
      >
        <!-- 头部信息 -->
        <div class="flex items-start gap-3 mb-3">
          <!-- 图标 -->
          <div
            class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0"
          >
            <img
              :src="get_favicon_url(friend.url)"
              :alt="friend.name"
              class="w-7 h-7 object-contain"
              loading="lazy"
              @error="(e: Event) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
          </div>

          <!-- 信息 -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-slate-700">{{ friend.name }}</h3>
            <button
              @click="open_link(friend.url)"
              class="text-xs text-[var(--c-primary)] hover:underline truncate block max-w-full"
            >
              {{ friend.url }}
            </button>
          </div>
        </div>

        <!-- 描述 -->
        <p v-if="friend.description" class="text-xs text-slate-500 mb-4 line-clamp-2">
          {{ friend.description }}
        </p>

        <!-- 操作按钮 -->
        <div class="flex items-center gap-2">
          <button
            @click="handle_approve(friend)"
            :disabled="action_loading === friend.id"
            class="flex-1 px-4 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ action_loading === friend.id ? '处理中...' : '批准' }}
          </button>
          <button
            @click="handle_reject(friend)"
            :disabled="action_loading === friend.id"
            class="flex-1 px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            拒绝
          </button>
        </div>
      </div>
    </div>

    <!-- 回到顶部 -->
    <back-to-top />
  </div>
</template>