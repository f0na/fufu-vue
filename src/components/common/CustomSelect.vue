<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

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

const is_open = ref(false)
const select_ref = ref<HTMLElement | null>(null)

const selected_option = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue)
})

function toggle_dropdown() {
  if (props.disabled) return
  is_open.value = !is_open.value
}

function select_option(option: Option) {
  emit('update:modelValue', option.value)
  is_open.value = false
}

function handle_click_outside(event: MouseEvent) {
  if (select_ref.value && !select_ref.value.contains(event.target as Node)) {
    is_open.value = false
  }
}

function handle_keydown(event: KeyboardEvent) {
  if (props.disabled) return

  if (event.key === 'Escape') {
    is_open.value = false
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggle_dropdown()
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const current_index = props.options.findIndex((opt) => opt.value === props.modelValue)
    const next_index =
      event.key === 'ArrowDown'
        ? Math.min(current_index + 1, props.options.length - 1)
        : Math.max(current_index - 1, 0)
    if (props.options[next_index]) {
      emit('update:modelValue', props.options[next_index].value)
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handle_click_outside)
})

onUnmounted(() => {
  document.removeEventListener('click', handle_click_outside)
})
</script>

<template>
  <div ref="select_ref" class="relative" @keydown="handle_keydown" tabindex="0">
    <!-- 触发器 -->
    <button
      type="button"
      @click="toggle_dropdown"
      :disabled="disabled"
      class="w-full px-4 py-3 text-sm rounded-xl border bg-white transition-all text-left flex items-center justify-between gap-2"
      :class="[
        disabled
          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
          : is_open
            ? 'border-[var(--c-primary)] ring-2 ring-[var(--c-primary)]/20'
            : 'border-slate-300 hover:border-slate-400 focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none',
      ]"
    >
      <span :class="selected_option ? 'text-slate-700' : 'text-slate-400'">
        {{ selected_option?.label || placeholder }}
      </span>
      <ChevronDown
        class="w-4 h-4 text-slate-400 transition-transform shrink-0"
        :class="{ 'rotate-180': is_open }"
      />
    </button>

    <!-- 下拉选项 -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="is_open"
        class="absolute z-50 w-full mt-2 bg-white rounded-xl border border-[var(--c-border)] shadow-lg overflow-hidden"
      >
        <button
          v-for="(option, index) in options"
          :key="option.value"
          type="button"
          @click="select_option(option)"
          class="w-full px-4 py-2.5 text-sm text-left transition-colors"
          :class="[
            option.value === modelValue
              ? 'bg-[var(--c-primary)] text-white'
              : 'text-slate-700 hover:bg-[var(--c-primary-bg)]',
            index === 0 ? 'rounded-t-xl' : '',
            index === options.length - 1 ? 'rounded-b-xl' : '',
          ]"
        >
          <div class="flex items-center justify-between">
            <span>{{ option.label }}</span>
            <Check v-if="option.value === modelValue" class="w-4 h-4" />
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>