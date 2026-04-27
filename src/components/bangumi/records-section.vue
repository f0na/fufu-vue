<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BangumiRecord, BangumiStatus } from '@/lib/types/bangumi'

const status_order: BangumiStatus[] = ['watching', 'want_to_watch', 'watched', 'dropped']

const status_labels: Record<BangumiStatus, string> = {
  watching: '在看',
  want_to_watch: '想看',
  watched: '看过',
  dropped: '抛弃',
}

interface Props {
  records: BangumiRecord[]
  on_delete: (id: string) => void
  on_card_click: (subject_id: number) => void
}

const props = defineProps<Props>()

const selected_status = ref<BangumiStatus | 'all'>('all')

const grouped_records = computed<Record<BangumiStatus, BangumiRecord[]>>(() => {
  const acc: Record<BangumiStatus, BangumiRecord[]> = {
    watching: [],
    want_to_watch: [],
    watched: [],
    dropped: [],
  }
  for (const r of props.records) {
    acc[r.status].push(r)
  }
  return acc
})

const active_statuses = computed(() =>
  status_order.filter(s => grouped_records.value[s].length > 0)
)

const display_groups = computed(() =>
  selected_status.value === 'all'
    ? active_statuses.value.map(s => ({ status: s, records: grouped_records.value[s] }))
    : [{ status: selected_status.value, records: grouped_records.value[selected_status.value] || [] }]
)
</script>

<template>
  <div v-if="records.length > 0" class="flex flex-col gap-6">
    <!-- 状态筛选 -->
    <div class="flex flex-wrap gap-2">
      <Button
        :variant="selected_status === 'all' ? 'default' : 'outline'"
        size="sm"
        @click="selected_status = 'all'"
      >
        全部 ({{ records.length }})
      </Button>
      <Button
        v-for="status in active_statuses"
        :key="status"
        :variant="selected_status === status ? 'default' : 'outline'"
        size="sm"
        @click="selected_status = status"
      >
        {{ status_labels[status] }} ({{ grouped_records[status].length }})
      </Button>
    </div>

    <!-- 记录列表 -->
    <div v-for="{ status, records: group_records } in display_groups" :key="status" class="flex flex-col gap-3">
      <!-- 状态标题（仅在全部模式下显示） -->
      <div v-if="selected_status === 'all'" class="flex items-center gap-2">
        <Badge variant="secondary">{{ status_labels[status] }}</Badge>
        <span class="text-muted-foreground text-sm">({{ group_records.length }}部)</span>
      </div>

      <!-- 番剧瀑布流 -->
      <div v-if="group_records.length > 0" class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        <div
          v-for="record in group_records"
          :key="record.id"
          :class="cn('break-inside-avoid overflow-hidden cursor-pointer group rounded-xl border border-border')"
          @click="() => on_card_click(record.subject_id)"
        >
          <!-- 封面 -->
          <template v-if="record.cover_url">
            <img
              :src="record.cover_url"
              :alt="record.title"
              class="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </template>
          <template v-else>
            <div class="aspect-[3/4] w-full bg-muted flex items-center justify-center">
              <span class="text-muted-foreground text-lg font-medium">{{ record.title.slice(0, 2) }}</span>
            </div>
          </template>

          <!-- 标题和进度 -->
          <CardContent class="p-2">
            <h3 class="font-medium text-sm leading-tight line-clamp-2">{{ record.title }}</h3>
            <p v-if="record.progress" class="text-xs text-muted-foreground mt-1">
              进度: {{ record.progress }}
            </p>
          </CardContent>
        </div>
      </div>
      <div v-else class="text-center py-4 text-muted-foreground text-sm">
        暂无{{ status_labels[status] }}记录
      </div>
    </div>
  </div>
  <div v-else class="text-center py-12 text-muted-foreground">
    <p>暂无追番记录</p>
    <p class="text-sm mt-2">在番剧详情页点击追番状态按钮添加记录</p>
  </div>
</template>
