<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20">
    <Icon icon="lucide:construction" class="size-12 text-muted-foreground mb-4" />
    <h2 class="text-lg font-medium text-foreground mb-2">页面开发中</h2>
    <p class="text-sm text-muted-foreground">{{ route.path }} — 此功能尚未实现</p>
  </div>
</template>
