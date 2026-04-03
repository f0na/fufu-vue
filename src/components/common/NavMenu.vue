<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()

const is_expanded = ref(false)
const show_more_menu = ref(false)
const more_button_ref = ref<HTMLElement | null>(null)
const close_timer = ref<ReturnType<typeof setTimeout> | null>(null)

const { next_theme } = useTheme()

const menu_items = [
    { label: '归档', key: 'archive', icon: 'i-lucide-archive', route: '/archive' },
    { label: '链接', key: 'links', icon: 'i-lucide-link', route: '/links' },
    { label: '追番', key: 'anime', icon: 'i-simple-icons-bilibili', route: '/anime' },
    { label: '相册', key: 'gallery', icon: 'i-lucide-image', route: '/home/gallery' },
    { label: '友人帐', key: 'friends', icon: 'i-lucide-users', route: '/friends' }
]

const more_items = [
    { label: '文章', key: 'articles', icon: 'i-lucide-file-text', route: '/articles' },
    { label: '关于', key: 'about', icon: 'i-lucide-info', route: '/about' },
    { label: '小工具', key: 'tools', icon: 'i-lucide-wrench', route: '/tools' },
    { label: '网站状态', key: 'status', icon: 'i-lucide-activity', route: '/status' }
]

const dropdown_position = computed(() => {
    if (!more_button_ref.value) return { top: 0, left: 0 }
    const rect = more_button_ref.value.getBoundingClientRect()
    return {
        top: rect.bottom + 13,
        left: rect.right - 128
    }
})

function handle_menu_click(key: string) {
    const item = menu_items.find(m => m.key === key)
    if (item?.route) {
        router.push(item.route)
    }
}

function handle_more_click(key: string) {
    show_more_menu.value = false
    const item = more_items.find(m => m.key === key)
    if (item?.route) {
        router.push(item.route)
    }
}

function handle_mouse_enter() {
    if (close_timer.value) {
        clearTimeout(close_timer.value)
        close_timer.value = null
    }
    is_expanded.value = true
}

function handle_mouse_leave() {
    close_timer.value = setTimeout(() => {
        is_expanded.value = false
        show_more_menu.value = false
    }, 150)
}

onUnmounted(() => {
    if (close_timer.value) {
        clearTimeout(close_timer.value)
    }
})
</script>

<template>
    <!-- 外层容器：负责裁剪圆角 -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 z-50 overflow-visible transition-all duration-200 ease-out"
        @mouseenter="handle_mouse_enter" @mouseleave="handle_mouse_leave">

        <!-- 收起状态：检测区域覆盖导航栏高度 -->
        <div v-if="!is_expanded" class="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-12" />

        <!-- 菜单容器：圆角裁剪 -->
        <div class="rounded-b-xl mx-auto relative"
            :class="is_expanded ? 'h-auto overflow-visible' : 'h-2 overflow-hidden w-[420px]'">

            <!-- 内层容器：负责背景模糊 -->
            <div class="backdrop-blur-md bg-white/10 border border-white/20 shadow-sm"
                :class="is_expanded ? 'py-3 px-4 rounded-b-xl' : 'h-full'">
                <!-- 收起状态：只显示小边缘 -->
                <div v-if="!is_expanded" class="h-full bg-white/20 rounded-b-xl" />

                <!-- 展开状态：完整菜单 -->
                <div v-else class="flex items-center gap-1 justify-center">
                    <!-- 主菜单项 -->
                    <button v-for="item in menu_items" :key="item.key" @click="handle_menu_click(item.key)"
                        class="px-3 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1.5">
                        <div :class="item.icon" class="w-4 h-4" />
                        {{ item.label }}
                    </button>

                    <!-- 分隔线 -->
                    <div class="w-px h-5 bg-white/30 mx-1" />

                    <!-- 更多下拉 -->
                    <div class="relative">
                        <button ref="more_button_ref" @click="show_more_menu = !show_more_menu"
                            class="px-3 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1">
                            更多
                            <div class="i-lucide-chevron-down w-3 h-3 transition-transform"
                                :class="show_more_menu ? 'rotate-180' : ''" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 下拉菜单 - Teleport 到 body -->
    <Teleport to="body">
        <div v-if="show_more_menu"
            class="fixed z-[60] rounded-xl shadow-xl min-w-32 backdrop-blur-xl bg-white/10 border border-white/30"
            :style="{ top: `${dropdown_position.top}px`, left: `${dropdown_position.left}px` }"
            @mouseenter="handle_mouse_enter" @mouseleave="handle_mouse_leave">
            <button v-for="item in more_items" :key="item.key" @click="handle_more_click(item.key)"
                class="w-full px-4 py-2 text-left text-sm text-white/90 hover:text-white hover:bg-white/20 transition-colors flex items-center gap-2 first:rounded-t-xl last:rounded-b-xl">
                <div :class="item.icon" class="w-4 h-4" />
                {{ item.label }}
            </button>
            <!-- 主题切换 -->
            <button @click="next_theme"
                class="w-full px-4 py-2 text-left text-sm text-white/90 hover:text-white hover:bg-white/20 transition-colors flex items-center gap-2 rounded-b-xl border-t border-white/10">
                <div class="i-lucide-palette w-4 h-4" />
                切换主题
            </button>
        </div>
    </Teleport>
</template>