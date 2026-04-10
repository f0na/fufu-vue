<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field'
import { Minus, Plus } from 'lucide-vue-next'

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

function handle_update(value: number | undefined) {
  if (value === undefined) {
    emit('update:modelValue', 0)
    return
  }
  let final_value = value
  if (props.min !== undefined && final_value < props.min) {
    final_value = props.min
  }
  if (props.max !== undefined && final_value > props.max) {
    final_value = props.max
  }
  emit('update:modelValue', final_value)
}
</script>

<template>
  <NumberField
    :model-value="modelValue"
    @update:model-value="handle_update"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
  >
    <NumberFieldContent>
      <NumberFieldDecrement>
        <Minus class="w-3 h-3" />
      </NumberFieldDecrement>
      <NumberFieldInput :placeholder="placeholder" />
      <NumberFieldIncrement>
        <Plus class="w-3 h-3" />
      </NumberFieldIncrement>
    </NumberFieldContent>
  </NumberField>
</template>
