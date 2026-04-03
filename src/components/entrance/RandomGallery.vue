<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 图片列表
const gallery_images = [
    { key: 'moez', url: 'https://t.alcy.cc/moez', label: '萌娘' },
    { key: 'ycy', url: 'https://t.alcy.cc/ycy', label: '原创' },
    { key: 'loli', url: 'https://www.loliapi.com/acg/', label: 'LoliAPI' }
]

const current_image_url = ref('')

function refresh_image() {
    const random_index = Math.floor(Math.random() * gallery_images.length)
    current_image_url.value = gallery_images[random_index]!.url
}

onMounted(() => {
    refresh_image()
})
</script>

<template>
    <div
        class="relative w-40 h-28 rounded-xl overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 cursor-pointer group shrink-0"
        @click="refresh_image"
    >
        <!-- 图片 -->
        <img
            :src="current_image_url"
            :key="current_image_url"
            alt="随机相册"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <!-- 刷新按钮遮罩 -->
        <div
            class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <div class="i-lucide-refresh-cw w-6 h-6 text-white" />
        </div>

        <!-- 标签 -->
        <div class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/50 text-xs text-white">
            随机相册
        </div>
    </div>
</template>