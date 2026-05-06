<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  uptime_seconds: number;
}

const props = defineProps<Props>();

const parts = computed(() => {
  let s = Math.floor(props.uptime_seconds);
  const days = Math.floor(s / 86400);
  s %= 86400;
  const hours = Math.floor(s / 3600);
  s %= 3600;
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return { days, hours, minutes, seconds };
});

const display = computed(() => {
  const { days, hours, minutes, seconds } = parts.value;
  if (days > 0) return `${days}天${hours}小时${minutes}分${seconds}秒`;
  if (hours > 0) return `${hours}小时${minutes}分${seconds}秒`;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
});

const big_num = computed(() => {
  const { days, hours } = parts.value;
  return days > 0 ? days : hours > 0 ? hours : parts.value.minutes;
});

const big_unit = computed(() => {
  const { days, hours } = parts.value;
  return days > 0 ? '天' : hours > 0 ? '小时' : '分';
});
</script>

<template>
  <Card>
    <CardContent class="flex flex-col items-center py-6">
      <div class="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon icon="lucide:clock" class="size-4" />
        <span class="text-sm">网站已运行</span>
      </div>
      <div class="flex flex-col items-center transition-all duration-300">
        <div class="flex items-baseline gap-1">
          <span class="text-5xl font-bold text-primary tabular-nums">
            {{ big_num.toLocaleString() }}
          </span>
          <span class="text-2xl text-muted-foreground">{{ big_unit }}</span>
        </div>
        <span class="text-sm text-muted-foreground mt-1 tabular-nums">
          {{ display }}
        </span>
      </div>
    </CardContent>
  </Card>
</template>
