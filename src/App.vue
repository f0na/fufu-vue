<script setup lang="ts">
import { RouterView } from 'vue-router'
import { provide, ref, defineAsyncComponent } from 'vue'

const GlobalLive2D = defineAsyncComponent(() => import('@/components/mascot/global-live2d.vue'))

const portal_target = ref<HTMLElement | null>(null)

function set_portal_target(target: HTMLElement | null) {
  portal_target.value = target
}

provide('rightSidebarPortal', { portal_target, set_portal_target })
</script>

<template>
  <div class="min-h-full flex flex-col">
    <RouterView />
    <GlobalLive2D />
  </div>
</template>
