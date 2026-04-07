<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Friend } from '@/api/types'
import { delete_friend, toggle_friend_visibility } from '@/api/friend'
import { useFriendsFilter } from '@/composables/useFriendsFilter'
import { useFriendEdit } from '@/composables/useFriendEdit'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useFriendsStore } from '@/stores/friends'
import BackToTop from '@/components/common/BackToTop.vue'

const { search_query } = useFriendsFilter()
const { edit_mode, set_edit_mode } = useFriendEdit()
const { can_toggle_visibility } = useAuth()
const { success, error } = useToast()
const { confirm } = useConfirm()
const friends_store = useFriendsStore()
const router = useRouter()

// 每次加载数量
const load_count = 6

// 当前显示数量
const display_count = ref(load_count)

// 底部观察元素引用
const bottom_trigger = ref<HTMLElement | null>(null)

// Intersection Observer
let observer: IntersectionObserver | null = null

// 加载友链列表（使用 store）
async function load_friends() {
  await friends_store.load_friends(can_toggle_visibility.value)
}

// 筛选后的友链列表
const filtered_friends = computed(() => {
  // 先按显隐模式筛选
  let filtered = friends_store.friends
  if (edit_mode.value !== 'visibility') {
    filtered = filtered.filter((f) => f.visible)
  }

  // 再按搜索关键词筛选
  if (!search_query.value.trim()) {
    return filtered
  }
  const query = search_query.value.toLowerCase()
  return filtered.filter(
    (f) =>
      f.name.toLowerCase().includes(query) ||
      f.description?.toLowerCase().includes(query) ||
      f.url.toLowerCase().includes(query),
  )
})

// 当前显示的友链
const friends_list = computed(() => {
  return filtered_friends.value.slice(0, display_count.value)
})

// 是否还有更多
const has_more = computed(() => display_count.value < filtered_friends.value.length)

// 加载更多
async function load_more() {
  if (friends_store.loading || !has_more.value) return

  await new Promise((resolve) => setTimeout(resolve, 300))
  display_count.value += load_count
}

// 获取网站图标 URL
function get_favicon_url(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://favicon.im/${domain}?icon=icon`
  } catch {
    return ''
  }
}

// 打开链接
function open_link(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

// ========== 管理功能 ==========

// 删除友链
async function handle_delete(friend: Friend) {
  const confirmed = await confirm(`确定要删除「${friend.name}」吗？`)
  if (!confirmed) return

  try {
    await delete_friend(friend.id)
    friends_store.remove_friend_local(friend.id)
    success('删除成功')
  } catch (e) {
    console.error('删除失败:', e)
    error('删除失败')
  }
}

// 切换可见性
async function handle_toggle_visibility(friend: Friend) {
  const new_visible = !friend.visible
  try {
    await toggle_friend_visibility(friend.id, new_visible)
    friends_store.update_friend_local(friend.id, { visible: new_visible })
    success(new_visible ? '已显示' : '已隐藏')
  } catch (e) {
    console.error('操作失败:', e)
    error('操作失败')
  }
}

// 点击友链卡片（根据编辑模式执行不同操作）
function handle_friend_click(friend: Friend) {
  if (edit_mode.value === 'edit') {
    router.push(`/home/friends/${friend.id}/edit`)
  } else if (edit_mode.value === 'delete') {
    handle_delete(friend)
  } else if (edit_mode.value === 'visibility') {
    handle_toggle_visibility(friend)
  } else {
    open_link(friend.url)
  }
}

// 获取操作提示
const mode_hint = computed(() => {
  if (edit_mode.value === 'edit') return '点击友链进行编辑'
  if (edit_mode.value === 'delete') return '点击友链进行删除'
  if (edit_mode.value === 'visibility') return '点击友链切换显/隐'
  return ''
})

// 组件挂载时加载数据和设置 Intersection Observer
onMounted(() => {
  load_friends()
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

// 搜索时重置显示数量
watch(search_query, () => {
  display_count.value = load_count
})

// 路由变化时重置编辑模式
watch(
  () => router.currentRoute.value.path,
  () => {
    set_edit_mode('none')
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

    <!-- 友链卡片网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="friend in friends_list"
        :key="friend.id"
        @click="handle_friend_click(friend)"
        class="cursor-pointer group p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm hover:shadow-md transition-all flex items-center gap-3"
        :class="{
          'opacity-50': !friend.visible,
          'ring-2 ring-[var(--c-primary)]': edit_mode !== 'none',
        }"
      >
        <!-- 网站图标 -->
        <div
          class="w-12 h-12 rounded-xl bg-[var(--c-primary-bg)] flex items-center justify-center shrink-0 overflow-hidden"
        >
          <img
            :src="get_favicon_url(friend.url)"
            :alt="friend.name"
            class="w-7 h-7 object-contain"
            loading="lazy"
            @error="(e: Event) => ((e.target as HTMLImageElement).style.display = 'none')"
          />
        </div>

        <!-- 内容 -->
        <div class="flex-1 min-w-0">
          <h3
            class="text-sm font-medium text-slate-700 group-hover:text-[var(--c-primary)] transition-colors"
          >
            {{ friend.name }}
          </h3>
          <p v-if="friend.description" class="text-xs text-slate-400 mt-0.5 line-clamp-2">
            {{ friend.description }}
          </p>
        </div>

        <!-- 访问图标（非编辑模式时显示） -->
        <div
          v-if="edit_mode === 'none'"
          class="i-lucide-arrow-up-right w-4 h-4 text-slate-300 group-hover:text-[var(--c-primary)] transition-colors shrink-0"
        />
      </div>
    </div>

    <!-- 底部加载触发器 -->
    <div ref="bottom_trigger" class="py-6 flex justify-center">
      <!-- 加载中 -->
      <div v-if="friends_store.loading" class="flex items-center gap-2 text-slate-400">
        <div class="i-lucide-loader-2 w-5 h-5 animate-spin" />
        <span class="text-sm">加载中...</span>
      </div>
      <!-- 没有更多 -->
      <div v-else-if="!has_more && friends_list.length > 0" class="text-slate-400 text-sm">
        已经到底了 ~
      </div>
      <!-- 加载更多提示 -->
      <div v-else-if="has_more" class="text-slate-400 text-sm">下拉加载更多</div>
    </div>

    <!-- 空状态 -->
    <div v-if="friends_list.length === 0" class="py-12 text-center text-slate-400">
      <div class="i-lucide-users w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">暂无友链</p>
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>