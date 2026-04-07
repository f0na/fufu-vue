<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    min: undefined,
    max: undefined,
    step: 1,
    placeholder: '',
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const input_ref = ref<HTMLInputElement | null>(null)
const is_focused = ref(false)

// 格式化显示值
const display_value = computed(() => {
  if (props.modelValue === 0 || props.modelValue) {
    return props.modelValue
  }
  return ''
})

// 更新值
function update_value(new_value: number) {
  let value = new_value

  if (props.min !== undefined && value < props.min) {
    value = props.min
  }
  if (props.max !== undefined && value > props.max) {
    value = props.max
  }

  // 限制小数位数为1位
  value = Math.round(value * 10) / 10

  emit('update:modelValue', value)
}

// 输入事件
function handle_input(event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)

  if (isNaN(value)) {
    emit('update:modelValue', 0)
  } else {
    update_value(value)
  }
}

// 滚轮事件
function handle_wheel(event: WheelEvent) {
  if (props.disabled || !is_focused.value) return

  event.preventDefault()

  const delta = event.deltaY > 0 ? -props.step : props.step
  const current = props.modelValue || 0
  update_value(current + delta)
}

// 聚焦时选中内容
function handle_focus() {
  is_focused.value = true
  if (input_ref.value) {
    input_ref.value.select()
  }
}

function handle_blur() {
  is_focused.value = false
}

// 键盘上下箭头
function handle_keydown(event: KeyboardEvent) {
  if (props.disabled) return

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    const current = props.modelValue || 0
    update_value(current + props.step)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    const current = props.modelValue || 0
    update_value(current - props.step)
  }
}
</script>

<template>
  <input
    ref="input_ref"
    type="number"
    :value="display_value"
    :min="min"
    :max="max"
    :step="step"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="handle_input"
    @wheel="handle_wheel"
    @focus="handle_focus"
    @blur="handle_blur"
    @keydown="handle_keydown"
    class="w-full px-4 py-3 text-sm rounded-xl border bg-white transition-all"
    :class="[
      disabled
        ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
        : is_focused
          ? 'border-[var(--c-primary)] ring-2 ring-[var(--c-primary)]/20 outline-none'
          : 'border-slate-300 hover:border-slate-400 focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none',
    ]"
  />
</template>
