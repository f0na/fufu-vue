<script setup lang="ts">
/**
 * Markdown 编辑器工具栏
 * 提供快捷插入 Markdown 格式的按钮
 */
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  Image,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Code2,
  Keyboard,
} from 'lucide-vue-next'

const props = defineProps<{
  vimMode?: boolean
}>()

const emits = defineEmits<{
  (e: 'format', prefix: string, suffix: string): void
  (e: 'insert', text: string): void
  (e: 'toggle-vim'): void
  (e: 'insert-heading', level: number): void
}>()

// 标题下拉菜单
const show_heading_menu = ref(false)
const heading_menu_ref = ref<HTMLDivElement | null>(null)

// 点击外部关闭菜单
function handle_click_outside(e: MouseEvent) {
  if (heading_menu_ref.value && !heading_menu_ref.value.contains(e.target as Node)) {
    show_heading_menu.value = false
  }
}

// 格式化操作
function format(prefix: string, suffix: string = prefix) {
  emits('format', prefix, suffix)
  show_heading_menu.value = false
}

// 插入标题
function insert_heading(level: number) {
  emits('insert-heading', level)
  show_heading_menu.value = false
}

// 插入操作
function insert(text: string) {
  emits('insert', text)
}

// 工具按钮定义
const format_tools = [
  { icon: Bold, label: '加粗', prefix: '**', suffix: '**', shortcut: 'Ctrl+B' },
  { icon: Italic, label: '斜体', prefix: '*', suffix: '*', shortcut: 'Ctrl+I' },
  { icon: Strikethrough, label: '删除线', prefix: '~~', suffix: '~~' },
  { icon: Code, label: '行内代码', prefix: '`', suffix: '`', shortcut: 'Ctrl+`' },
]

const insert_tools = [
  { icon: Link, label: '链接', prefix: '[', suffix: '](url)', shortcut: 'Ctrl+K' },
  { icon: Image, label: '图片', prefix: '![', suffix: '](url)' },
  { icon: Code2, label: '代码块', prefix: '```', suffix: '\n```' },
  { icon: Quote, label: '引用', prefix: '> ', suffix: '' },
  { icon: List, label: '无序列表', prefix: '- ', suffix: '' },
  { icon: ListOrdered, label: '有序列表', prefix: '1. ', suffix: '' },
  { icon: Minus, label: '分割线', prefix: '\n---\n', suffix: '' },
]

onMounted(() => {
  document.addEventListener('click', handle_click_outside)
})

onUnmounted(() => {
  document.removeEventListener('click', handle_click_outside)
})
</script>

<template>
  <div class="editor-toolbar flex items-center gap-1 px-2 py-1.5 bg-white border-b border-[var(--c-border)] rounded-t-lg">
    <!-- 标题按钮 -->
    <div ref="heading_menu_ref" class="relative">
      <button
        @click="show_heading_menu = !show_heading_menu"
        class="toolbar-btn flex items-center gap-1 min-w-[60px]"
        title="标题"
      >
        <Heading1 class="w-4 h-4" />
        <span class="text-xs">标题</span>
      </button>

      <!-- 标题下拉菜单 -->
      <div
        v-if="show_heading_menu"
        class="absolute top-full left-0 mt-1 bg-white border border-[var(--c-border)] rounded-lg shadow-lg z-10 overflow-hidden min-w-[120px]"
      >
        <button
          v-for="level in [1, 2, 3, 4, 5, 6]"
          :key="level"
          @mousedown.prevent="insert_heading(level)"
          class="w-full px-3 py-1.5 text-left hover:bg-[var(--c-primary-bg)] transition-colors flex items-center gap-2"
        >
          <component
            :is="level <= 3 ? [Heading1, Heading2, Heading3][level - 1] : Heading3"
            class="w-4 h-4 text-slate-500"
          />
          <span :class="level <= 2 ? 'font-bold' : ''" :style="{ fontSize: `${16 - level}px` }">
            H{{ level }} 标题
          </span>
        </button>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="w-px h-5 bg-slate-200 mx-1" />

    <!-- 格式化按钮 -->
    <button
      v-for="tool in format_tools"
      :key="tool.label"
      @click="format(tool.prefix, tool.suffix)"
      class="toolbar-btn"
      :title="tool.label + (tool.shortcut ? ` (${tool.shortcut})` : '')"
    >
      <component :is="tool.icon" class="w-4 h-4" />
    </button>

    <!-- 分隔线 -->
    <div class="w-px h-5 bg-slate-200 mx-1" />

    <!-- 插入按钮 -->
    <button
      v-for="tool in insert_tools"
      :key="tool.label"
      @click="format(tool.prefix, tool.suffix)"
      class="toolbar-btn"
      :title="tool.label"
    >
      <component :is="tool.icon" class="w-4 h-4" />
    </button>

    <!-- 弹性空间 -->
    <div class="flex-1" />

    <!-- Vim 模式切换 -->
    <button
      @click="emits('toggle-vim')"
      class="toolbar-btn flex items-center gap-1 transition-colors"
      :class="vimMode ? 'bg-[var(--c-primary)] text-white hover:bg-[var(--c-primary-light)]' : ''"
      :title="vimMode ? '关闭 Vim 模式' : '开启 Vim 模式'"
    >
      <Keyboard class="w-4 h-4" />
      <span class="text-xs">Vim</span>
    </button>
  </div>
</template>

<style scoped>
.toolbar-btn {
  padding: 0.375rem;
  border-radius: 6px;
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: var(--c-primary-bg, #ffe4e6);
  color: var(--c-primary, #fb7185);
}

.toolbar-btn:focus {
  outline: 2px solid var(--c-primary, #fb7185);
  outline-offset: 2px;
}

.toolbar-btn.active {
  background: var(--c-primary-bg, #ffe4e6);
  color: var(--c-primary, #fb7185);
}
</style>