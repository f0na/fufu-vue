<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import type { BangumiSubject, BangumiRecord } from '@/lib/types/bangumi'

interface Props {
  subject: BangumiSubject
  record?: BangumiRecord
  on_click?: (subject_id: number) => void
  class?: string
}

const props = defineProps<Props>()

const display_name = props.subject.name_cn || props.subject.name
</script>

<template>
  <Card
    :class="['relative overflow-hidden cursor-pointer group', props.class]"
    @click="() => props.on_click?.(props.subject.id)"
  >
    <!-- 封面 -->
    <template v-if="subject.images?.large">
      <img
        :src="subject.images.large"
        :alt="display_name"
        class="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
    </template>
    <template v-else-if="subject.images?.grid">
      <img
        :src="subject.images.grid"
        :alt="display_name"
        class="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
    </template>
    <template v-else-if="subject.cover_url">
      <img
        :src="subject.cover_url"
        :alt="display_name"
        class="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
    </template>
    <template v-else>
      <div class="aspect-[3/4] w-full bg-muted flex items-center justify-center">
        <span class="text-muted-foreground text-lg font-medium">{{ display_name.slice(0, 2) }}</span>
      </div>
    </template>

    <!-- 标题 -->
    <div class="p-1.5">
      <h3 class="font-medium text-sm leading-tight line-clamp-2">
        {{ display_name }}
      </h3>
      <p v-if="record?.progress" class="text-xs text-muted-foreground mt-0.5">
        进度: {{ record.progress }}
      </p>
    </div>
  </Card>
</template>
