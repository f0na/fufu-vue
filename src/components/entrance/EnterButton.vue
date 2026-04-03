<script setup lang="ts">
const emit = defineEmits<{
    (e: 'click'): void
}>()
</script>

<template>
    <button
        @click="emit('click')"
        class="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--c-primary)]/80 to-[var(--c-secondary)]/80 text-white text-sm font-medium backdrop-blur-sm border border-white/30 hover:from-[var(--c-primary)]/90 hover:to-[var(--c-secondary)]/90 transition-all duration-300 hover:scale-105 active:scale-95 shrink-0"
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
            style="background: linear-gradient(90deg, rgba(var(--c-primary-rgb, 251, 113, 133), 0.2), rgba(var(--c-secondary-rgb, 45, 212, 191), 0.2))"
        />
    </button>
</template>