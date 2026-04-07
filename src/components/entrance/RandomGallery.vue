<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Gallery {
  id: number
  title: string
  cover: string
  count: number
}

// 相册列表
const galleries: Gallery[] = [
  { id: 1, title: '日常随拍', cover: 'https://t.alcy.cc/moez', count: 12 },
  { id: 2, title: '旅行记录', cover: 'https://t.alcy.cc/fj', count: 8 },
  { id: 3, title: '萌宠日常', cover: 'https://t.alcy.cc/ycy', count: 15 },
  { id: 4, title: '美食分享', cover: 'https://www.loliapi.com/acg/', count: 6 },
]

const current_gallery = ref<Gallery>(galleries[0]!)

function random_gallery() {
  const random_index = Math.floor(Math.random() * galleries.length)
  current_gallery.value = galleries[random_index]!
}

function open_gallery() {
  router.push(`/gallery/${current_gallery.value.id}`)
}

onMounted(() => {
  random_gallery()
})
</script>

<template>
  <div
    class="relative w-40 h-28 rounded-xl overflow-hidden backdrop-blur-md bg-white/10 border border-rose-200/30 cursor-pointer group shrink-0"
    @click="open_gallery"
    @contextmenu.prevent="random_gallery"
  >
    <!-- 图片 -->
    <img
      :src="current_gallery.cover"
      :key="current_gallery.id"
      alt="相册"
      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
    />

    <!-- hover 遮罩 -->
    <div
      class="absolute inset-0 flex items-center justify-center bg-rose-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <div class="i-lucide-image w-6 h-6 text-white" />
    </div>

    <!-- 标签 -->
    <div class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-rose-500/50 text-xs text-white">
      {{ current_gallery.title }}
    </div>
  </div>
</template>
