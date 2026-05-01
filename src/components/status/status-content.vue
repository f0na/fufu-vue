<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import RunningDaysCounter from '@/components/status/running-days-counter.vue';
import StatusStatsGrid from '@/components/status/status-stats-grid.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@iconify/vue';
import { get_status } from '@/lib/api/status';
import type { SiteStatus } from '@/lib/api/status';

const status_data = ref<SiteStatus | null>(null);
const load_error = ref('');

onMounted(async () => {
  try {
    status_data.value = await get_status();
  } catch (e) {
    load_error.value = e instanceof Error ? e.message : '获取状态失败';
  }
});

const data_stats = computed(() => {
  if (!status_data.value) return [];
  const s = status_data.value.stats;
  return [
    { key: 'posts', label: '文章', value: s.posts, icon: 'lucide:file-text' },
    { key: 'friends', label: '友人', value: s.friends, icon: 'lucide:users' },
    { key: 'links', label: '链接', value: s.links, icon: 'lucide:link-2' },
    { key: 'galleries', label: '相册', value: s.galleries, icon: 'lucide:image' },
    { key: 'bangumi', label: '追番', value: s.bangumi_records, icon: 'lucide:tv' },
  ];
});

function fmt_uptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}天${h}小时`;
  if (h > 0) return `${h}小时${m}分`;
  return `${m}分`;
}
</script>

<template>
  <div class="space-y-6">
    <template v-if="load_error">
      <p class="text-sm text-destructive">{{ load_error }}</p>
    </template>

    <template v-if="status_data">
      <RunningDaysCounter :uptime_seconds="status_data.api.uptime" class="mb-6" />
      <!-- API 状态 -->
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:server" class="size-4 text-muted-foreground" />
            API 状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p class="text-xs text-muted-foreground">状态</p>
              <p class="text-sm font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                <span class="size-2 rounded-full" :class="status_data.api.status === 'ok' ? 'bg-green-500' : 'bg-red-500'" />
                {{ status_data.api.status === 'ok' ? '正常' : '异常' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">版本</p>
              <p class="text-sm font-medium text-foreground mt-0.5">{{ status_data.api.version }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">运行时间</p>
              <p class="text-sm font-medium text-foreground mt-0.5">{{ fmt_uptime(status_data.api.uptime) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">数据库延迟</p>
              <p class="text-sm font-medium text-foreground mt-0.5">D1 {{ status_data.api.d1.latency_ms }}ms / KV {{ status_data.api.kv.latency_ms }}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 站点数据 -->
      <div>
        <h2 class="text-lg font-medium text-foreground mb-4">数据统计</h2>
        <StatusStatsGrid :stats="data_stats" />
      </div>

      <!-- 站点信息 -->
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:info" class="size-4 text-muted-foreground" />
            站点信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-muted-foreground">站点名称</p>
              <p class="text-sm font-medium text-foreground mt-0.5">{{ status_data.site.site_name }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">副标题</p>
              <p class="text-sm font-medium text-foreground mt-0.5">{{ status_data.site.subtitle || '-' }}</p>
            </div>
            <div class="sm:col-span-2">
              <p class="text-xs text-muted-foreground">描述</p>
              <p class="text-sm text-muted-foreground mt-0.5 line-clamp-2">{{ status_data.site.description || '-' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
