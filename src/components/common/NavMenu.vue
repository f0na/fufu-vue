<script setup lang="ts">
import { ref } from 'vue'

const is_expanded = ref(false)
const show_more_menu = ref(false)

const menu_items = [
    { label: '归档', key: 'archive', icon: 'i-lucide-archive' },
    { label: '链接', key: 'links', icon: 'i-lucide-link' },
    { label: '追番', key: 'anime', icon: 'i-simple-icons-bilibili' },
    { label: '相册', key: 'gallery', icon: 'i-lucide-image' },
    { label: '友人帐', key: 'friends', icon: 'i-lucide-users' }
]

const more_items = [
    { label: '文章', key: 'articles', icon: 'i-lucide-file-text' },
    { label: '关于', key: 'about', icon: 'i-lucide-info' },
    { label: '小工具', key: 'tools', icon: 'i-lucide-wrench' },
    { label: '网站状态', key: 'status', icon: 'i-lucide-activity' }
]

function handle_menu_click(key: string) {
    // TODO: 实现路由跳转
    console.log('菜单点击:', key)
}

function handle_more_click(key: string) {
    show_more_menu.value = false
    handle_menu_click(key)
}
</script>

<template>
    <!-- 外层容器：负责裁剪圆角 + 扩大检测区域 -->
    <div
        class="fixed top-0 left-1/2 -translate-x-1/2 z-50 overflow-visible transition-all duration-200 ease-out"
        @mouseenter="is_expanded = true"
        @mouseleave="is_expanded = false; show_more_menu = false"
    >
        <!-- 检测区域：透明扩大层 -->
        <div class="absolute -top-4 left-0 right-0 h-32" />

        <!-- 菜单容器：圆角裁剪 -->
        <div
            class="rounded-b-xl mx-auto"
            :class="is_expanded ? 'h-auto overflow-visible' : 'h-2 overflow-hidden w-[420px]'"
        >
            <!-- 内层容器：负责背景模糊 -->
            <div
                class="backdrop-blur-md bg-white/10 border border-white/20 shadow-sm"
                :class="is_expanded ? 'py-3 px-4 rounded-b-xl' : 'h-full'"
            >
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
                    <button @click="show_more_menu = !show_more_menu"
                        class="px-3 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1">
                        更多
                        <div class="i-lucide-chevron-down w-3 h-3 transition-transform"
                            :class="show_more_menu ? 'rotate-180' : ''" />
                    </button>

                    <!-- 下拉菜单 -->
                    <div v-if="show_more_menu"
                        class="absolute top-full right-0 mt-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg shadow-lg py-1 min-w-32">
                        <button v-for="item in more_items" :key="item.key" @click="handle_more_click(item.key)"
                            class="w-full px-4 py-2 text-left text-sm text-white/90 hover:text-white hover:bg-white/20 transition-colors flex items-center gap-2">
                            <div :class="item.icon" class="w-4 h-4" />
                            {{ item.label }}
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
</template>