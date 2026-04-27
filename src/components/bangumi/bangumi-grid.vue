<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { BangumiSubject, BangumiRecord } from '@/lib/types/bangumi'

interface Props {
  subjects: BangumiSubject[]
  records: BangumiRecord[]
  on_card_click?: (subject_id: number) => void
  is_loading?: boolean
  has_more?: boolean
}

const props = defineProps<Props>()

const sentinel_ref = ref<HTMLDivElement | null>(null)
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 番剧网格 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <BangumiCard
        v-for="subject in subjects"
        :key="subject.id"
        :subject="subject"
        :record="records.find(r => r.subject_id === subject.id)"
        :on_click="() => props.on_card_click?.(subject.id)"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="props.is_loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="overflow-hidden rounded-xl border border-border">
        <Skeleton class="aspect-video w-full" />
        <div class="flex flex-col gap-2 p-3">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-3 w-1/2" />
          <Skeleton class="h-3 w-1/3" />
        </div>
      </div>
    </div>

    <!-- 无限滚动 sentinel -->
    <div v-if="props.has_more" ref="sentinel_ref" class="h-10 flex items-center justify-center">
      <span class="text-muted-foreground text-sm">加载更多...</span>
    </div>

    <!-- 无数据 -->
    <div v-if="!props.is_loading && props.subjects.length === 0" class="text-center py-8 text-muted-foreground">
      暂无番剧数据
    </div>
  </div>
</template>
