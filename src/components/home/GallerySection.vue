<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryFilter } from '@/composables/useGalleryFilter'
import { useGalleryEdit } from '@/composables/useGalleryEdit'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import {
  fetch_galleries,
  get_admin_galleries,
  delete_gallery,
  toggle_gallery_visibility,
} from '@/api/gallery'
import type { Gallery } from '@/api/types'
import BackToTop from '@/components/common/BackToTop.vue'
import { Image as ImageIcon, Loader2, Images } from 'lucide-vue-next'

const router = useRouter()

// 使用共享筛选状态
const { gallery_filter, search_query, set_all_tags } = useGalleryFilter()
const { edit_mode, set_edit_mode } = useGalleryEdit()
const { can_toggle_visibility } = useAuth()
const { success, error } = useToast()
const { confirm } = useConfirm()

// 每次加载数量
const load_count = 4

// 当前显示数量
const display_count = ref(load_count)

// 加载状态
const loading = ref(false)

// 底部观察元素引用
const bottom_trigger = ref<HTMLElement | null>(null)

// Intersection Observer
let observer: IntersectionObserver | null = null

// 所有相册数据
const all_galleries = ref<Gallery[]>([])

// 加载相册列表
async function load_galleries() {
  loading.value = true
  try {
    // 管理员使用管理接口获取所有相册（含隐藏）
    const res = can_toggle_visibility.value
      ? await get_admin_galleries({ per_page: 100 })
      : await fetch_galleries({ per_page: 100 })
    all_galleries.value = res.items || []

    // 提取所有标签
    const tags = new Set<string>()
    all_galleries.value.forEach((g) => {
      g.tags.forEach((tag) => tags.add(tag))
    })
    set_all_tags(Array.from(tags))
  } catch (e) {
    console.error('加载相册列表失败:', e)
    error('加载相册列表失败')
    all_galleries.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  load_galleries()
})

// 筛选后的相册列表
const filtered_galleries = computed(() => {
  let result = all_galleries.value

  // 显隐模式下显示所有相册，否则只显示可见的
  if (edit_mode.value !== 'visibility') {
    result = result.filter((g) => g.visible)
  }

  // 按标签筛选
  if (gallery_filter.value !== 'all') {
    result = result.filter((g) => g.tags.includes(gallery_filter.value))
  }

  // 按搜索关键词筛选
  if (search_query.value.trim()) {
    const query = search_query.value.toLowerCase()
    result = result.filter(
      (g) =>
        g.title.toLowerCase().includes(query) ||
        g.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  return result
})

// 当前显示的相册
const galleries = computed(() => {
  return filtered_galleries.value.slice(0, display_count.value)
})

// 是否还有更多
const has_more = computed(() => display_count.value < filtered_galleries.value.length)

// 加载更多
async function load_more() {
  if (loading.value || !has_more.value) return

  loading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))
  display_count.value += load_count
  loading.value = false
}

// 删除相册
async function handle_delete(gallery: Gallery) {
  const confirmed = await confirm(`确定要删除「${gallery.title}」吗？`)
  if (!confirmed) return

  try {
    await delete_gallery(gallery.id)
    success('删除成功')
    load_galleries()
  } catch (e) {
    console.error('删除失败:', e)
    error('删除失败')
  }
}

// 切换可见性
async function handle_toggle_visibility(gallery: Gallery) {
  const new_visible = !gallery.visible
  try {
    await toggle_gallery_visibility(gallery.id, new_visible)
    // 本地更新状态
    const target = all_galleries.value.find((g) => g.id === gallery.id)
    if (target) {
      target.visible = new_visible
    }
    success(new_visible ? '已显示' : '已隐藏')
  } catch (e) {
    console.error('操作失败:', e)
    error('操作失败')
  }
}

// 点击相册卡片（根据编辑模式执行不同操作）
function handle_item_click(gallery: Gallery) {
  if (edit_mode.value === 'edit') {
    // 编辑模式：跳转到编辑页面
    router.push(`/home/gallery/${gallery.id}/edit`)
  } else if (edit_mode.value === 'delete') {
    handle_delete(gallery)
  } else if (edit_mode.value === 'visibility') {
    handle_toggle_visibility(gallery)
  } else {
    // 普通模式：跳转到相册详情页
    router.push(`/gallery/${gallery.id}`)
  }
}

// 获取操作提示
const mode_hint = computed(() => {
  if (edit_mode.value === 'edit') return '点击相册进行编辑'
  if (edit_mode.value === 'delete') return '点击相册进行删除'
  if (edit_mode.value === 'visibility') return '点击相册切换显/隐'
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

    <!-- 相册列表 -->
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="gallery in galleries"
        :key="gallery.id"
        class="cursor-pointer group"
        @click="handle_item_click(gallery)"
      >
        <!-- 封面图 -->
        <div
          class="aspect-square overflow-hidden rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow border border-[var(--c-border)] relative"
          :class="{
            'opacity-50': !gallery.visible,
            'ring-2 ring-[var(--c-primary)]': edit_mode === 'edit',
            'ring-2 ring-red-400': edit_mode === 'delete',
          }"
        >
          <img
            v-if="gallery.cover"
            :src="gallery.cover"
            :alt="gallery.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-else
            class="w-full h-full bg-[var(--c-primary-bg)] flex items-center justify-center"
          >
            <ImageIcon class="text-slate-300 w-6 h-6" />
          </div>
        </div>

        <!-- 信息 -->
        <div class="mt-2">
          <h3 class="text-sm text-slate-700 font-medium">{{ gallery.title }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-slate-400">{{ gallery.photo_count }} 张照片</span>
            <div class="flex gap-1">
              <span
                v-for="tag in gallery.tags"
                :key="tag"
                class="px-1.5 py-0.5 text-xs rounded"
                style="background-color: var(--c-tag-bg); color: var(--c-tag-text)"
              >
                {{ tag }}
              </span>
            </div>
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
      <div v-else-if="!has_more && galleries.length > 0" class="text-slate-400 text-sm">
        已经到底了 ~
      </div>
      <!-- 加载更多提示 -->
      <div v-else-if="has_more" class="text-slate-400 text-sm">下拉加载更多</div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && galleries.length === 0" class="py-12 text-center text-slate-400">
      <Images class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-sm">暂无相册</p>
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>
