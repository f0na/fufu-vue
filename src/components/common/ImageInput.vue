<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    disabled?: boolean
    type?: 'avatar' | 'cover' | 'photo' | 'general'
  }>(),
  {
    placeholder: '输入图片URL',
    disabled: false,
    type: 'general',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'fileSelected', file: File | null): void
}>()

const input_ref = ref<HTMLInputElement | null>(null)
const file_input_ref = ref<HTMLInputElement | null>(null)
const is_focused = ref(false)
const selected_file = ref<File | null>(null)
const local_preview_url = ref<string | null>(null)
const image_error = ref(false)

// 当前预览 URL（本地或远程）
const preview_url = computed(() => {
  if (local_preview_url.value) return local_preview_url.value
  if (props.modelValue && !image_error.value) return props.modelValue
  return null
})

// 监听 modelValue 变化，重置错误状态和本地预览
watch(
  () => props.modelValue,
  (new_val) => {
    image_error.value = false
    if (new_val) {
      // 有远程 URL 时清除本地预览
      clear_local_preview()
    }
  },
)

// 处理URL输入
function handle_input(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  image_error.value = false
  clear_local_preview()
}

// 触发文件选择
function trigger_file_select() {
  file_input_ref.value?.click()
}

// 选择文件（仅预览，不上传）
function handle_file_select(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    target.value = ''
    emit('fileSelected', null)
    return
  }

  // 清除旧的本地预览
  if (local_preview_url.value) {
    URL.revokeObjectURL(local_preview_url.value)
  }

  // 保存文件并生成本地预览
  selected_file.value = file
  local_preview_url.value = URL.createObjectURL(file)
  // 清除远程 URL
  emit('update:modelValue', '')
  emit('fileSelected', file)
}

// 清除本地预览
function clear_local_preview() {
  if (local_preview_url.value) {
    URL.revokeObjectURL(local_preview_url.value)
  }
  local_preview_url.value = null
  selected_file.value = null
  if (file_input_ref.value) {
    file_input_ref.value.value = ''
  }
  emit('fileSelected', null)
}

// 清除所有
function clear_all() {
  emit('update:modelValue', '')
  clear_local_preview()
  image_error.value = false
}

// 图片加载失败
function handle_image_error() {
  image_error.value = true
}

function handle_focus() {
  is_focused.value = true
}

function handle_blur() {
  is_focused.value = false
}

// 暴露待上传文件供父组件使用
defineExpose({
  pendingFile: selected_file,
  clearLocalPreview: clear_local_preview,
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- 图片预览 -->
    <div class="relative group">
      <!-- 有图片时显示预览 -->
      <div
        v-if="preview_url"
        class="relative w-32 aspect-[3/4] rounded-xl overflow-hidden border border-slate-300 bg-slate-50"
      >
        <img
          :src="preview_url"
          alt="预览"
          class="w-full h-full object-cover"
          @error="handle_image_error"
        />
        <!-- 清除按钮 -->
        <button
          type="button"
          @click="clear_all"
          class="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          <div class="i-lucide-x w-3 h-3" />
        </button>
      </div>
      <!-- 无图片时的占位 -->
      <div
        v-else
        class="w-32 aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-400"
      >
        <div class="i-lucide-image w-6 h-6" />
        <span class="text-xs">暂无图片</span>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="flex items-center gap-2">
      <input
        ref="input_ref"
        type="url"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handle_input"
        @focus="handle_focus"
        @blur="handle_blur"
        class="flex-1 px-4 py-3 text-sm rounded-xl border bg-white transition-all"
        :class="[
          disabled
            ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            : is_focused
              ? 'border-[var(--c-primary)] ring-2 ring-[var(--c-primary)]/20 outline-none'
              : 'border-slate-300 hover:border-slate-400 focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none',
        ]"
      />
      <button
        type="button"
        @click="trigger_file_select"
        :disabled="disabled"
        class="px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:opacity-50 shrink-0"
        title="选择文件"
      >
        <div class="i-lucide-image-plus w-4 h-4" />
      </button>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="file_input_ref"
      type="file"
      accept="image/*"
      :disabled="disabled"
      @change="handle_file_select"
      class="hidden"
    />
  </div>
</template>