<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { Icon } from '@iconify/vue';
import { cn } from '@/lib/utils';
import { Button } from '@/admin/components/ui/button';
import { useSidebar } from './utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();

const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon-sm"
    :class="cn('', props.class)"
    @click="toggleSidebar"
  >
    <Icon icon="lucide:panel-left" class="cn-rtl-flip" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
