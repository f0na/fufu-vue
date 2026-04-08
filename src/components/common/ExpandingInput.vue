<script setup lang="ts">
import { ref, computed } from 'vue'
import type { HTMLAttributes, InputHTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
  placeholder?: string
  type?: InputHTMLAttributes['type']
  disabled?: boolean
  expandWidth?: number // 聚焦时扩展的宽度(px)
  list?: string
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
  (e: 'focus', payload: FocusEvent): void
  (e: 'blur', payload: FocusEvent): void
  (e: 'keydown', payload: KeyboardEvent): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const input_ref = ref<HTMLInputElement | null>(null)
const is_focused = ref(false)
const expand_width = computed(() => props.expandWidth ?? 280)
</script>

<template>
  <div class="relative">
    <!-- 正常状态的占位，保持布局稳定 -->
    <div :class="cn('w-full', props.class)">
      <input
        v-model="modelValue"
        :type="type || 'text'"
        :placeholder="placeholder"
        :disabled="disabled"
        :list="list"
        class="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-[var(--c-primary)] focus:outline-none placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 pointer-events-none"
        tabindex="-1"
      />
    </div>
    <!-- 实际交互的输入框，聚焦时扩展宽度 -->
    <input
      ref="input_ref"
      v-model="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      :list="list"
      data-slot="expanding-input"
      :class="cn(
        'absolute top-0 left-0',
        'px-2 py-1.5 text-sm rounded-lg',
        'border bg-white',
        'border-slate-200',
        'focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20',
        'focus:outline-none',
        'transition-all duration-300',
        'placeholder:text-slate-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'shadow-sm',
        props.class
      )"
      :style="{
        width: is_focused ? `${expand_width}px` : '100%',
        zIndex: is_focused ? 50 : 1
      }"
      @focus="(e) => { is_focused = true; emits('focus', e) }"
      @blur="(e) => { is_focused = false; emits('blur', e) }"
      @keydown="(e) => emits('keydown', e)"
    />
  </div>
</template>