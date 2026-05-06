<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import RunningDaysCounter from '@/components/status/running-days-counter.vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@iconify/vue';
import { get_stats } from '@/lib/api/stats';
import { get_health } from '@/lib/api/health';
import type { StatsData } from '@/lib/types/stats';
import type { HealthData } from '@/lib/api/health';

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent]);

const stats_data = ref<StatsData | null>(null);
const health_data = ref<HealthData | null>(null);
const load_error = ref('');
const loading = ref(true);

// 实时 uptime：均由 epoch 时间戳驱动
const now = ref(Date.now());
let interval_id: ReturnType<typeof setInterval> | null = null;

const live_uptime_seconds = computed(() => {
  if (!stats_data.value) return 0;
  return Math.floor(now.value / 1000) - stats_data.value.deploy_info.deployed_at_epoch;
});

const live_health_uptime = computed(() => {
  if (!health_data.value) return 0;
  return Math.floor(now.value / 1000) - health_data.value.instance_started_at_epoch;
});

const chart_option = computed(() => {
  const data = stats_data.value?.pageviews_timeline;
  if (!data?.length) return null;
  return {
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: {
      type: 'category' as const,
      data: data.map(p => p.date),
      show: false,
    },
    yAxis: { show: false, min: 0 },
    series: [
      {
        type: 'line' as const,
        data: data.map(p => p.pageviews),
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2 },
        areaStyle: { opacity: 0.15 },
      },
    ],
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: { value: number }[]) =>
        `${params[0].value} 浏览`,
    },
  };
});

onMounted(async () => {
  try {
    const [stats, health] = await Promise.all([
      get_stats(),
      get_health(),
    ]);
    stats_data.value = stats;
    health_data.value = health;
    interval_id = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  } catch (e) {
    load_error.value = e instanceof Error ? e.message : '获取状态失败';
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (interval_id) clearInterval(interval_id);
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
      <RunningDaysCounter :uptime_seconds="live_uptime_seconds" class="mb-6" />

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

      <!-- 浏览趋势 -->
      <Card v-if="stats_data.pageviews_timeline.length > 0" size="sm">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <Icon icon="lucide:trending-up" class="size-4 text-muted-foreground" />
            浏览趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VChart
            v-if="chart_option"
            :option="chart_option"
            autoresize
            class="h-24 w-full"
          />
          <p class="text-xs text-muted-foreground mt-2 text-center">
            {{ stats_data.pageviews_timeline[0]?.date }} — {{ stats_data.pageviews_timeline[stats_data.pageviews_timeline.length - 1]?.date }}
          </p>
        </CardContent>
      </Card>
    </template>

    <!-- API 状态 -->
    <Card v-if="health_data" size="sm">
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
                :class="health_data.status === 'ok' ? 'bg-green-500' : 'bg-red-500'"
              />
              {{ health_data.status === 'ok' ? '正常' : '异常' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">运行时间</p>
            <p class="text-sm font-medium text-foreground mt-0.5">
              {{ live_health_uptime > 86400 ? Math.floor(live_health_uptime / 86400) + '天' : Math.floor(live_health_uptime / 3600) + '小时' }}
            </p>
          </div>
          <div v-if="health_data.checks?.d1">
            <p class="text-xs text-muted-foreground">D1 延迟</p>
            <p class="text-sm font-medium text-foreground mt-0.5">
              {{ health_data.checks.d1.status === 'ok' ? health_data.checks.d1.latency_ms + 'ms' : '异常' }}
            </p>
          </div>
          <div v-if="health_data.checks?.kv">
            <p class="text-xs text-muted-foreground">KV 延迟</p>
            <p class="text-sm font-medium text-foreground mt-0.5">
              {{ health_data.checks.kv.status === 'ok' ? health_data.checks.kv.latency_ms + 'ms' : '异常' }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
