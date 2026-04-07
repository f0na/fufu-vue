<script setup lang="ts">
import { ref } from 'vue'

interface ConfirmOptions {
  title?: string
  message: string
  confirm_text?: string
  cancel_text?: string
  danger?: boolean
}

const visible = ref(false)
const options = ref<ConfirmOptions>({
  message: '',
})
const resolve_ref = ref<((value: boolean) => void) | null>(null)

function show(opts: ConfirmOptions): Promise<boolean> {
  options.value = {
    title: opts.title || '确认',
    message: opts.message,
    confirm_text: opts.confirm_text || '确认',
    cancel_text: opts.cancel_text || '取消',
    danger: opts.danger ?? true,
  }
  visible.value = true
  return new Promise((resolve) => {
    resolve_ref.value = resolve
  })
}

function handle_confirm() {
  visible.value = false
  resolve_ref.value?.(true)
  resolve_ref.value = null
}

function handle_cancel() {
  visible.value = false
  resolve_ref.value?.(false)
  resolve_ref.value = null
}

defineExpose({
  show,
})
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center z-[100]"
  >
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-lg w-72 max-w-[90vw]">
      <h3 class="text-slate-800 font-bold text-center mb-2">
        {{ options.title }}
      </h3>
      <p class="text-slate-600 text-sm text-center mb-4">
        {{ options.message }}
      </p>
      <div class="flex gap-3">
        <button
          @click="handle_cancel"
          class="flex-1 px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg"
        >
          {{ options.cancel_text }}
        </button>
        <button
          @click="handle_confirm"
          :class="[
            'flex-1 px-4 py-2 rounded-lg text-white',
            options.danger ? 'bg-red-500' : 'bg-[var(--c-primary)]',
          ]"
        >
          {{ options.confirm_text }}
        </button>
      </div>
    </div>
  </div>
</template>