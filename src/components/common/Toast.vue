<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'

const { toasts, remove_toast } = useToast()

// 类型对应的样式
const type_styles = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-rose-500 text-white',
  info: 'bg-sky-500 text-white',
  warning: 'bg-amber-500 text-white',
}

// 类型对应的图标
const type_icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}
</script>

<template>
  <teleport to="body">
    <div class="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
      <div class="flex flex-col items-center gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg pointer-events-auto animate-fade-in"
          :class="type_styles[toast.type]"
        >
          <component :is="type_icons[toast.type]" class="w-4 h-4" />
          <span class="text-sm font-medium">{{ toast.message }}</span>
          <button
            @click="remove_toast(toast.id)"
            class="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>