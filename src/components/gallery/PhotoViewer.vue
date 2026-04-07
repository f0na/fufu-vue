<script setup lang="ts">
import { computed } from 'vue'
import { add_auto_orient } from '@/utils/qiniu'
import { X } from 'lucide-vue-next'

interface PhotoData {
  id: string
  src: string
  x: number
  y: number
  rotation: number
  width: number
  height: number
}

const props = defineProps<{
  photo: PhotoData | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const is_visible = computed(() => props.photo !== null)

// 处理图片 URL，添加自动校正 EXIF 方向参数
const processed_src = computed(() => props.photo ? add_auto_orient(props.photo.src) : '')

function handle_close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="is_visible"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
        @click.self="handle_close"
      >
        <!-- 照片容器 -->
        <Transition name="zoom">
          <div v-if="photo" class="bg-white p-4 shadow-2xl" @click.self>
            <img
              :src="processed_src"
              :alt="`Photo ${photo.id}`"
              class="max-w-[80vw] max-h-[80vh] object-contain"
              draggable="false"
            />
          </div>
        </Transition>

        <!-- 关闭按钮 -->
        <button
          class="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full transition-colors"
          @click="handle_close"
        >
          <X class="w-6 h-6 text-white" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
</style>
