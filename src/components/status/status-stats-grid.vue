<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatItem {
  key: string
  label: string
  value: number
  trend?: number
  icon: string
}

interface Props {
  stats?: StatItem[]
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  stats: () => [
    { key: 'visitors', label: '访问数', value: 128, trend: 12, icon: 'lucide:eye' },
    { key: 'anime', label: '追番数', value: 42, trend: 3, icon: 'lucide:tv' },
    { key: 'posts', label: '文章数', value: 15, trend: 2, icon: 'lucide:file-text' },
    { key: 'images', label: '图片数', value: 120, trend: 8, icon: 'lucide:image' },
    { key: 'links', label: '链接数', value: 8, trend: 1, icon: 'lucide:link-2' },
    { key: 'comments', label: '评论数', value: 32, trend: 5, icon: 'lucide:message-circle' },
  ],
})
</script>

<template>
  <div :class="cn('grid grid-cols-2 sm:grid-cols-3 gap-4', props.class)">
    <div v-for="stat in stats" :key="stat.key">
      <Card class="h-full">
        <CardContent class="flex flex-col items-center py-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon :icon="stat.icon" class="size-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">{{ stat.label }}</span>
          </div>
          <div class="text-2xl font-bold text-foreground tabular-nums">
            {{ stat.value.toLocaleString() }}
          </div>
          <div
            v-if="stat.trend !== undefined"
            :class="cn(
              'flex items-center gap-1 text-xs mt-1',
              stat.trend > 0 && 'text-chart-1',
              stat.trend < 0 && 'text-destructive',
              stat.trend === 0 && 'text-muted-foreground'
            )"
          >
            <Icon v-if="stat.trend > 0" icon="lucide:trending-up" class="size-3" />
            <Icon v-if="stat.trend < 0" icon="lucide:trending-down" class="size-3" />
            <span>
              <template v-if="stat.trend > 0">+{{ stat.trend }}</template>
              <template v-else-if="stat.trend < 0">{{ stat.trend }}</template>
              <template v-else>0</template>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
