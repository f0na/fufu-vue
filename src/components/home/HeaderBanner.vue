<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
    height: number
}>()

const image_list = [
    { key: 'moez', url: 'https://t.alcy.cc/moez', label: '萌娘' },
    { key: 'ycy', url: 'https://t.alcy.cc/ycy', label: '原创' },
    { key: 'fj', url: 'https://t.alcy.cc/fj', label: '风景' },
    { key: 'loli', url: 'https://www.loliapi.com/acg/', label: 'LoliAPI' }
]

const current_image = ref('')

function get_random_image(): string {
    const random_index = Math.floor(Math.random() * image_list.length)
    return image_list[random_index]!.url
}

onMounted(() => {
    current_image.value = get_random_image()
})
</script>

<template>
    <header
        class="relative overflow-hidden transition-all duration-200 ease-out"
        :style="{ height: `${height}vh`, minHeight: `${Math.max(height, 30)}vh` }"
    >
        <!-- 背景图 -->
        <img
            :src="current_image"
            class="w-full h-full object-cover"
            alt="背景"
        />

        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/20" />

        <!-- 波浪动画 -->
        <div class="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
            <svg class="absolute bottom-0 w-full h-20" viewBox="0 0 1440 120" preserveAspectRatio="none">
                <path
                    fill="currentColor"
                    class="text-slate-50 dark:text-slate-900"
                    d="M0,64 C480,150 960,0 1440,64 L1440,120 L0,120 Z"
                >
                    <animate
                        attributeName="d"
                        dur="8s"
                        repeatCount="indefinite"
                        values="
                            M0,64 C480,150 960,0 1440,64 L1440,120 L0,120 Z;
                            M0,64 C480,0 960,150 1440,64 L1440,120 L0,120 Z;
                            M0,64 C480,150 960,0 1440,64 L1440,120 L0,120 Z
                        "
                    />
                </path>
            </svg>
        </div>
    </header>
</template>