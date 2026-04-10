<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  defaultValue?: string | number
  modelValue?: string | number
  placeholder?: string
  minRows?: number
  maxRows?: number
  expandWidth?: number // 聚焦时扩展的宽度(px)
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

const textarea_ref = ref<HTMLTextAreaElement | null>(null)
const is_focused = ref(false)

// 行数配置
const min_rows = computed(() => props.minRows ?? 2)
const max_rows = computed(() => props.maxRows ?? 6)
const expand_width = computed(() => props.expandWidth ?? 320)

// 自动调整高度以适应内容（但不超过最大行数）
function auto_resize() {
  if (!textarea_ref.value) return

  const textarea = textarea_ref.value
  textarea.style.height = 'auto'

  const line_height = parseInt(getComputedStyle(textarea).lineHeight) || 20
  const padding =
    parseInt(getComputedStyle(textarea).paddingTop) +
      parseInt(getComputedStyle(textarea).paddingBottom) || 0

  const content_lines = Math.ceil(textarea.scrollHeight / line_height)
  const target_lines = Math.min(content_lines, is_focused.value ? max_rows.value : min_rows.value)

  const target_height = target_lines * line_height + padding
  textarea.style.height = `${target_height}px`
}

function handle_focus(e: FocusEvent) {
  is_focused.value = true
  emits('focus', e)
  nextTick(() => auto_resize())
}

function handle_blur(e: FocusEvent) {
  is_focused.value = false
  emits('blur', e)
  nextTick(() => auto_resize())
}

function handle_keydown(e: KeyboardEvent) {
  emits('keydown', e)
}

// 监听内容变化自动调整
watch(modelValue, () => {
  nextTick(() => auto_resize())
})

// 挂载时初始化
onMounted(() => {
  nextTick(() => auto_resize())
})
</script>

<template>
  <div class="relative">
    <!-- 正常状态的占位，保持布局稳定 -->
    <div :class="cn('w-full', props.class)">
      <textarea
        :placeholder="placeholder"
        :rows="min_rows"
        class="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white resize-none overflow-hidden placeholder:text-slate-400 opacity-0 pointer-events-none"
        tabindex="-1"
      />
    </div>
    <!-- 实际交互的 textarea，聚焦时扩展宽度 -->
    <textarea
      ref="textarea_ref"
      v-model="modelValue"
      :placeholder="placeholder"
      data-slot="expanding-textarea"
      :class="
        cn(
          'absolute top-0 left-0',
          'px-2 py-1.5 text-sm rounded-lg',
          'border bg-white',
          'border-slate-200',
          'focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20',
          'focus:outline-none',
          'transition-all duration-300',
          'resize-none overflow-hidden',
          'placeholder:text-slate-400',
          'shadow-sm',
        )
      "
      :style="{
        width: is_focused ? `${expand_width}px` : '100%',
        zIndex: is_focused ? 50 : 1,
      }"
      @focus="handle_focus"
      @blur="handle_blur"
      @keydown="handle_keydown"
      @input="auto_resize"
    />
  </div>
</template>
