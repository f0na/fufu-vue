<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  start_date?: string
}

withDefaults(defineProps<Props>(), {
  start_date: '2026-04-17',
})

const days = ref(0)

onMounted(() => {
  const start = new Date('2026-04-17')
  const now = new Date()
  const diff_time = now.getTime() - start.getTime()
  days.value = Math.floor(diff_time / (1000 * 60 * 60 * 24))
})
</script>

<template>
  <Card>
    <CardContent class="flex flex-col items-center py-6">
      <div class="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon icon="lucide:clock" class="size-4" />
        <span class="text-sm">网站已运行</span>
      </div>
      <div class="flex items-baseline gap-1 transition-all duration-300">
        <span class="text-5xl font-bold text-primary tabular-nums">
          {{ days.toLocaleString() }}
        </span>
        <span class="text-2xl text-muted-foreground">天</span>
      </div>
      <div class="text-xs text-muted-foreground/60 mt-2">
        自 {{ start_date }} 起
      </div>
    </CardContent>
  </Card>
</template>
