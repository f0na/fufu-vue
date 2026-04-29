<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BangumiCard from '@/components/bangumi/bangumi-card.vue';
import type { BangumiSubject, BangumiRecord, WeekdayGroup } from '@/lib/types/bangumi';

interface Props {
  weekday_groups: WeekdayGroup[];
  subjects: BangumiSubject[];
  records: BangumiRecord[];
  is_loading: boolean;
  on_card_click: (subject_id: number) => void;
}

const props = defineProps<Props>();

const selected_weekday = ref<number | null>(null);

const filtered_groups = computed(() =>
  props.weekday_groups.filter(
    (g) => selected_weekday.value === null || g.weekday === selected_weekday.value
  )
);
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 星期筛选 -->
    <div v-if="weekday_groups.length > 0" class="flex flex-wrap gap-2">
      <Button
        :variant="selected_weekday === null ? 'default' : 'outline'"
        size="sm"
        @click="selected_weekday = null"
      >
        全部
      </Button>
      <Button
        v-for="group in weekday_groups"
        :key="group.weekday"
        :variant="selected_weekday === group.weekday ? 'default' : 'outline'"
        size="sm"
        @click="selected_weekday = group.weekday"
      >
        {{ group.label }}
      </Button>
    </div>

    <!-- 星期分组显示 -->
    <div v-if="filtered_groups.length > 0" class="flex flex-col gap-8">
      <div v-for="group in filtered_groups" :key="group.weekday" class="flex flex-col gap-4">
        <!-- 星期标题 -->
        <div class="flex items-center gap-2">
          <h2 class="font-semibold text-lg">{{ group.label }}</h2>
          <span class="text-muted-foreground text-sm">({{ group.subjects.length }}部)</span>
        </div>

        <!-- 番剧瀑布流 -->
        <div class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <BangumiCard
            v-for="subject in group.subjects"
            :key="subject.id"
            :subject="subject"
            :record="records.find((r) => r.subject_id === subject.id)"
            :on_click="() => on_card_click(subject.id)"
            class="break-inside-avoid"
          />
        </div>
      </div>
    </div>

    <!-- 无数据 -->
    <div v-if="!is_loading && subjects.length === 0" class="text-center py-8 text-muted-foreground">
      暂无番剧数据
    </div>

    <!-- 加载状态 -->
    <div v-if="is_loading" class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      <div
        v-for="i in 6"
        :key="i"
        class="break-inside-avoid overflow-hidden rounded-xl border border-border"
      >
        <Skeleton class="aspect-[3/4] w-full" />
        <div class="p-1.5">
          <Skeleton class="h-4 w-3/4" />
        </div>
      </div>
    </div>
  </div>
</template>
