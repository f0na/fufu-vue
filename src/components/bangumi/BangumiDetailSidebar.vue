<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'scroll-comments'): void
}>()

function handle_scroll_comments() {
  emit('scroll-comments')
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- 跳转评论 -->
    <button
      @click="handle_scroll_comments"
      class="flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-xl bg-white border border-[var(--c-border)] shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
    >
      <MessageCircle class="w-4 h-4" />
      跳转评论
    </button>
  </div>
</template>
