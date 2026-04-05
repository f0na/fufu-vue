<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavMenu from '@/components/common/NavMenu.vue'
import HeaderBanner from '@/components/home/HeaderBanner.vue'
import ProfileWidget from '@/components/home/ProfileWidget.vue'
import AnnouncementWidget from '@/components/home/AnnouncementWidget.vue'
import FooterSection from '@/components/home/FooterSection.vue'
import MascotArea from '@/components/home/MascotArea.vue'
import SearchBox from '@/components/home/SearchBox.vue'
import BangumiSidebar from '@/components/bangumi/BangumiSidebar.vue'
import LinksSidebar from '@/components/links/LinksSidebar.vue'
import GallerySidebar from '@/components/gallery/GallerySidebar.vue'
import FriendsSidebar from '@/components/friends/FriendsSidebar.vue'
import AdminCard from '@/components/admin/AdminCard.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { is_logged_in, is_admin } = useAuth()

// 看板娘秘密点击处理
function handle_secret_click() {
    console.log('Secret click received! is_logged_in:', is_logged_in.value)
    if (!is_logged_in.value) {
        // 未登录，跳转到登录页面
        router.push('/home/login')
    }
    // 已登录时不做任何操作
}

// 是否是番剧页
const is_bangumi_page = computed(() => route.name === 'bangumi' || route.name === 'bangumi-detail')

// 是否是链接页
const is_links_page = computed(() => route.name === 'links')

// 是否是相册页
const is_gallery_page = computed(() => route.name === 'gallery-list')

// 是否是友人帐页
const is_friends_page = computed(() => route.name === 'friends')

// 是否是管理页
const is_admin_page = computed(() => route.name === 'admin')

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
        <main class="flex-1 flex justify-center px-4 py-8 pb-16 md:pb-8 md:px-8">
            <div class="w-full md:w-[65%] flex gap-4 md:gap-6 relative">
                <!-- 左侧小组件区 -->
                <aside class="hidden md:flex flex-col gap-4 w-[18%] shrink-0">
                    <profile-widget />
                    <announcement-widget />
                    <!-- 管理员卡片 - 管理员登录后显示 -->
                    <admin-card v-if="is_logged_in && is_admin" />
                </aside>

                <!-- 中间内容区 -->
                <div class="w-[67%] min-w-0 shrink-0">
                    <router-view />
                </div>

                <!-- 右侧边栏 -->
                <aside class="hidden md:flex flex-col gap-4 w-[15%] shrink-0">
                    <!-- 番剧页显示筛选侧边栏 -->
                    <template v-if="is_bangumi_page">
                        <bangumi-sidebar />
                    </template>
                    <!-- 链接页显示筛选侧边栏 -->
                    <template v-else-if="is_links_page">
                        <links-sidebar />
                    </template>
                    <!-- 相册页显示筛选侧边栏 -->
                    <template v-else-if="is_gallery_page">
                        <gallery-sidebar />
                    </template>
                    <!-- 友人帐页显示侧边栏 -->
                    <template v-else-if="is_friends_page">
                        <friends-sidebar />
                    </template>
                    <!-- 其他页面显示搜索框 -->
                    <template v-else>
                        <search-box />
                    </template>
                </aside>

                <!-- 看板娘 - 相对主内容区右侧 -->
                <div class="hidden md:block absolute -right-48 top-0">
                    <mascot-area @secret-click="handle_secret_click" />
                </div>
            </div>
        </main>

        <!-- 页脚 -->
        <footer-section />
    </div>
</template>