<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  uptime_seconds: number;
}

const props = defineProps<Props>();

const days = computed(() => Math.floor(props.uptime_seconds / 86400));
</script>

<template>
  <Card>
    <CardContent class="flex flex-col items-center py-6">
      <div class="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon icon="lucide:clock" class="size-4" />
        <span class="text-sm">网站已运行</span>
      </div>
      <div class="flex items-baseline gap-1 transition-all duration-300">
        <span class="text-5xl font-bold text-primary tabular-nums">
          {{ days.toLocaleString() }}
        </span>
        <span class="text-2xl text-muted-foreground">天</span>
      </div>
    </CardContent>
  </Card>
</template>
