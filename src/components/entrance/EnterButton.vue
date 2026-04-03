<script setup lang="ts">
const emit = defineEmits<{
    (e: 'click'): void
}>()
</script>

<template>
    <button
        @click="emit('click')"
        class="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400/80 to-teal-400/80 text-white text-sm font-medium backdrop-blur-sm border border-white/30 hover:from-cyan-500/90 hover:to-teal-500/90 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
    >
        <!-- 箭头图标 -->
        <span class="flex items-center gap-2">
            进入主页
            <div
                class="i-lucide-arrow-right w-4 h-4 transition-transform group-hover:translate-x-1"
            />
        </span>

        <!-- 悬停发光效果 -->
        <div
            class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style="background: linear-gradient(90deg, rgba(0, 255, 255, 0.2), rgba(0, 128, 128, 0.2))"
        />
    </button>
</template>