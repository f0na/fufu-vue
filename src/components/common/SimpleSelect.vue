<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

function handle_update(val: AcceptableValue) {
  const str_val = String(val)
  emit('update:modelValue', typeof props.modelValue === 'number' ? Number(str_val) : str_val)
}
</script>

<template>
  <Select
    :model-value="String(modelValue)"
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
        :value="String(option.value)"
      >
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>