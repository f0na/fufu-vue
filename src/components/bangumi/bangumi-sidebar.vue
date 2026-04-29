<script setup lang="ts">
import { ref, watch, computed, inject, onMounted, onUnmounted } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/vue';
import { RightSidebarPortalKey } from '@/context/right-sidebar-portal';
import type { RightSidebarPortalValue } from '@/context/right-sidebar-portal';
import type { BangumiStatus, BangumiSubject, BangumiRecord } from '@/lib/types/bangumi';

const portal_target_ref = ref<HTMLDivElement | null>(null);
const portal = inject<RightSidebarPortalValue>(
  RightSidebarPortalKey,
  null as unknown as RightSidebarPortalValue
);

onMounted(() => {
  if (portal && portal_target_ref.value) {
    portal.set_portal_target(portal_target_ref.value);
  }
});

onUnmounted(() => {
  if (portal) {
    portal.set_portal_target(null);
  }
});

const status_labels: Record<BangumiStatus, string> = {
  watching: '在看',
  want_to_watch: '想看',
  watched: '看过',
  dropped: '抛弃',
};

interface Props {
  view: 'latest' | 'records' | 'search' | 'detail';
  on_view_change: (view: 'latest' | 'records' | 'search') => void;
  selected_subject: BangumiSubject | null;
  records: BangumiRecord[];
  on_status_change: (subject_id: number, status: BangumiStatus) => void;
  on_progress_change: (subject_id: number, progress: string) => void;
}

const props = defineProps<Props>();

const progress_input = ref('');
const has_progress_changed = ref(false);

const current_record = computed(() =>
  props.selected_subject
    ? props.records.find((r) => r.subject_id === props.selected_subject!.id)
    : undefined
);
const current_status = computed(() => current_record.value?.status);
const current_progress = computed(() => current_record.value?.progress || '');

watch(
  () => [props.selected_subject?.id, current_progress.value],
  () => {
    if (props.selected_subject) {
      progress_input.value = current_progress.value;
      has_progress_changed.value = false;
    }
  },
  { immediate: true }
);

function handle_progress_change(value: string) {
  progress_input.value = value;
  has_progress_changed.value = value !== current_progress.value;
}

function handle_save_progress() {
  if (props.selected_subject && has_progress_changed.value) {
    props.on_progress_change(props.selected_subject.id, progress_input.value);
    has_progress_changed.value = false;
  }
}
</script>

<template>
  <aside class="flex flex-col gap-4 w-full">
    <!-- Portal target - 看板娘渲染位置 -->
    <div ref="portal_target_ref" />

    <!-- 视图切换 - 仅在列表页显示 -->
    <div v-if="!selected_subject" class="flex flex-col gap-4">
      <Card size="sm">
        <CardContent class="p-3">
          <div class="flex flex-col gap-2">
            <Button
              :variant="view === 'latest' ? 'default' : 'outline'"
              size="sm"
              @click="on_view_change('latest')"
            >
              最新番剧
            </Button>
            <Button
              :variant="view === 'records' ? 'default' : 'outline'"
              size="sm"
              @click="on_view_change('records')"
            >
              番剧记录
            </Button>
            <Button
              :variant="view === 'search' ? 'default' : 'outline'"
              size="sm"
              @click="on_view_change('search')"
            >
              <Icon icon="lucide:search" class="size-4" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- 详情页状态操作 -->
    <div v-if="selected_subject">
      <Card size="sm">
        <CardHeader>
          <CardTitle class="text-sm">追番状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-3">
            <!-- 状态按钮 -->
            <Button
              v-for="status in [
                'watching',
                'want_to_watch',
                'watched',
                'dropped',
              ] as BangumiStatus[]"
              :key="status"
              :variant="current_status === status ? 'default' : 'outline'"
              size="sm"
              @click="() => on_status_change(selected_subject!.id, status)"
            >
              {{ status_labels[status] }}
            </Button>

            <!-- 进度输入 -->
            <div class="flex flex-col gap-1.5 pt-2">
              <span class="text-xs text-muted-foreground">观看进度</span>
              <div class="flex gap-2">
                <Input
                  :model-value="progress_input"
                  @update:model-value="handle_progress_change"
                  placeholder="如: EP05"
                  class="flex-1"
                />
                <Button
                  v-if="has_progress_changed"
                  variant="outline"
                  size="sm"
                  @click="handle_save_progress"
                >
                  <Icon icon="lucide:save" class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </aside>
</template>
