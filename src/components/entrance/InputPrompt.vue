<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'confirm', value: string): void
  (e: 'cancel'): void
}>()

const input_value = ref('')
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center z-[110]" @click.self="emit('cancel')">
    <div class="flex flex-col gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-lg w-72">
      <!-- 标题 -->
      <h3 class="text-lg font-bold text-slate-700">{{ title }}</h3>

      <!-- 输入框 -->
      <input
        v-model="input_value"
        type="text"
        :placeholder="placeholder || '请输入...'"
        class="w-full px-4 py-2.5 text-base rounded-lg border border-slate-300 focus:border-[var(--c-primary)] focus:outline-none"
        autofocus
        @keyup.enter="emit('confirm', input_value)"
        @keyup.escape="emit('cancel')"
      />

      <!-- 按钮 -->
      <div class="flex gap-3">
        <button @click="emit('cancel')" class="px-4 py-2 rounded-lg bg-slate-100 text-slate-600">
          取消
        </button>
        <button
          @click="emit('confirm', input_value)"
          class="flex-1 px-4 py-2 rounded-lg bg-[var(--c-primary)] text-white"
        >
          确认
        </button>
      </div>
    </div>
  </div>
</template>
