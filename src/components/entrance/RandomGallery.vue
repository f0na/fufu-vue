<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Image as ImageIcon } from 'lucide-vue-next'
import { fetch_random_gallery } from '@/api/gallery'
import type { RandomGallery } from '@/api/types'

const router = useRouter()

const current_gallery = ref<RandomGallery | null>(null)
const is_loading = ref(true)
const has_no_gallery = ref(false)

// 获取封面图：优先cover -> first_photo_url -> null
function get_cover(gallery: RandomGallery): string | null {
  return gallery.cover || gallery.first_photo_url
}

function open_gallery() {
  if (!current_gallery.value) return
  router.push(`/gallery/${current_gallery.value.id}`)
}

async function load_random_gallery() {
  try {
    is_loading.value = true
    has_no_gallery.value = false
    current_gallery.value = await fetch_random_gallery()
  } catch (error: any) {
    // 资源不存在 = 无相册
    if (error?.code === 10001) {
      has_no_gallery.value = true
    }
    current_gallery.value = null
  } finally {
    is_loading.value = false
  }
}

onMounted(() => {
  load_random_gallery()
})
</script>

<template>
  <div
    class="relative w-40 h-28 rounded-xl overflow-hidden backdrop-blur-md bg-white/10 border border-rose-200/30 cursor-pointer group shrink-0"
    @click="open_gallery"
    @contextmenu.prevent="load_random_gallery"
  >
    <!-- 骨架屏加载状态 -->
    <div v-if="is_loading" class="w-full h-full bg-rose-100/50 animate-pulse rounded-xl" />

    <!-- 无相册状态 -->
    <div
      v-else-if="has_no_gallery || !current_gallery"
      class="w-full h-full flex items-center justify-center bg-rose-50/50"
    >
      <span class="text-xs text-rose-400">暂无相册</span>
    </div>

    <!-- 正常显示 -->
    <template v-else>
      <!-- 有封面或第一张照片 -->
      <img
        v-if="get_cover(current_gallery)"
        :src="get_cover(current_gallery)!"
        :key="current_gallery.id"
        alt="相册"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <!-- hover 遮罩 -->
      <div
        class="absolute inset-0 flex items-center justify-center bg-rose-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ImageIcon class="w-6 h-6 text-white" />
      </div>

      <!-- 标签 -->
      <div
        class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-rose-500/50 text-xs text-white"
      >
        {{ current_gallery.title }}
      </div>
    </template>
  </div>
</template>
