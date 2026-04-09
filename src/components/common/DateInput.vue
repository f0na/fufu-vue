<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    disabled?: boolean
    min?: string
    max?: string
  }>(),
  {
    placeholder: '选择日期',
    disabled: false,
    min: undefined,
    max: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const is_open = ref(false)
const is_focused = ref(false)

const current_year = ref(new Date().getFullYear())
const current_month = ref(new Date().getMonth() + 1)

const has_value = computed(() => props.modelValue && props.modelValue.trim() !== '')

const display_date = computed(() => {
  if (!has_value.value) return ''
  const parts = props.modelValue.split('-')
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`
  }
  return props.modelValue
})

const selected_date = computed(() => {
  if (!has_value.value) return null
  const parts = props.modelValue.split('-')
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]),
      day: parseInt(parts[2]),
    }
  }
  return null
})

function get_days_in_month(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function get_first_day_of_month(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

const calendar_days = computed(() => {
  const days_in_month = get_days_in_month(current_year.value, current_month.value)
  const first_day = get_first_day_of_month(current_year.value, current_month.value)

  const days: Array<{ day: number; is_current: boolean; is_selected: boolean; is_today: boolean }> = []

  for (let i = 0; i < first_day; i++) {
    days.push({ day: 0, is_current: false, is_selected: false, is_today: false })
  }

  const today = new Date()
  for (let i = 1; i <= days_in_month; i++) {
    const is_today =
      current_year.value === today.getFullYear() &&
      current_month.value === today.getMonth() + 1 &&
      i === today.getDate()

    const is_selected =
      selected_date.value &&
      current_year.value === selected_date.value.year &&
      current_month.value === selected_date.value.month &&
      i === selected_date.value.day

    days.push({ day: i, is_current: true, is_selected: is_selected || false, is_today })
  }

  return days
})

const month_text = computed(() => `${current_year.value}年${current_month.value}月`)

function prev_month() {
  if (current_month.value === 1) {
    current_month.value = 12
    current_year.value--
  } else {
    current_month.value--
  }
}

function next_month() {
  if (current_month.value === 12) {
    current_month.value = 1
    current_year.value++
  } else {
    current_month.value++
  }
}

function select_day(day: number) {
  if (day === 0) return

  const date_str = `${current_year.value}-${String(current_month.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  if (props.min && date_str < props.min) return
  if (props.max && date_str > props.max) return

  emit('update:modelValue', date_str)
  is_open.value = false
}

function is_day_disabled(day: number): boolean {
  if (day === 0) return true

  const date_str = `${current_year.value}-${String(current_month.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  if (props.min && date_str < props.min) return true
  if (props.max && date_str > props.max) return true

  return false
}

function toggle_calendar() {
  if (props.disabled) return
  is_open.value = !is_open.value

  if (is_open.value && selected_date.value) {
    current_year.value = selected_date.value.year
    current_month.value = selected_date.value.month
  } else if (is_open.value) {
    current_year.value = new Date().getFullYear()
    current_month.value = new Date().getMonth() + 1
  }
}

function clear_value(event: MouseEvent) {
  event.stopPropagation()
  emit('update:modelValue', '')
}

function select_today() {
  const today = new Date()
  const date_str = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  if (props.min && date_str < props.min) return
  if (props.max && date_str > props.max) return

  emit('update:modelValue', date_str)
  is_open.value = false
}

function clear_value_fast() {
  emit('update:modelValue', '')
  is_open.value = false
}

function handle_click_outside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.date-input-wrapper')) {
    is_open.value = false
  }
}

watch(is_open, (open) => {
  if (open) {
    document.addEventListener('click', handle_click_outside)
  } else {
    document.removeEventListener('click', handle_click_outside)
  }
})

onMounted(() => {
  if (!has_value.value) {
    select_today()
  }
})
</script>

<template>
  <div class="date-input-wrapper relative" @keydown.esc="is_open = false">
    <!-- 触发按钮 -->
    <button
      type="button"
      @click="toggle_calendar"
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
      <div class="flex items-center gap-2">
        <Calendar class="w-4 h-4 shrink-0" :class="has_value ? 'text-[var(--c-primary)]' : 'text-slate-400'" />
        <span :class="has_value ? 'text-slate-700' : 'text-slate-400'">
          {{ display_date || placeholder }}
        </span>
      </div>

      <X
        v-if="has_value && !disabled"
        @click="clear_value"
        class="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      />
    </button>

    <!-- 日历弹出 -->
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
        class="absolute z-50 bottom-full mb-2 left-0 bg-white rounded-xl border border-[var(--c-border)] shadow-lg p-4 min-w-[280px]"
      >
        <!-- 月份导航 -->
        <div class="flex items-center justify-between mb-3">
          <button
            @click="prev_month"
            class="p-1.5 rounded-lg hover:bg-[var(--c-primary-bg)] transition-colors"
          >
            <ChevronLeft class="w-4 h-4 text-slate-600" />
          </button>

          <span class="text-sm font-medium text-slate-700">{{ month_text }}</span>

          <button
            @click="next_month"
            class="p-1.5 rounded-lg hover:bg-[var(--c-primary-bg)] transition-colors"
          >
            <ChevronRight class="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <!-- 星期标题 -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="text-center text-xs text-slate-500 py-1">
            {{ day }}
          </div>
        </div>

        <!-- 日期网格 -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="(item, index) in calendar_days"
            :key="index"
            type="button"
            @click="select_day(item.day)"
            :disabled="is_day_disabled(item.day)"
            class="text-sm rounded-lg transition-all text-center py-1.5 min-w-[32px]"
            :class="[
              item.day === 0 ? 'invisible' : '',
              is_day_disabled(item.day) ? 'text-slate-300 cursor-not-allowed' : '',
              item.is_selected
                ? 'bg-[var(--c-primary)] text-white shadow-sm'
                : item.is_today
                  ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)] font-medium'
                  : 'text-slate-700 hover:bg-[var(--c-primary-bg)]',
            ]"
          >
            {{ item.day || '' }}
          </button>
        </div>

        <!-- 快捷操作 -->
        <div class="flex gap-2 mt-3 pt-3 border-t border-slate-200">
          <button
            @click="select_today"
            class="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[var(--c-primary-bg)] text-[var(--c-primary)] hover:bg-[var(--c-primary)]/20 transition-colors"
          >
            今天
          </button>
          <button
            @click="clear_value_fast"
            class="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            清空
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>