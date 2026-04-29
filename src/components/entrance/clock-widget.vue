<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  class?: string;
}

const props = defineProps<Props>();
const time = ref('00:00:00');

let interval_id: ReturnType<typeof setInterval> | null = null;

function update_time() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  time.value = `${hours}:${minutes}:${seconds}`;
}

onMounted(() => {
  update_time();
  interval_id = setInterval(update_time, 1000);
});

onUnmounted(() => {
  if (interval_id) clearInterval(interval_id);
});
</script>

<template>
  <Card size="sm" :class="props.class">
    <CardContent class="text-lg font-mono tracking-wider">
      {{ time }}
    </CardContent>
  </Card>
</template>
