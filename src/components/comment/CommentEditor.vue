<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import { preprocess_markdown_image_size } from '@/utils/markdown'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  maxlength?: number
  is_markdown?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:is_markdown', value: boolean): void
}>()

// 编辑模式：plain 或 markdown
const edit_mode = ref<'plain' | 'markdown'>(props.is_markdown ? 'markdown' : 'plain')

// 显示预览
const show_preview = ref(false)

// 同步内容
const content = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    content.value = value
  },
)

watch(content, (value) => {
  emit('update:modelValue', value)
})

// 同步模式
watch(edit_mode, (value) => {
  emit('update:is_markdown', value === 'markdown')
})

watch(
  () => props.is_markdown,
  (value) => {
    if (value !== undefined) {
      edit_mode.value = value ? 'markdown' : 'plain'
    }
  },
)

// 字符数统计
const char_count = computed(() => content.value.length)

// 预处理后的 Markdown 内容
const preview_content = computed(() => {
  if (edit_mode.value === 'markdown') {
    return preprocess_markdown_image_size(content.value)
  }
  return content.value
})

// 切换模式
function toggle_mode() {
  edit_mode.value = edit_mode.value === 'plain' ? 'markdown' : 'plain'
}

// 清空内容
function clear() {
  content.value = ''
  emit('update:modelValue', '')
}

// 获取 textarea 引用
const textarea_ref = ref<HTMLTextAreaElement | null>(null)

function focus() {
  textarea_ref.value?.focus()
}

defineExpose({
  clear,
  focus,
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between px-1">
      <button
        @click="toggle_mode"
        class="text-xs px-2 py-0.5 rounded transition-colors"
        :class="
          edit_mode === 'markdown'
            ? 'bg-[var(--c-primary-bg)] text-[var(--c-primary)]'
            : 'text-slate-500 hover:text-[var(--c-primary)]'
        "
      >
        {{ edit_mode === 'markdown' ? 'Markdown' : '普通文本' }}
      </button>
      <button
        @click="show_preview = !show_preview"
        class="text-xs text-slate-500 hover:text-[var(--c-primary)] transition-colors"
      >
        {{ show_preview ? '隐藏预览' : '显示预览' }}
      </button>
    </div>

    <!-- 编辑区域 -->
    <textarea
      ref="textarea_ref"
      v-model="content"
      :placeholder="placeholder || '写下你的评论...'"
      class="w-full min-h-[80px] max-h-[200px] px-3 py-2 text-sm rounded-xl border border-[var(--c-border)] bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all overflow-y-auto resize-none"
    />

    <!-- 预览区域 -->
    <div
      v-if="show_preview && content"
      class="px-3 py-2 text-sm rounded-xl border border-[var(--c-border)] bg-slate-50"
    >
      <div class="text-xs text-slate-400 mb-1">预览</div>
      <!-- Markdown 模式渲染 -->
      <markdown-renderer
        v-if="edit_mode === 'markdown'"
        :content="preview_content"
        class="comment-preview"
      />
      <!-- 普通文本模式直接显示 -->
      <div v-else class="comment-preview whitespace-pre-wrap break-words">
        {{ content }}
      </div>
    </div>

    <!-- 字数统计 -->
    <div v-if="maxlength" class="text-xs text-slate-400 text-right">
      {{ char_count }}/{{ maxlength }}
    </div>
  </div>
</template>

<style>
.comment-preview p {
  margin: 0;
  line-height: 1.6;
}

.comment-preview a {
  color: var(--c-primary);
  text-decoration: underline;
}

.comment-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}
</style>
