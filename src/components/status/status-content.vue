<script setup lang="ts">
import { ref, onMounted } from 'vue';
import RunningDaysCounter from '@/components/status/running-days-counter.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@iconify/vue';
import { get_health } from '@/lib/api/health';
import { get_stats } from '@/lib/api/stats';
import { get_profile } from '@/lib/api/settings';
import type { StatsData } from '@/lib/types/stats';

interface HealthInfo {
  status: string;
  uptime: number;
  checks: Record<string, { status: string; latency_ms?: number }>;
}

interface SiteInfo {
  site_name: string;
  subtitle: string;
  description: string;
}

const health_info = ref<HealthInfo | null>(null);
const stats_data = ref<StatsData | null>(null);
const site_info = ref<SiteInfo | null>(null);
const load_error = ref('');
const loading = ref(true);

onMounted(async () => {
  try {
    const [health, stats, profile] = await Promise.all([
      get_health(),
      get_stats(),
      get_profile().catch(() => null),
    ]);

    health_info.value = health;
    stats_data.value = stats;

    site_info.value = profile?.data
      ? {
          site_name: profile.data.site_name || '',
          subtitle: profile.data.subtitle || '',
          description: profile.data.description || '',
        }
      : null;
  } catch (e) {
    load_error.value = e instanceof Error ? e.message : '获取状态失败';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <template v-if="loading">
      <div class="flex items-center justify-center py-12 text-muted-foreground">
        <Icon icon="lucide:loader-circle" class="size-5 animate-spin mr-2" />
        加载中...
      </div>
    </template>

    <template v-else-if="load_error">
      <Card size="sm">
        <CardContent class="flex flex-col items-center py-10">
          <Icon icon="lucide:cloud-off" class="size-8 text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground">{{ load_error }}</p>
        </CardContent>
      </Card>
    </template>

    <template v-if="stats_data">
      <RunningDaysCounter :uptime_seconds="stats_data.deploy_info.uptime_seconds" class="mb-6" />

      <!-- 实时访客 -->
      <Card size="sm">
        <CardContent class="flex items-center gap-3 py-4">
          <span class="relative flex size-3">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span class="relative inline-flex size-3 rounded-full bg-green-500" />
          </span>
          <div>
            <p class="text-sm text-muted-foreground">当前在线</p>
            <p class="text-xl font-bold text-foreground tabular-nums">
              {{ stats_data.active_visitors }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- 今日统计 -->
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:bar-chart-3" class="size-4 text-muted-foreground" />
            今日统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-foreground tabular-nums">
                {{ stats_data.today.pageviews.toLocaleString() }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">浏览量</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-foreground tabular-nums">
                {{ stats_data.today.visitors.toLocaleString() }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">访客数</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-foreground tabular-nums">
                {{ stats_data.today.visits.toLocaleString() }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">访问次数</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 近30天统计 -->
      <Card size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:calendar" class="size-4 text-muted-foreground" />
            近 30 天
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-foreground tabular-nums">
                {{ stats_data.last_30_days.pageviews.toLocaleString() }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">浏览量</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-foreground tabular-nums">
                {{ stats_data.last_30_days.visitors.toLocaleString() }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">访客数</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-foreground tabular-nums">
                {{ stats_data.last_30_days.visits.toLocaleString() }}
              </p>
              <p class="text-xs text-muted-foreground mt-1">访问次数</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 时间线迷你图 -->
      <Card v-if="stats_data.pageviews_timeline.length > 0" size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:trending-up" class="size-4 text-muted-foreground" />
            浏览趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-end gap-1 h-24">
            <div
              v-for="(point, i) in stats_data.pageviews_timeline"
              :key="i"
              class="flex-1 flex flex-col items-center gap-1"
              :title="`${point.date}: ${point.pageviews} 浏览`"
            >
              <div
                class="w-full rounded-t bg-primary/60 hover:bg-primary/80 transition-colors"
                :style="{
                  height: `${Math.max(4, (point.pageviews / Math.max(...stats_data.pageviews_timeline.map(p => p.pageviews))) * 100)}px`,
                }"
              />
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-2 text-center">
            {{ stats_data.pageviews_timeline[0]?.date }} — {{ stats_data.pageviews_timeline[stats_data.pageviews_timeline.length - 1]?.date }}
          </p>
        </CardContent>
      </Card>
    </template>

    <!-- API 状态 -->
    <Card v-if="health_info" size="sm">
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
              <span
                class="size-2 rounded-full"
                :class="health_info.status === 'ok' ? 'bg-green-500' : 'bg-red-500'"
              />
              {{ health_info.status === 'ok' ? '正常' : '异常' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">运行时间</p>
            <p class="text-sm font-medium text-foreground mt-0.5">
              {{ health_info.uptime > 86400 ? Math.floor(health_info.uptime / 86400) + '天' : Math.floor(health_info.uptime / 3600) + '小时' }}
            </p>
          </div>
          <div v-if="health_info.checks?.d1">
            <p class="text-xs text-muted-foreground">D1 延迟</p>
            <p class="text-sm font-medium text-foreground mt-0.5">
              {{ health_info.checks.d1.status === 'ok' ? health_info.checks.d1.latency_ms + 'ms' : '异常' }}
            </p>
          </div>
          <div v-if="health_info.checks?.kv">
            <p class="text-xs text-muted-foreground">KV 延迟</p>
            <p class="text-sm font-medium text-foreground mt-0.5">
              {{ health_info.checks.kv.status === 'ok' ? health_info.checks.kv.latency_ms + 'ms' : '异常' }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 站点信息 -->
    <Card v-if="site_info" size="sm">
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
            <p class="text-sm font-medium text-foreground mt-0.5">
              {{ site_info.site_name || '-' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">副标题</p>
            <p class="text-sm font-medium text-foreground mt-0.5">
              {{ site_info.subtitle || '-' }}
            </p>
          </div>
          <div class="sm:col-span-2">
            <p class="text-xs text-muted-foreground">描述</p>
            <p class="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {{ site_info.description || '-' }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
