<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/vue';
import { cn } from '@/lib/utils';
import { ref } from 'vue';
import type { BangumiRecord, BangumiStatus } from '@/lib/types/bangumi';

const status_labels: Record<BangumiStatus, string> = {
  watching: '在看',
  want_to_watch: '想看',
  watched: '看过',
  dropped: '抛弃',
};

const status_colors: Record<BangumiStatus, string> = {
  watching: 'bg-primary/20 text-primary',
  want_to_watch: 'bg-secondary text-secondary-foreground',
  watched: 'bg-muted text-muted-foreground',
  dropped: 'bg-destructive/20 text-destructive',
};

interface Props {
  record: BangumiRecord;
  on_progress_update?: (progress: string) => void;
  on_delete?: () => void;
  class?: string;
}

const props = defineProps<Props>();

const is_editing = ref(false);
const edit_value = ref(props.record.progress);

function handle_save() {
  if (edit_value.value !== props.record.progress && props.on_progress_update) {
    props.on_progress_update(edit_value.value);
  }
  is_editing.value = false;
}

function handle_cancel() {
  edit_value.value = props.record.progress;
  is_editing.value = false;
}
</script>

<template>
  <Card :class="cn('overflow-hidden', props.class)">
    <!-- 封面 -->
    <div class="relative aspect-video overflow-hidden">
      <template v-if="record.cover_url">
        <img
          :src="record.cover_url"
          :alt="record.title"
          class="object-cover w-full h-full"
          loading="lazy"
        />
      </template>
      <template v-else>
        <div class="w-full h-full bg-muted flex items-center justify-center">
          <span class="text-muted-foreground text-sm">{{ record.title.slice(0, 2) }}</span>
        </div>
      </template>
    </div>

    <CardContent class="flex flex-col gap-2 p-3">
      <!-- 番剧名称 -->
      <h3 class="font-medium text-sm line-clamp-2">{{ record.title }}</h3>

      <!-- 元信息 -->
      <div class="flex flex-col gap-1 text-xs text-muted-foreground">
        <span v-if="record.fansub" class="truncate">字幕组: {{ record.fansub }}</span>
        <Badge :class="cn('text-xs', status_colors[record.status])">
          {{ status_labels[record.status] }}
        </Badge>
      </div>

      <!-- 进度编辑 -->
      <div v-if="is_editing" class="flex items-center gap-1">
        <input
          v-model="edit_value"
          placeholder="进度: pv2"
          class="h-7 flex-1 text-xs px-2 rounded-md border border-border bg-background"
        />
        <Button size="icon-xs" variant="ghost" @click="handle_save" class="text-primary">
          <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </Button>
        <Button size="icon-xs" variant="ghost" @click="handle_cancel" class="text-muted-foreground">
          <svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>
      <div v-else class="flex items-center gap-2">
        <span
          class="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          @click="is_editing = true"
        >
          进度: {{ record.progress || '未设置' }}
        </span>
      </div>

      <!-- 删除按钮 -->
      <Button
        v-if="on_delete"
        size="icon-xs"
        variant="ghost"
        @click="on_delete"
        class="self-end text-muted-foreground hover:text-destructive"
      >
        <Icon icon="lucide:trash-2" class="size-3.5" />
      </Button>
    </CardContent>
  </Card>
</template>
