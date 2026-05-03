<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { RouterLink } from 'vue-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { get_dashboard } from '@/lib/api/dashboard';
import type { DashboardStats } from '@/lib/types/dashboard';
import { Analytics } from '@vercel/analytics/vue';
import { SpeedInsights } from '@vercel/speed-insights/vue';

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
</script>

<template>
  <div>
    <Analytics />
    <SpeedInsights />
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-foreground">仪表盘</h1>
      <p class="text-sm text-muted-foreground mt-1">全站运营数据概览</p>
    </div>

    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card v-for="i in 4" :key="i" size="sm">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <div class="h-4 w-16 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div class="h-8 w-24 animate-pulse rounded bg-muted" />
          </CardContent>
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
      <!-- 今日数据 -->
      <h2 class="text-sm font-medium text-muted-foreground mb-3">今日</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card size="sm">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">请求数</CardTitle>
            <Icon icon="lucide:activity" class="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">{{ data.today.requests.toLocaleString() }}</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">带宽</CardTitle>
            <Icon icon="lucide:database" class="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">{{ data.today.bandwidth }}</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">平均响应</CardTitle>
            <Icon icon="lucide:clock" class="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-foreground">{{ data.today.avg_duration_ms }}ms</div>
          </CardContent>
        </Card>
      </div>

      <!-- 月度 + 总量 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card size="sm">
          <CardHeader>
            <CardTitle class="text-sm">本月统计</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">请求数</span>
              <span class="text-sm font-medium text-foreground">{{ data.this_month.requests.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">带宽</span>
              <span class="text-sm font-medium text-foreground">{{ data.this_month.bandwidth }}</span>
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle class="text-sm">全部累计</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">请求数</span>
              <span class="text-sm font-medium text-foreground">{{ data.total.requests.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">带宽</span>
              <span class="text-sm font-medium text-foreground">{{ data.total.bandwidth }}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 状态码分布 -->
      <Card size="sm" class="mb-6">
        <CardHeader>
          <CardTitle class="text-sm">状态码分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-end gap-3 h-28">
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs font-medium text-foreground">{{ data.status_codes['2xx'].toLocaleString() }}</span>
              <div
                class="w-full rounded-t"
                :style="{ height: `${Math.max(4, (data.status_codes['2xx'] / data.total.requests) * 100)}px`, background: 'hsl(142, 71%, 45%)' }"
              />
              <span class="text-xs text-muted-foreground">2xx</span>
            </div>
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs font-medium text-foreground">{{ data.status_codes['4xx'].toLocaleString() }}</span>
              <div
                class="w-full rounded-t"
                :style="{ height: `${Math.max(4, (data.status_codes['4xx'] / data.total.requests) * 100)}px`, background: 'hsl(38, 92%, 50%)' }"
              />
              <span class="text-xs text-muted-foreground">4xx</span>
            </div>
            <div class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs font-medium text-foreground">{{ data.status_codes['5xx'].toLocaleString() }}</span>
              <div
                class="w-full rounded-t"
                :style="{ height: `${Math.max(4, (data.status_codes['5xx'] / data.total.requests) * 100)}px`, background: 'hsl(0, 72%, 51%)' }"
              />
              <span class="text-xs text-muted-foreground">5xx</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>

    <!-- 速度分析 -->
    <Card size="sm" class="mb-6">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-sm">
          <Icon icon="lucide:gauge" class="size-4 text-muted-foreground" />
          速度分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-center gap-2 mb-4">
          <span class="size-2 rounded-full bg-green-500 shrink-0" />
          <span class="text-xs text-muted-foreground">
            Vercel Speed Insights 已启用，正在采集 Web Vitals 指标 —
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              class="underline underline-offset-2 hover:text-foreground transition-colors"
            >查看详细报告</a>
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-muted-foreground flex items-center gap-1">
              <Icon icon="lucide:clock" class="size-3" />
              LCP
            </p>
            <p class="text-xs text-muted-foreground/70 mt-0.5">最大内容绘制</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground flex items-center gap-1">
              <Icon icon="lucide:move" class="size-3" />
              CLS
            </p>
            <p class="text-xs text-muted-foreground/70 mt-0.5">累积布局偏移</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground flex items-center gap-1">
              <Icon icon="lucide:zap" class="size-3" />
              INP
            </p>
            <p class="text-xs text-muted-foreground/70 mt-0.5">交互响应时间</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground flex items-center gap-1">
              <Icon icon="lucide:file-text" class="size-3" />
              FCP
            </p>
            <p class="text-xs text-muted-foreground/70 mt-0.5">首次内容绘制</p>
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

      <Card size="sm">
        <CardHeader>
          <CardTitle class="text-sm">最近动态</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground py-4 text-center">暂无动态数据</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
