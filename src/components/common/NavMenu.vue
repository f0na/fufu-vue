<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import {
  Archive,
  Link,
  Image,
  Users,
  FileText,
  Info,
  Wrench,
  Activity,
  Menu,
  ChevronDown,
  Palette,
  Home,
} from 'lucide-vue-next'
import type { LucideIcon } from 'lucide-vue-next'

const router = useRouter()

const is_expanded = ref(false)
const show_more_menu = ref(false)
const more_button_ref = ref<HTMLElement | null>(null)
const close_timer = ref<ReturnType<typeof setTimeout> | null>(null)
const is_mobile = ref(false)

const { next_theme } = useTheme()

// 菜单项接口
interface MenuItem {
  label: string
  key: string
  icon: LucideIcon
  route: string
}

// 桌面端主菜单项（5个）
const desktop_menu_items: MenuItem[] = [
  { label: '归档', key: 'archive', icon: Archive, route: '/home/archive' },
  { label: '链接', key: 'links', icon: Link, route: '/home/links' },
  { label: '追番', key: 'bangumi', icon: Image, route: '/home/bangumi' },
  { label: '相册', key: 'gallery', icon: Image, route: '/home/gallery' },
  { label: '友人帐', key: 'friends', icon: Users, route: '/home/friends' },
]

// 移动端主菜单项（4个）
const mobile_menu_items: MenuItem[] = [
  { label: '归档', key: 'archive', icon: Archive, route: '/home/archive' },
  { label: '链接', key: 'links', icon: Link, route: '/home/links' },
  { label: '追番', key: 'bangumi', icon: Image, route: '/home/bangumi' },
  { label: '友人帐', key: 'friends', icon: Users, route: '/home/friends' },
]

// 更多菜单项
const desktop_more_items: MenuItem[] = [
  { label: '文章', key: 'posts', icon: FileText, route: '/home/posts' },
  { label: '关于', key: 'about', icon: Info, route: '/about' },
  { label: '小工具', key: 'tools', icon: Wrench, route: '/tools' },
  { label: '网站状态', key: 'status', icon: Activity, route: '/status' },
]

const mobile_more_items: MenuItem[] = [
  { label: '相册', key: 'gallery', icon: Image, route: '/home/gallery' },
  { label: '文章', key: 'posts', icon: FileText, route: '/home/posts' },
  { label: '关于', key: 'about', icon: Info, route: '/about' },
  { label: '小工具', key: 'tools', icon: Wrench, route: '/tools' },
  { label: '网站状态', key: 'status', icon: Activity, route: '/status' },
]

const menu_items = computed(() => (is_mobile.value ? mobile_menu_items : desktop_menu_items))
const more_items = computed(() => (is_mobile.value ? mobile_more_items : desktop_more_items))

const dropdown_position = computed(() => {
  if (!more_button_ref.value) return { top: 0, left: 0 }
  const rect = more_button_ref.value.getBoundingClientRect()
  if (is_mobile.value) {
    return {
      top: rect.top - 200,
      left: rect.left,
    }
  }
  return {
    top: rect.bottom + 13,
    left: rect.right - 128,
  }
})

function check_mobile() {
  is_mobile.value = window.innerWidth < 768
}

function handle_home_click() {
  router.push('/home')
  show_more_menu.value = false
}

function handle_menu_click(key: string) {
  const item = menu_items.value.find((m) => m.key === key)
  if (item?.route) {
    router.push(item.route)
  }
  show_more_menu.value = false
  is_expanded.value = false
}

function handle_more_click(key: string) {
  show_more_menu.value = false
  is_expanded.value = false
  const item = more_items.value.find((m) => m.key === key)
  if (item?.route) {
    router.push(item.route)
  }
}

function handle_theme_switch() {
  next_theme()
  show_more_menu.value = false
}

function handle_mouse_enter() {
  if (is_mobile.value) return
  if (close_timer.value) {
    clearTimeout(close_timer.value)
    close_timer.value = null
  }
  is_expanded.value = true
}

function handle_mouse_leave() {
  if (is_mobile.value) return
  close_timer.value = setTimeout(() => {
    is_expanded.value = false
    show_more_menu.value = false
  }, 150)
}

onMounted(() => {
  check_mobile()
  window.addEventListener('resize', check_mobile)
})

onUnmounted(() => {
  if (close_timer.value) {
    clearTimeout(close_timer.value)
  }
  window.removeEventListener('resize', check_mobile)
})
</script>

