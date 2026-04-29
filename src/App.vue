<script setup lang="ts">
import { RouterView } from 'vue-router';
import { provide, ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { Icon } from '@iconify/vue';
import Sonner from '@/components/ui/sonner/Sonner.vue';
import { RightSidebarPortalKey } from '@/context/right-sidebar-portal';

const GlobalLive2D = defineAsyncComponent(() => import('@/components/mascot/global-live2d.vue'));

const portal_target = ref<HTMLElement | null>(null);

function set_portal_target(target: HTMLElement | null) {
  portal_target.value = target;
}

provide(RightSidebarPortalKey, { portal_target, set_portal_target });

const show_scroll_top = ref(false);

function on_scroll() {
  show_scroll_top.value = window.scrollY > 300;
}

function scroll_to_top() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', on_scroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', on_scroll);
});
</script>

<template>
  <div class="min-h-full flex flex-col">
    <RouterView />
    <GlobalLive2D />
    <Sonner position="top-center" rich-colors />

    <!-- 回到顶部 -->
    <Transition name="scroll-top">
      <button
        v-if="show_scroll_top"
        class="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        @click="scroll_to_top"
        aria-label="回到顶部"
      >
        <Icon icon="lucide:arrow-up" class="size-5" />
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.scroll-top-enter-active,
.scroll-top-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
