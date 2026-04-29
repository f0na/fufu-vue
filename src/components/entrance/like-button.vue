<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  initial_count?: number;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initial_count: 0,
});

const count = ref(props.initial_count);
const is_liked = ref(false);
const is_animating = ref(false);

function handle_like() {
  if (is_liked.value) return;
  is_animating.value = true;
  is_liked.value = true;
  count.value++;
  setTimeout(() => {
    is_animating.value = false;
  }, 500);
}
</script>

<template>
  <Button
    variant="outline"
    size="sm"
    @click="handle_like"
    :disabled="is_liked"
    :class="
      cn('backdrop-blur-sm gap-2', is_liked ? 'cursor-default' : 'hover:scale-105', props.class)
    "
  >
    <Icon
      icon="lucide:heart"
      :class="
        cn(
          'size-4',
          is_liked ? 'fill-destructive text-destructive' : 'text-foreground',
          is_animating ? 'animate-ping' : ''
        )
      "
    />
    <span class="font-medium">{{ count }}</span>
  </Button>
</template>
