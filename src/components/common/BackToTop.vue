<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    threshold?: number
    bottom?: string
    right?: string
  }>(),
  {
    threshold: 300,
    bottom: '2rem',
    right: '2rem',
  },
)

const show_button = ref(false)

function check_scroll() {
  show_button.value = window.scrollY > props.threshold
}

function scroll_to_top() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  window.addEventListener('scroll', check_scroll, { passive: true })
  check_scroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', check_scroll)
})
</script>

<template>
  <Transition name="fade">
    <button
      v-if="show_button"
      @click="scroll_to_top"
      class="fixed z-50 w-10 h-10 rounded-full bg-[var(--c-primary)] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      :style="{ bottom: bottom, right: right }"
    >
      <ArrowUp class="w-5 h-5" />
    </button>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>