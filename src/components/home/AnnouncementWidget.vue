<script setup lang="ts">
const announcements = [
  { id: 1, content: '欢迎来到我的网站！', date: '2026-04-03' },
  { id: 2, content: '新功能开发中，敬请期待...', date: '2026-04-01' },
]
</script>

<template>
  <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
    <h3 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
      <div class="i-lucide-megaphone w-4 h-4 text-[var(--c-primary)]" />
      公告
    </h3>
    <ul class="space-y-2">
      <li v-for="item in announcements" :key="item.id" class="text-xs text-slate-600">
        <p>{{ item.content }}</p>
        <span class="text-[var(--c-primary-light)]">{{ item.date }}</span>
      </li>
    </ul>
  </div>
</template>
