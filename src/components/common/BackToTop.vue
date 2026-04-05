<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
    threshold?: number      // 显示按钮的滚动高度阈值
    bottom?: string         // 距底部的距离
    right?: string          // 距右边的距离
}>(), {
    threshold: 300,
    bottom: '2rem',
    right: '2rem'
})

// 是否显示按钮
const show_button = ref(false)

// 检查滚动位置
function check_scroll() {
    show_button.value = window.scrollY > props.threshold
}

// 回到顶部
function scroll_to_top() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

onMounted(() => {
    window.addEventListener('scroll', check_scroll, { passive: true })
    check_scroll()
})

onUnmounted(() => {
    window.removeEventListener('scroll', check_scroll)
})
</script>

<template>
    <Transition name="fade">
        <button
            v-if="show_button"
            @click="scroll_to_top"
            class="fixed z-50 w-10 h-10 rounded-full bg-[var(--c-primary)] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            :style="{ bottom: bottom, right: right }"
        >
            <div class="i-lucide-arrow-up w-5 h-5" />
        </button>
    </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>