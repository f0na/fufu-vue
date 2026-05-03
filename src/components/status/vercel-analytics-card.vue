<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@iconify/vue';

const metrics = [
  { label: '页面浏览量', desc: '实时追踪各页面访问次数', icon: 'lucide:eye' },
  { label: '访客数', desc: '统计独立访客与回访', icon: 'lucide:users' },
  { label: '来源分析', desc: '识别流量来源渠道', icon: 'lucide:git-branch' },
  { label: '访问路径', desc: '记录用户浏览行为', icon: 'lucide:route' },
];
</script>

<template>
  <Card size="sm">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-base">
        <Icon icon="lucide:bar-chart-3" class="size-4 text-muted-foreground" />
        网站分析
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="flex items-center gap-2 mb-4">
        <span class="size-2 rounded-full bg-green-500 shrink-0" />
        <span class="text-xs text-muted-foreground">
          Vercel Analytics 已启用 —
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-2 hover:text-foreground transition-colors"
          >查看详细数据</a>
        </span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="m in metrics" :key="m.label">
          <p class="text-xs text-muted-foreground flex items-center gap-1">
            <Icon :icon="m.icon" class="size-3" />
            {{ m.label }}
          </p>
          <p class="text-xs text-muted-foreground/70 mt-0.5">
            {{ m.desc }}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
