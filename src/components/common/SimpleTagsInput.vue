<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  TagsInput,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
} from '@/components/ui/tags-input'
import { X } from 'lucide-vue-next'

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

const all_tags = ref<string[]>([])
const loading = ref(false)

// 当前标签列表（从逗号分隔的字符串转换）
const tags = computed({
  get: () => {
    return props.modelValue
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t)
  },
  set: (new_tags: string[]) => {
    emit('update:modelValue', new_tags.join(', '))
  },
})

// 可选的标签（未选中的）
const available_tags = computed(() => {
  return all_tags.value.filter((tag) => !tags.value.includes(tag))
})

// 加载现有标签
async function load_tags() {
  loading.value = true
  try {
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
  tags.value = [...tags.value, trimmed]
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
        class="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-primary text-primary-foreground"
      >
        {{ tag }}
        <button
          type="button"
          @click="tags = tags.filter((t) => t !== tag)"
          class="hover:bg-primary-foreground/20 rounded transition-colors"
        >
          <X class="w-3 h-3" />
        </button>
      </span>
    </div>

    <!-- 输入框 -->
    <TagsInput
      :model-value="tags"
      @update:model-value="(vals) => (tags = vals.map(String))"
      :disabled="disabled"
      class="w-full"
    >
      <TagsInputItem v-for="item in tags" :key="item" :value="item">
        <TagsInputItemText />
        <TagsInputItemDelete />
      </TagsInputItem>
      <TagsInputInput :placeholder="tags.length > 0 ? '添加更多...' : placeholder" />
    </TagsInput>

    <!-- 快捷标签 -->
    <div v-if="!disabled && available_tags.length > 0" class="flex flex-wrap gap-2">
      <span class="text-sm text-muted-foreground mr-1">快捷添加：</span>
      <button
        v-for="tag in available_tags.slice(0, 10)"
        :key="tag"
        type="button"
        @click="add_tag(tag)"
        class="px-3 py-1 text-sm rounded-lg border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        + {{ tag }}
      </button>
    </div>
  </div>
</template>
