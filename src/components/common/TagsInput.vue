<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

export type TagSource = 'bangumi' | 'link' | 'gallery'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    disabled?: boolean
    tagSource?: TagSource
  }>(),
  {
    placeholder: '输入标签，按回车添加',
    disabled: false,
    tagSource: 'bangumi',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const input_ref = ref<HTMLInputElement | null>(null)
const is_focused = ref(false)
const all_tags = ref<string[]>([])
const loading = ref(false)

// 当前标签列表
const tags = computed(() => {
  return props.modelValue
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter((t) => t)
})

// 可选的标签（未选中的）
const available_tags = computed(() => {
  return all_tags.value.filter((tag) => !tags.value.includes(tag))
})

// 加载现有标签
async function load_tags() {
  loading.value = true
  try {
    // 动态导入对应的 API
    if (props.tagSource === 'bangumi') {
      const { get_bangumi_info } = await import('@/api/bangumi')
      const res = await get_bangumi_info({ per_page: 100 })
      const tag_set = new Set<string>()
      res.items.forEach((item) => {
        item.tags.forEach((tag: string) => tag_set.add(tag))
      })
      all_tags.value = Array.from(tag_set).sort((a, b) => a.localeCompare(b, 'zh-CN'))
    } else if (props.tagSource === 'link') {
      const { get_links } = await import('@/api/link')
      const res = await get_links({ per_page: 100 })
      const tag_set = new Set<string>()
      res.items.forEach((item) => {
        item.tags.forEach((tag: string) => tag_set.add(tag))
      })
      all_tags.value = Array.from(tag_set).sort((a, b) => a.localeCompare(b, 'zh-CN'))
    } else if (props.tagSource === 'gallery') {
      const { fetch_galleries } = await import('@/api/gallery')
      const res = await fetch_galleries({ per_page: 100 })
      const tag_set = new Set<string>()
      res.items.forEach((item) => {
        item.tags.forEach((tag: string) => tag_set.add(tag))
      })
      all_tags.value = Array.from(tag_set).sort((a, b) => a.localeCompare(b, 'zh-CN'))
    }
  } catch (e) {
    console.error('加载标签失败:', e)
  } finally {
    loading.value = false
  }
}

// 添加标签
function add_tag(tag: string) {
  const trimmed = tag.trim()
  if (!trimmed) return

  if (tags.value.includes(trimmed)) return

  const new_tags = [...tags.value, trimmed]
  emit('update:modelValue', new_tags.join(', '))
}

// 移除标签
function remove_tag(tag: string) {
  const new_tags = tags.value.filter((t) => t !== tag)
  emit('update:modelValue', new_tags.join(', '))
}

// 处理输入
function handle_input(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

// 处理按键
function handle_keydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',' || event.key === '，') {
    event.preventDefault()
    const input = input_ref.value
    if (input) {
      const value = input.value.trim()
      if (value) {
        add_tag(value)
        input.value = ''
      }
    }
  } else if (event.key === 'Backspace') {
    const input = input_ref.value
    if (input && !input.value && tags.value.length > 0) {
      const last_tag = tags.value[tags.value.length - 1]
      if (last_tag) remove_tag(last_tag)
    }
  }
}

function handle_focus() {
  is_focused.value = true
}

function handle_blur() {
  is_focused.value = false
  // 失去焦点时清空输入框
  if (input_ref.value) {
    input_ref.value.value = ''
  }
}

onMounted(() => {
  load_tags()
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- 已选标签 -->
    <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="tag in tags"
        :key="tag"
        class="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-[var(--c-primary)] text-white"
      >
        {{ tag }}
        <button
          type="button"
          @click="remove_tag(tag)"
          class="hover:bg-white/20 rounded transition-colors"
        >
          <div class="i-lucide-x w-3 h-3" />
        </button>
      </span>
    </div>

    <!-- 输入框 -->
    <div
      class="relative flex items-center gap-2 px-4 py-2 rounded-xl border bg-white transition-all"
      :class="[
        disabled
          ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
          : is_focused
            ? 'border-[var(--c-primary)] ring-2 ring-[var(--c-primary)]/20'
            : 'border-slate-300 hover:border-slate-400',
      ]"
    >
      <input
        ref="input_ref"
        type="text"
        :placeholder="tags.length > 0 ? '添加更多标签...' : placeholder"
        :disabled="disabled"
        @input="handle_input"
        @keydown="handle_keydown"
        @focus="handle_focus"
        @blur="handle_blur"
        class="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400"
        :class="disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'"
      />
    </div>

    <!-- 快捷标签 -->
    <div v-if="!disabled && available_tags.length > 0" class="flex flex-wrap gap-2">
      <span class="text-sm text-slate-500 mr-1">快捷添加：</span>
      <button
        v-for="tag in available_tags.slice(0, 10)"
        :key="tag"
        type="button"
        @click="add_tag(tag)"
        class="px-3 py-1 text-sm rounded-lg border border-slate-300 text-slate-600 hover:border-[var(--c-primary)] hover:text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)] transition-colors"
      >
        + {{ tag }}
      </button>
    </div>
  </div>
</template>
