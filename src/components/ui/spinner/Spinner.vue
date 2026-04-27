<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { Icon } from '@iconify/vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <Icon icon="lucide:loader-circle" role="status" aria-label="Loading" :class="cn('size-4 animate-spin', props.class)" />
</template>
