<script setup lang="ts">
import { ref } from 'vue'

const search_query = ref('')
const is_focused = ref(false)

function handle_search() {
  if (search_query.value.trim()) {
    // TODO: 实现搜索功能，跳转到搜索结果页
  }
}

function clear_search() {
  search_query.value = ''
}
</script>

<template>
  <div class="sticky top-4">
    <div
      class="relative rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--c-border)] shadow-sm overflow-hidden transition-all duration-200"
      :class="
        is_focused
          ? 'border-[var(--c-primary)] shadow-md ring-2 ring-[var(--c-primary)]/20'
          : 'hover:border-[var(--c-primary-light)]'
      "
    >
      <!-- 搜索图标 -->
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <div class="i-lucide-search w-4 h-4" />
      </div>

      <!-- 输入框 -->
      <input
        v-model="search_query"
        type="text"
        placeholder="搜索..."
        class="w-full pl-9 pr-8 py-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
        @focus="is_focused = true"
        @blur="is_focused = false"
        @keyup.enter="handle_search"
      />

      <!-- 清除按钮 -->
      <button
        v-if="search_query"
        class="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
        @mousedown.prevent
        @click="clear_search"
      >
        <div class="i-lucide-x w-3 h-3" />
      </button>
    </div>
  </div>
</template>
