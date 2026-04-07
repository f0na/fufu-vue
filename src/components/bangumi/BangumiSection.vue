<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBangumiFilter } from '@/composables/useBangumiStats'
import { useBangumiEdit } from '@/composables/useBangumiEdit'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import {
  get_bangumi_info,
  get_admin_bangumi_info,
  delete_bangumi_info,
  toggle_bangumi_info_visibility,
} from '@/api/bangumi'
import type { BangumiInfo, WatchStatus } from '@/api/types'
import { Image as ImageIcon, Loader2, Tv } from 'lucide-vue-next'
import BackToTop from '@/components/common/BackToTop.vue'

const router = useRouter()

// 使用共享筛选状态
const { bangumi_filter, search_query } = useBangumiFilter()
const { edit_mode, set_edit_mode } = useBangumiEdit()
const { can_toggle_visibility } = useAuth()
const { success, error } = useToast()
const { confirm } = useConfirm()

// 状态显示文本和样式
const status_map: Record<WatchStatus, { label: string; class: string }> = {
  watching: { label: '在看', class: 'bg-blue-100 text-blue-700' },
  want_to_watch: { label: '想看', class: 'bg-amber-100 text-amber-700' },
  watched: { label: '看过', class: 'bg-green-100 text-green-700' },
  dropped: { label: '抛弃', class: 'bg-red-100 text-red-700' },
}

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

// 所有番剧信息数据
const all_bangumi = ref<BangumiInfo[]>([])

// 加载番剧列表
async function load_bangumi() {
  loading.value = true
  try {
    // 管理员使用管理接口获取所有番剧信息（含隐藏）
    const res = can_toggle_visibility.value
      ? await get_admin_bangumi_info({ per_page: 100 })
      : await get_bangumi_info({ per_page: 100 })
    all_bangumi.value = res.items || []
  } catch (e) {
    console.error('加载番剧列表失败:', e)
    error('加载番剧列表失败')
    all_bangumi.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  load_bangumi()
})

// 筛选后的番剧列表
const filtered_bangumi = computed(() => {
  let filtered = all_bangumi.value

  // 显隐模式下显示所有番剧，否则只显示可见的
  if (edit_mode.value !== 'visibility') {
    filtered = filtered.filter((b: BangumiInfo) => b.visible)
  }

  // 按状态筛选
  if (bangumi_filter.value !== 'all') {
    filtered = filtered.filter((b: BangumiInfo) => b.status === bangumi_filter.value)
  }

  // 搜索关键词筛选
  if (search_query.value.trim()) {
    const query = search_query.value.toLowerCase()
    filtered = filtered.filter(
      (b: BangumiInfo) =>
        b.title.toLowerCase().includes(query) ||
        (b.description?.toLowerCase().includes(query) ?? false) ||
        b.tags.some((t) => t.toLowerCase().includes(query)),
    )
  }

  return filtered
})

// 当前显示的番剧
const bangumi_display = computed(() => {
  return filtered_bangumi.value.slice(0, display_count.value)
})

// 是否还有更多
const has_more = computed(() => display_count.value < filtered_bangumi.value.length)

// 加载更多
async function load_more() {
  if (loading.value || !has_more.value) return

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))
  display_count.value += load_count
  loading.value = false
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

// ========== 管理功能 ==========

// 删除番剧信息
async function handle_delete(item: BangumiInfo) {
  const confirmed = await confirm(`确定要删除「${item.title}」吗？`)
  if (!confirmed) return

  try {
    await delete_bangumi_info(item.id)
    success('删除成功')
    load_bangumi()
  } catch (e) {
    console.error('删除失败:', e)
    error('删除失败')
  }
}

// 切换可见性
async function handle_toggle_visibility(item: BangumiInfo) {
  const new_visible = !item.visible
  try {
    await toggle_bangumi_info_visibility(item.id, new_visible)
    // 本地更新状态
    const target = all_bangumi.value.find((b: BangumiInfo) => b.id === item.id)
    if (target) {
      target.visible = new_visible
    }
    success(new_visible ? '已显示' : '已隐藏')
  } catch (e) {
    console.error('操作失败:', e)
    error('操作失败')
  }
}

