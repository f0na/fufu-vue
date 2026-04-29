<script setup lang="ts">
import { inject, computed } from 'vue';
import Live2DMascot from './live2d-mascot.vue';
import { RightSidebarPortalKey } from '@/context/right-sidebar-portal';
import type { RightSidebarPortalValue } from '@/context/right-sidebar-portal';

const portal = inject<RightSidebarPortalValue>(RightSidebarPortalKey);

const portal_target = computed(() => portal?.portal_target?.value ?? null);
</script>

<template>
  <Teleport v-if="portal_target" :to="portal_target">
    <Live2DMascot />
  </Teleport>
</template>
