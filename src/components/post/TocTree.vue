<script setup lang="ts">
import type { PostTocItem } from '@/api/types'

const props = defineProps<{
  items: PostTocItem[]
}>()
</script>

<template>
  <template v-for="item in items" :key="item.id">
    <div class="py-1 text-slate-600" :style="{ paddingLeft: `${(item.level - 1) * 8}px` }">
      {{ item.text }}
    </div>
    <!-- 递归渲染子项 -->
    <TocTree v-if="item.children.length > 0" :items="item.children" />
  </template>
</template>