// 点击番剧卡片（根据编辑模式执行不同操作）
function handle_item_click(item: BangumiInfo) {
  if (edit_mode.value === 'edit') {
    // 编辑模式：跳转到编辑页面
    router.push(`/home/bangumi/${item.id}/edit`)
  } else if (edit_mode.value === 'delete') {
    handle_delete(item)
  } else if (edit_mode.value === 'visibility') {
    handle_toggle_visibility(item)
  } else {
    // 普通模式：跳转到番剧详情页
    router.push(`/home/bangumi/${item.id}`)
  }
}

// 获取操作提示
const mode_hint = computed(() => {
  if (edit_mode.value === 'edit') return '点击番剧进行编辑'
  if (edit_mode.value === 'delete') return '点击番剧进行删除'
  if (edit_mode.value === 'visibility') return '点击番剧切换显/隐'
  return ''
})
</script>

<template>
  <div>
    <!-- 编辑模式提示 -->
    <div
      v-if="edit_mode !== 'none'"
      class="flex items-center justify-between px-4 py-2 rounded-lg bg-[var(--c-primary-bg)] text-sm mb-4"
    >
      <span class="text-slate-600">
        {{ mode_hint }}
      </span>
      <button @click="set_edit_mode('none')" class="text-[var(--c-primary)] hover:underline">
        取消
      </button>
    </div>

    <!-- 番剧卡片网格 -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div
        v-for="item in bangumi_display"
        :key="item.id"
        class="cursor-pointer group"
        @click="handle_item_click(item)"
      >
        <!-- 封面图 -->
        <div
          class="aspect-[3/4] overflow-hidden rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow border border-[var(--c-border)] relative"
          :class="{
            'opacity-50': !item.visible,
            'ring-2 ring-[var(--c-primary)]': edit_mode === 'edit',
          }"
        >
          <img
            v-if="item.cover"
            :src="item.cover"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-else
            class="w-full h-full bg-[var(--c-primary-bg)] flex items-center justify-center"
          >
            <ImageIcon class="text-slate-300 w-6 h-6" />
          </div>
          <!-- 标题（底部渐变叠加） -->
          <div
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 pt-4"
          >
            <div class="flex items-center gap-2">
              <h3 class="text-sm text-white font-medium truncate flex-1">{{ item.title }}</h3>
              <span v-if="item.episodes" class="text-xs text-white/80 shrink-0"
                >{{ item.episodes }}集</span
              >
            </div>
          </div>
          <!-- 状态标签（右上角） -->
          <div class="absolute top-2 right-2 flex flex-col gap-1 items-end">
            <span
              class="px-2 py-1 text-xs rounded-lg shadow-sm"
              :class="status_map[item.status]?.class || 'bg-slate-100 text-slate-600'"
            >
              {{ status_map[item.status]?.label || item.status }}
            </span>
            <!-- 评分（状态标签下方） -->
            <div v-if="item.rating > 0" class="w-full">
              <span
                class="block px-2 py-1 text-xs rounded-lg bg-white/90 shadow-sm text-slate-700 font-medium text-center"
              >
                {{ item.rating.toFixed(1) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 底部信息：标签 -->
        <div
          v-if="item.tags && item.tags.length > 0"
          class="mt-2 text-xs text-slate-400 truncate"
        >
          {{ item.tags.join(' / ') }}
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
      <div v-else-if="!has_more && bangumi_display.length > 0" class="text-slate-400 text-sm">
        已经到底了 ~
      </div>
      <!-- 加载更多提示 -->
      <div v-else-if="has_more" class="text-slate-400 text-sm">下拉加载更多</div>
    </div>

    <!-- 空状态 -->
    <div v-if="bangumi_display.length === 0" class="py-12 text-center text-slate-400">
      <Tv class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">暂无番剧</p>
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>