<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { RouterLink } from 'vue-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const stats = ref([
  { label: '文章', value: '12', icon: 'lucide:file-text', change: '+2', trend: 'up' },
  { label: '友人', value: '8', icon: 'lucide:users', change: '0', trend: 'neutral' },
  { label: '链接', value: '15', icon: 'lucide:link', change: '+3', trend: 'up' },
  { label: '相册', value: '6', icon: 'lucide:image', change: '+1', trend: 'up' },
]);

const quick_actions = [
  { label: '写文章', icon: 'lucide:pen-square', to: '/admin/posts' },
  { label: '管理链接', icon: 'lucide:link', to: '/admin/links' },
  { label: '友人帐', icon: 'lucide:users', to: '/admin/friends' },
  { label: '系统设置', icon: 'lucide:settings', to: '/admin/settings' },
];

const recent_activities = [
  { text: '添加了友人 "喵桑"', time: '2 小时前' },
  { text: '更新了相册 "旅行日记"', time: '5 小时前' },
  { text: '删除了链接 "旧博客"', time: '1 天前' },
  { text: '发布了新文章 "网站开发笔记"', time: '2 天前' },
];
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-foreground">仪表盘</h1>
      <p class="text-sm text-muted-foreground mt-1">这是您站点的概览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card v-for="stat in stats" :key="stat.label" size="sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">{{ stat.label }}</CardTitle>
          <Icon :icon="stat.icon" class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-foreground">{{ stat.value }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            较上月
            <span :class="stat.trend === 'up' ? 'text-green-600' : ''">{{ stat.change }}</span>
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- 快捷操作 + 最近动态 -->
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
          <ul class="space-y-3">
            <li
              v-for="(activity, idx) in recent_activities"
              :key="idx"
              class="flex items-start gap-3"
            >
              <div class="size-1.5 rounded-full bg-primary/50 mt-2 shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-foreground">{{ activity.text }}</p>
                <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
