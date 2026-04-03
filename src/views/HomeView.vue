<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NavMenu from '@/components/common/NavMenu.vue'
import HeaderBanner from '@/components/home/HeaderBanner.vue'
import ProfileWidget from '@/components/home/ProfileWidget.vue'
import AnnouncementWidget from '@/components/home/AnnouncementWidget.vue'
import WelcomeSection from '@/components/home/WelcomeSection.vue'
import FooterSection from '@/components/home/FooterSection.vue'
import MascotArea from '@/components/home/MascotArea.vue'

const header_height = ref(40) // vh 单位
const base_height = 40
const max_height = 100

let touch_start_y = 0

function handle_wheel(e: WheelEvent) {
    // 图片区放大时，允许缩小（即使页面已滚动）
    if (header_height.value > base_height && e.deltaY > 0) {
        header_height.value = Math.max(header_height.value - Math.abs(e.deltaY) * 0.3, base_height)
        return
    }

    // 图片区在基础高度时，只有在顶部才响应放大
    if (window.scrollY > 0) return

    if (e.deltaY < 0) {
        // 向上滚动，放大图片区
        header_height.value = Math.min(header_height.value + Math.abs(e.deltaY) * 0.1, max_height)
    }
}

function handle_touch_start(e: TouchEvent) {
    touch_start_y = e.touches[0]?.clientY ?? 0
}

function handle_touch_move(e: TouchEvent) {
    const current_y = e.touches[0]?.clientY ?? 0
    const delta_y = touch_start_y - current_y

    // 图片区放大时，允许缩小（即使页面已滚动）
    if (header_height.value > base_height && delta_y < 0) {
        header_height.value = Math.max(header_height.value + delta_y * 0.1, base_height)
        touch_start_y = current_y
        return
    }

    // 图片区在基础高度时，只有在顶部才响应放大
    if (window.scrollY > 0) {
        touch_start_y = current_y
        return
    }

    if (delta_y > 0) {
        // 向上滑动，放大图片区
        header_height.value = Math.min(header_height.value + delta_y * 0.1, max_height)
    }

    touch_start_y = current_y
}

onMounted(() => {
    window.addEventListener('wheel', handle_wheel, { passive: true })
    window.addEventListener('touchstart', handle_touch_start, { passive: true })
    window.addEventListener('touchmove', handle_touch_move, { passive: true })
})

onUnmounted(() => {
    window.removeEventListener('wheel', handle_wheel)
    window.removeEventListener('touchstart', handle_touch_start)
    window.removeEventListener('touchmove', handle_touch_move)
})
</script>

<template>
    <div class="min-h-screen flex flex-col bg-[var(--c-bg)]">
        <!-- 导航菜单 -->
        <nav-menu />

        <!-- 顶部横幅 -->
        <header-banner :height="header_height" />

        <!-- 主内容区 -->
        <main class="flex-1 flex justify-center px-4 py-8 md:px-8">
            <div class="w-full max-w-[60%] flex gap-6">
                <!-- 左侧小组件区 -->
                <aside class="hidden md:flex flex-col gap-4 w-48 shrink-0">
                    <profile-widget />
                    <announcement-widget />
                </aside>

                <!-- 中间内容区 -->
                <div class="flex-1 min-w-0">
                    <welcome-section />
                </div>

                <!-- 右侧看板娘 -->
                <aside class="hidden md:block w-32 shrink-0">
                    <mascot-area />
                </aside>
            </div>
        </main>

        <!-- 页脚 -->
        <footer-section />
    </div>
</template>