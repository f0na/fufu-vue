<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import WaveDivider from '@/components/ui/wave-divider/WaveDivider.vue'

const IMAGE_URL = 'https://t.alcy.cc/moez'
const BASE_HEIGHT = 40
const MAX_HEIGHT = 100

const height = ref(BASE_HEIGHT)
const touch_start_y = ref(0)

function handle_wheel(e: WheelEvent) {
  if (height.value > BASE_HEIGHT && e.deltaY > 0) {
    height.value = Math.max(height.value - Math.abs(e.deltaY) * 0.3, BASE_HEIGHT)
    return
  }
  if ((window as Window).scrollY > 0) return
  if (e.deltaY < 0) {
    height.value = Math.min(height.value + Math.abs(e.deltaY) * 0.1, MAX_HEIGHT)
  }
}

function handle_touch_start(e: TouchEvent) {
  touch_start_y.value = e.touches[0]?.clientY ?? 0
}

function handle_touch_move(e: TouchEvent) {
  const current_y = e.touches[0]?.clientY ?? 0
  const delta_y = touch_start_y.value - current_y

  if (height.value > BASE_HEIGHT && delta_y < 0) {
    height.value = Math.max(height.value + delta_y * 0.1, BASE_HEIGHT)
    touch_start_y.value = current_y
    return
  }
  if ((window as Window).scrollY > 0) {
    touch_start_y.value = current_y
    return
  }
  if (delta_y > 0) {
    height.value = Math.min(height.value + delta_y * 0.1, MAX_HEIGHT)
  }
  touch_start_y.value = current_y
}

onMounted(() => {
  window.addEventListener('wheel', handle_wheel, { passive: true })
  window.addEventListener('touchstart', handle_touch_start, { passive: true })
  window.addEventListener('touchmove', handle_touch_move, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('wheel', handle_wheel)
  window.removeEventListener('touchstart', handle_touch_start)
  window.removeEventListener('touchmove', handle_touch_move)
})
</script>

<template>
  <div class="relative w-full overflow-hidden z-0" :style="{ height: `${height}vh` }">
    <img
      :src="IMAGE_URL"
      alt="Hero Background"
      class="absolute inset-0 w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
    <div class="absolute bottom-0 w-full">
      <WaveDivider :height="64" />
    </div>
  </div>
</template>
