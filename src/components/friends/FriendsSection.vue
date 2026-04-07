<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Friend } from '@/api/types'
import { get_friends } from '@/api/friend'
import { useFriendsFilter } from '@/composables/useFriendsFilter'
import { useToast } from '@/composables/useToast'
import BackToTop from '@/components/common/BackToTop.vue'

const { search_query } = useFriendsFilter()
const { error } = useToast()

// 每次加载数量
const load_count = 6

// 当前显示数量
const display_count = ref(load_count)

// 加载状态
const loading = ref(false)

// 底部观察元素引用
const bottom_trigger = ref<HTMLElement | null>(null)

// Intersection Observer
let observer: IntersectionObserver | null = null

// 所有友链数据
const all_friends = ref<Friend[]>([])

// 加载友链列表
async function load_friends() {
  loading.value = true
  try {
    const res = await get_friends({ per_page: 100 })
    all_friends.value = res.items
  } catch (e) {
    console.error('加载友链失败:', e)
    error('加载友链失败')
  } finally {
    loading.value = false
  }
}

// 筛选后的友链列表
const filtered_friends = computed(() => {
  if (!search_query.value.trim()) {
    return all_friends.value
  }
  const query = search_query.value.toLowerCase()
  return all_friends.value.filter(
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
  if (loading.value || !has_more.value) return

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))
  display_count.value += load_count
  loading.value = false
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
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 友链卡片网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="friend in friends_list"
        :key="friend.id"
        @click="open_link(friend.url)"
        class="cursor-pointer group p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm hover:shadow-md transition-all flex items-center gap-3"
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

        <!-- 访问图标 -->
        <div
          class="i-lucide-arrow-up-right w-4 h-4 text-slate-300 group-hover:text-[var(--c-primary)] transition-colors shrink-0"
        />
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
