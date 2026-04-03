<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 图片列表
const image_list = [
    { key: 'moez', url: 'https://t.alcy.cc/moez', label: '萌娘' },
    { key: 'ycy', url: 'https://t.alcy.cc/ycy', label: '原创' },
    { key: 'fj', url: 'https://t.alcy.cc/fj', label: '风景' },
    { key: 'loli', url: 'https://www.loliapi.com/acg/', label: 'LoliAPI' }
]

const current_image = ref<string>('')

// 随机选择图片
function get_random_image(): string {
    const random_index = Math.floor(Math.random() * image_list.length)
    return image_list[random_index]!.url
}

onMounted(() => {
    current_image.value = get_random_image()
})
</script>

<template>
    <div class="absolute inset-0">
        <!-- 背景图 -->
        <img
            :src="current_image"
            class="absolute inset-0 size-full object-cover"
            alt="背景图"
        />

        <!-- 遮罩层：增加文字可读性 -->
        <div class="absolute inset-0 bg-black/30" />
    </div>
</template>