<template>
  <!-- 桌面端：顶部悬浮导航 -->
  <div
    v-if="!is_mobile"
    class="fixed top-0 left-1/2 -translate-x-1/2 z-50 overflow-visible transition-all duration-200 ease-out"
    @mouseenter="handle_mouse_enter"
    @mouseleave="handle_mouse_leave"
  >
    <!-- 收起状态：检测区域 -->
    <div v-if="!is_expanded" class="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-12" />

    <!-- 菜单容器 -->
    <div
      class="rounded-b-xl mx-auto relative"
      :class="is_expanded ? 'h-auto overflow-visible' : 'h-2 overflow-hidden w-[420px]'"
    >
      <!-- 内层：背景模糊 -->
      <div
        class="backdrop-blur-md bg-[var(--c-bg)]/80 border border-[var(--c-border)] shadow-sm"
        :class="is_expanded ? 'py-3 px-4 rounded-b-xl' : 'h-full'"
      >
        <div v-if="!is_expanded" class="h-full bg-[var(--c-primary-bg)] rounded-b-xl" />

        <!-- 展开状态：完整菜单 -->
        <div v-else class="flex items-center gap-1 justify-center">
          <button
            v-for="item in menu_items"
            :key="item.key"
            @click="handle_menu_click(item.key)"
            class="px-3 py-1.5 text-sm text-slate-600 hover:text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </button>

          <div class="w-px h-5 bg-[var(--c-border)] mx-1" />

          <div class="relative">
            <button
              ref="more_button_ref"
              @click="show_more_menu = !show_more_menu"
              class="px-3 py-1.5 text-sm text-slate-600 hover:text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)] rounded-lg transition-colors flex items-center gap-1"
            >
              更多
              <ChevronDown
                class="w-3 h-3 transition-transform"
                :class="show_more_menu ? 'rotate-180' : ''"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 移动端：底部固定导航 -->
  <div v-else class="fixed bottom-0 left-0 right-0 z-50">
    <div class="bg-white border-t border-[var(--c-border)] shadow-sm">
      <div class="flex items-center justify-around py-2">
        <!-- 首页 -->
        <button @click="handle_home_click" class="flex flex-col items-center gap-0.5 px-3 py-1">
          <Home class="w-5 h-5 text-[var(--c-primary)]" />
          <span class="text-xs text-[var(--c-primary)]">首页</span>
        </button>

        <!-- 主菜单项 -->
        <button
          v-for="item in menu_items"
          :key="item.key"
          @click="handle_menu_click(item.key)"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-slate-600"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-xs">{{ item.label }}</span>
        </button>

        <!-- 更多按钮 -->
        <button
          ref="more_button_ref"
          @click="show_more_menu = !show_more_menu"
          class="flex flex-col items-center gap-0.5 px-3 py-1 text-slate-600"
        >
          <Menu class="w-5 h-5" />
          <span class="text-xs">更多</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 下拉菜单 -->
  <Teleport to="body">
    <!-- 桌面端下拉 -->
    <div
      v-if="!is_mobile && show_more_menu"
      class="fixed z-[60] rounded-xl shadow-xl min-w-32 backdrop-blur-xl bg-[var(--c-bg)]/90 border border-[var(--c-border)]"
      :style="{ top: `${dropdown_position.top}px`, left: `${dropdown_position.left}px` }"
      @mouseenter="handle_mouse_enter"
      @mouseleave="handle_mouse_leave"
    >
      <button
        v-for="item in more_items"
        :key="item.key"
        @click="handle_more_click(item.key)"
        class="w-full px-4 py-2 text-left text-sm text-slate-600 hover:text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)] transition-colors flex items-center gap-2 first:rounded-t-xl last:rounded-b-xl"
      >
        <component :is="item.icon" class="w-4 h-4" />
        {{ item.label }}
      </button>
      <button
        @click="next_theme"
        class="w-full px-4 py-2 text-left text-sm text-slate-600 hover:text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)] transition-colors flex items-center gap-2 rounded-b-xl border-t border-[var(--c-border)]"
      >
        <Palette class="w-4 h-4" />
        切换主题
      </button>
    </div>

    <!-- 移动端下拉 -->
    <transition v-if="is_mobile" name="fade">
      <div
        v-if="show_more_menu"
        class="fixed inset-0 z-[60] bg-black/20"
        @click="show_more_menu = false"
      >
        <transition name="slide-up">
          <div
            v-if="show_more_menu"
            class="absolute bottom-14 left-2 right-2 bg-white rounded-xl shadow-lg border border-[var(--c-border)] p-3"
            @click.stop
          >
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="item in more_items"
                :key="item.key"
                @click="handle_more_click(item.key)"
                class="flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--c-primary-bg)] hover:bg-[var(--c-primary-light)]/30 transition-colors"
              >
                <component :is="item.icon" class="w-5 h-5 text-[var(--c-primary)]" />
                <span class="text-xs text-slate-700">{{ item.label }}</span>
              </button>
              <button
                @click="handle_theme_switch"
                class="flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--c-primary-bg)] hover:bg-[var(--c-primary-light)]/30 transition-colors"
              >
                <Palette class="w-5 h-5 text-[var(--c-primary)]" />
                <span class="text-xs text-slate-700">主题</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
}
</style>
