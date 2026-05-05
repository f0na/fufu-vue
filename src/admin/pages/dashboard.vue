<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { RouterLink } from 'vue-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { get_dashboard } from '@/lib/api/dashboard';
import type { DashboardStats } from '@/lib/types/dashboard';

const data = ref<DashboardStats | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    data.value = await get_dashboard();
  } catch (e) {
    error.value = '无法连接后端 API，请检查服务是否启动';
  } finally {
    loading.value = false;
  }
});

const quick_actions = [
  { label: '写文章', icon: 'lucide:pen-square', to: '/admin/posts' },
  { label: '管理链接', icon: 'lucide:link', to: '/admin/links' },
  { label: '友人帐', icon: 'lucide:users', to: '/admin/friends' },
  { label: '系统设置', icon: 'lucide:settings', to: '/admin/settings' },
];

function max_pageviews(items: Array<{ pageviews: number }>): number {
  return Math.max(...items.map(i => i.pageviews), 1);
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-foreground">仪表盘</h1>
      <p class="text-sm text-muted-foreground mt-1">全站运营数据概览</p>
    </div>

    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card v-for="i in 3" :key="i" size="sm">
          <CardHeader class="pb-2"><div class="h-4 w-16 animate-pulse rounded bg-muted" /></CardHeader>
          <CardContent><div class="h-8 w-20 animate-pulse rounded bg-muted" /></CardContent>
        </Card>
      </div>
    </template>

    <template v-else-if="error">
      <Card size="sm" class="mb-8">
        <CardContent class="flex flex-col items-center py-10">
          <Icon icon="lucide:cloud-off" class="size-10 text-muted-foreground mb-3" />
          <p class="text-sm text-muted-foreground">{{ error }}</p>
        </CardContent>
      </Card>
    </template>

    <template v-else-if="data">
      <!-- 实时访客 -->
      <Card size="sm" class="mb-6">
        <CardContent class="flex items-center justify-between py-4">
          <div class="flex items-center gap-3">
            <span class="relative flex size-3">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span class="relative inline-flex size-3 rounded-full bg-green-500" />
            </span>
            <div>
              <p class="text-sm text-muted-foreground">当前在线</p>
              <p class="text-3xl font-bold text-foreground tabular-nums">{{ data.analytics.active_visitors }}</p>
            </div>
          </div>
          <Icon icon="lucide:activity" class="size-6 text-muted-foreground/40" />
        </CardContent>
      </Card>

      <!-- 今日数据 -->
      <Card size="sm" class="mb-6">
        <CardHeader>
          <CardTitle class="text-sm text-muted-foreground">今日统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-3xl font-bold text-foreground tabular-nums">{{ data.analytics.today.pageviews.toLocaleString() }}</p>
              <p class="text-xs text-muted-foreground mt-1">页面浏览量</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-foreground tabular-nums">{{ data.analytics.today.visitors.toLocaleString() }}</p>
              <p class="text-xs text-muted-foreground mt-1">独立访客</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-foreground tabular-nums">{{ data.analytics.today.visits.toLocaleString() }}</p>
              <p class="text-xs text-muted-foreground mt-1">访问次数</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 月度对比 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card size="sm">
          <CardHeader>
            <CardTitle class="text-sm">本月</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">浏览量</span>
              <span class="text-sm font-medium tabular-nums">{{ data.analytics.this_month.pageviews.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">访客数</span>
              <span class="text-sm font-medium tabular-nums">{{ data.analytics.this_month.visitors.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">访问次数</span>
              <span class="text-sm font-medium tabular-nums">{{ data.analytics.this_month.visits.toLocaleString() }}</span>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle class="text-sm">近 30 天</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">浏览量</span>
              <span class="text-sm font-medium tabular-nums">{{ data.analytics.last_30_days.pageviews.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">访客数</span>
              <span class="text-sm font-medium tabular-nums">{{ data.analytics.last_30_days.visitors.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">访问次数</span>
              <span class="text-sm font-medium tabular-nums">{{ data.analytics.last_30_days.visits.toLocaleString() }}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 浏览趋势 -->
      <Card v-if="data.analytics.pageviews_timeline.length > 0" size="sm" class="mb-6">
        <CardHeader>
          <CardTitle class="text-sm flex items-center gap-2">
            <Icon icon="lucide:trending-up" class="size-4 text-muted-foreground" />
            浏览趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-end gap-1 h-32">
            <div
              v-for="(point, i) in data.analytics.pageviews_timeline"
              :key="i"
              class="flex-1 flex flex-col items-center gap-1 group relative"
            >
              <div
                class="w-full rounded-t bg-primary/40 hover:bg-primary/60 transition-colors cursor-pointer"
                :style="{
                  height: `${Math.max(4, (point.pageviews / max_pageviews(data.analytics.pageviews_timeline)) * 100)}px`,
                }"
              />
              <div class="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                <span class="text-xs bg-popover text-popover-foreground px-2 py-1 rounded shadow">
                  {{ point.date }}: {{ point.pageviews }}
                </span>
              </div>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-3 text-center">
            {{ data.analytics.pageviews_timeline[0]?.date }} — {{ data.analytics.pageviews_timeline[data.analytics.pageviews_timeline.length - 1]?.date }}
          </p>
        </CardContent>
      </Card>

      <!-- Top Pages & Referrers -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card v-if="data.analytics.top_pages.length > 0" size="sm">
          <CardHeader>
            <CardTitle class="text-sm flex items-center gap-2">
              <Icon icon="lucide:file-text" class="size-4 text-muted-foreground" />
              热门页面
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div v-for="page in data.analytics.top_pages.slice(0, 8)" :key="page.name" class="flex items-center justify-between">
              <span class="text-sm text-foreground truncate max-w-[70%]">{{ page.name }}</span>
              <span class="text-sm text-muted-foreground tabular-nums">{{ page.count }}</span>
            </div>
          </CardContent>
        </Card>

        <Card v-if="data.analytics.top_referrers.length > 0" size="sm">
          <CardHeader>
            <CardTitle class="text-sm flex items-center gap-2">
              <Icon icon="lucide:external-link" class="size-4 text-muted-foreground" />
              来源渠道
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div v-for="ref in data.analytics.top_referrers.slice(0, 8)" :key="ref.name" class="flex items-center justify-between">
              <span class="text-sm text-foreground truncate max-w-[70%]">{{ ref.name }}</span>
              <span class="text-sm text-muted-foreground tabular-nums">{{ ref.count }}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 受众分析 -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card v-if="data.analytics.browsers.length > 0" size="sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs text-muted-foreground flex items-center gap-1">
              <Icon icon="lucide:globe" class="size-3" /> 浏览器
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div v-for="b in data.analytics.browsers.slice(0, 5)" :key="b.name" class="flex items-center justify-between">
              <span class="text-xs text-foreground">{{ b.name }}</span>
              <span class="text-xs text-muted-foreground tabular-nums">{{ b.count }}</span>
            </div>
          </CardContent>
        </Card>

        <Card v-if="data.analytics.os.length > 0" size="sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs text-muted-foreground flex items-center gap-1">
              <Icon icon="lucide:monitor" class="size-3" /> 操作系统
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div v-for="o in data.analytics.os.slice(0, 5)" :key="o.name" class="flex items-center justify-between">
              <span class="text-xs text-foreground">{{ o.name }}</span>
              <span class="text-xs text-muted-foreground tabular-nums">{{ o.count }}</span>
            </div>
          </CardContent>
        </Card>

        <Card v-if="data.analytics.devices.length > 0" size="sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs text-muted-foreground flex items-center gap-1">
              <Icon icon="lucide:smartphone" class="size-3" /> 设备
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div v-for="d in data.analytics.devices.slice(0, 5)" :key="d.name" class="flex items-center justify-between">
              <span class="text-xs text-foreground">{{ d.name }}</span>
              <span class="text-xs text-muted-foreground tabular-nums">{{ d.count }}</span>
            </div>
          </CardContent>
        </Card>

        <Card v-if="data.analytics.countries.length > 0" size="sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs text-muted-foreground flex items-center gap-1">
              <Icon icon="lucide:map-pin" class="size-3" /> 国家
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div v-for="c in data.analytics.countries.slice(0, 5)" :key="c.name" class="flex items-center justify-between">
              <span class="text-xs text-foreground">{{ c.name }}</span>
              <span class="text-xs text-muted-foreground tabular-nums">{{ c.count }}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 系统状态 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card size="sm">
          <CardHeader>
            <CardTitle class="text-sm flex items-center gap-2">
              <Icon icon="lucide:server" class="size-4 text-muted-foreground" />
              系统健康
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">状态</span>
              <span
                class="inline-flex items-center gap-1 text-xs font-medium"
                :class="data.health.status === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
              >
                <span class="size-1.5 rounded-full" :class="data.health.status === 'ok' ? 'bg-green-500' : 'bg-red-500'" />
                {{ data.health.status === 'ok' ? '正常' : '异常' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">运行时间</span>
              <span class="text-sm font-medium tabular-nums">{{ data.deploy_info.uptime_human }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">版本</span>
              <span class="text-sm font-medium">v{{ data.health.version }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">KV</span>
              <span
                class="inline-flex items-center gap-1 text-xs font-medium"
                :class="data.health.kv.status === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
              >
                <span class="size-1.5 rounded-full" :class="data.health.kv.status === 'ok' ? 'bg-green-500' : 'bg-red-500'" />
                {{ data.health.kv.status === 'ok' ? '正常' : '异常' }}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle class="text-sm flex items-center gap-2">
              <Icon icon="lucide:database" class="size-4 text-muted-foreground" />
              数据库
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div v-for="db in data.databases" :key="db.name" class="flex items-center justify-between">
              <div>
                <span class="text-sm text-foreground">{{ db.name }}</span>
                <span class="text-xs text-muted-foreground ml-2">{{ db.binding }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="db.status === 'ok'" class="text-xs text-muted-foreground tabular-nums">{{ db.latency_ms }}ms</span>
                <span
                  class="inline-flex items-center gap-1 text-xs font-medium"
                  :class="db.status === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                >
                  <span class="size-1.5 rounded-full" :class="db.status === 'ok' ? 'bg-green-500' : 'bg-red-500'" />
                  {{ db.status === 'ok' ? '正常' : '异常' }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 内容统计 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card size="sm">
          <CardHeader>
            <CardTitle class="text-sm flex items-center gap-2">
              <Icon icon="lucide:file-text" class="size-4 text-muted-foreground" />
              内容统计
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">文章</span>
              <span class="text-sm font-medium tabular-nums">{{ data.stats.posts }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">友人帐</span>
              <span class="text-sm font-medium tabular-nums">{{ data.stats.friends }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">链接</span>
              <span class="text-sm font-medium tabular-nums">{{ data.stats.links }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">相册</span>
              <span class="text-sm font-medium tabular-nums">{{ data.stats.galleries }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">追番</span>
              <span class="text-sm font-medium tabular-nums">{{ data.stats.bangumi_records }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- 外部 API -->
        <Card size="sm">
          <CardHeader>
            <CardTitle class="text-sm flex items-center gap-2">
              <Icon icon="lucide:plug" class="size-4 text-muted-foreground" />
              外部 API
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2">
            <div v-for="api in data.external_apis" :key="api.name" class="flex items-center justify-between">
              <span class="text-sm text-foreground">{{ api.name }}</span>
              <div class="flex items-center gap-2">
                <span v-if="api.latency_ms !== null" class="text-xs text-muted-foreground tabular-nums">{{ api.latency_ms }}ms</span>
                <span
                  class="inline-flex items-center gap-1 text-xs font-medium"
                  :class="api.status === 'ok' ? 'text-green-600 dark:text-green-400' : api.status === 'skipped' ? 'text-muted-foreground' : 'text-red-600 dark:text-red-400'"
                >
                  <span
                    class="size-1.5 rounded-full"
                    :class="api.status === 'ok' ? 'bg-green-500' : api.status === 'skipped' ? 'bg-muted-foreground' : 'bg-red-500'"
                  />
                  {{ api.status === 'ok' ? '正常' : api.status === 'skipped' ? '跳过' : '异常' }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 部署信息 -->
      <Card size="sm" class="mb-6">
        <CardHeader>
          <CardTitle class="text-sm flex items-center gap-2">
            <Icon icon="lucide:cloud" class="size-4 text-muted-foreground" />
            部署信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p class="text-xs text-muted-foreground">部署时间</p>
              <p class="text-sm font-medium text-foreground mt-0.5">{{ data.deploy_info.deployed_at }}</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">运行时长</p>
              <p class="text-sm font-medium text-foreground mt-0.5">{{ data.deploy_info.uptime_human }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 快捷操作 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle class="text-sm">快捷操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-3">
              <Button
                v-for="action in quick_actions"
                :key="action.label"
                variant="outline"
                class="justify-start gap-2 h-auto py-3"
                as-child
              >
                <RouterLink :to="action.to">
                  <Icon :icon="action.icon" class="size-4 shrink-0" />
                  <span class="text-sm">{{ action.label }}</span>
                </RouterLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>
