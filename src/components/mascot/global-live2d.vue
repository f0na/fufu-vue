<script setup lang="ts">
import { inject, computed } from 'vue'
import Live2DMascot from './live2d-mascot.vue'

const portal = inject<{ portal_target: any; set_portal_target?: any }>('rightSidebarPortal')

const portal_target = computed(() => portal?.portal_target?.value ?? null)
</script>

<template>
  <Teleport v-if="portal_target" :to="portal_target">
    <Live2DMascot />
  </Teleport>
</template>
