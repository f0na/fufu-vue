<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 空值的内部表示（reka-ui 不允许空字符串作为 value）
const EMPTY_VALUE = '__empty__'

interface Option {
  value: string | number
  label: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    options: Option[]
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择',
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

// 将外部值转换为内部值
function to_internal_value(val: string | number): string {
  const str = String(val)
  return str === '' ? EMPTY_VALUE : str
}

// 将内部值转换为外部值
function to_external_value(val: string): string | number {
  if (val === EMPTY_VALUE) {
    return typeof props.modelValue === 'number' ? 0 : ''
  }
  return typeof props.modelValue === 'number' ? Number(val) : val
}

function handle_update(val: AcceptableValue) {
  const str_val = String(val)
  emit('update:modelValue', to_external_value(str_val))
}
</script>

<template>
  <Select
    :model-value="to_internal_value(modelValue)"
    @update:model-value="handle_update"
    :disabled="disabled"
  >
    <SelectTrigger class="w-full">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="option in options"
        :key="option.value"
        :value="to_internal_value(option.value)"
      >
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
