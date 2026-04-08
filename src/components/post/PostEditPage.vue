<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import MonacoMarkdownEditor from '@/components/common/MonacoMarkdownEditor.vue'
import EditorToolbar from '@/components/common/EditorToolbar.vue'
import { usePostEdit } from '@/composables/usePostEdit'
import { preprocess_markdown_image_size } from '@/utils/markdown'
import BackToTop from '@/components/common/BackToTop.vue'
import { ArrowLeft, Upload, Eye, FileText, List } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { form_data, is_preview, toggle_preview, toc, import_markdown_file, reset_form } = usePostEdit()

// Monaco 编辑器引用
const editor_ref = ref<InstanceType<typeof MonacoMarkdownEditor> | null>(null)

// Vim 模式
const vim_mode = ref(false)

// 导入文件输入
const file_input_ref = ref<HTMLInputElement | null>(null)

// 预处理后的内容（用于预览）
const preview_content = computed(() => {
  if (form_data.value.content) {
    return preprocess_markdown_image_size(form_data.value.content)
  }
  return ''
})

// 返回
function go_back() {
  router.back()
}

// 导入 Markdown 文件
function handle_import_click() {
  file_input_ref.value?.click()
}

// 处理文件选择
async function handle_file_change(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    const success = await import_markdown_file(file)
    if (!success) {
      // 非 .md 文件
      console.warn('请选择 .md 文件')
    }
  }
  // 清空 input，允许再次选择同一文件
  input.value = ''
}

// 切换预览
function handle_toggle_preview() {
  toggle_preview()
}

// 处理工具栏格式化
function handle_format(prefix: string, suffix: string) {
  editor_ref.value?.wrap_selection(prefix, suffix)
}

// 处理工具栏插入
function handle_insert(text: string) {
  editor_ref.value?.insert_text(text)
}

// 处理插入标题
function handle_insert_heading(level: number) {
  editor_ref.value?.insert_heading(level)
}

// 切换 Vim 模式
function toggle_vim_mode() {
  vim_mode.value = !vim_mode.value
}

// 初始化
onMounted(() => {
  // 如果不是编辑模式，重置表单
  if (!route.params.id) {
    reset_form()
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between px-4 py-2 rounded-lg bg-white border border-[var(--c-border)] shadow-sm">
      <!-- 返回按钮 -->
      <button
        @click="go_back"
        class="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--c-primary)] transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        返回
      </button>

      <!-- 工具按钮 -->
      <div class="flex items-center gap-2">
        <!-- 导入 .md 文件 -->
        <button
          @click="handle_import_click"
          class="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-[var(--c-primary-bg)] text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)]/70 transition-colors"
        >
          <Upload class="w-3 h-3" />
          导入 .md
        </button>
        <input
          ref="file_input_ref"
          type="file"
          accept=".md"
          class="hidden"
          @change="handle_file_change"
        />

        <!-- 预览切换 -->
        <button
          @click="handle_toggle_preview"
          class="flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors"
          :class="is_preview
            ? 'bg-[var(--c-primary)] text-white'
            : 'bg-[var(--c-primary-bg)] text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)]/70'"
        >
          <Eye class="w-3 h-3" />
          {{ is_preview ? '编辑' : '预览' }}
        </button>
      </div>
    </div>

    <!-- 编辑器 / 预览区 -->
    <div class="bg-white rounded-xl border border-[var(--c-border)] shadow-sm overflow-hidden">
      <!-- 编辑模式 -->
      <div v-show="!is_preview">
        <!-- 编辑器工具栏 -->
        <EditorToolbar
          :vim-mode="vim_mode"
          @format="handle_format"
          @insert="handle_insert"
          @insert-heading="handle_insert_heading"
          @toggle-vim="toggle_vim_mode"
        />

        <!-- Monaco 编辑器 -->
        <div class="overflow-hidden pb-3">
          <MonacoMarkdownEditor
            ref="editor_ref"
            v-model="form_data.content"
            :vim-mode="vim_mode"
            placeholder="在此输入 Markdown 内容..."
          />
        </div>
      </div>

      <!-- 预览模式 -->
      <div v-show="is_preview" class="p-6 band-markdown prose prose-slate max-w-none">
        <!-- 如果没有内容，显示提示 -->
        <div v-if="!preview_content" class="text-slate-400 text-center py-12">
          <FileText class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">暂无内容，切换到编辑模式开始撰写</p>
        </div>
        <!-- 渲染 Markdown -->
        <MarkdownRenderer v-else :content="preview_content" />
      </div>
    </div>

    <!-- 目录预览（仅在编辑模式下显示） -->
    <div v-if="!is_preview && toc.length > 0" class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
        <List class="w-3 h-3" />
        目录预览
      </h3>
      <nav class="text-xs">
        <template v-for="item in toc" :key="item.id">
          <div class="py-1 text-slate-600" :style="{ paddingLeft: `${(item.level - 1) * 8}px` }">
            {{ item.text }}
          </div>
          <template v-for="child in item.children" :key="child.id">
            <div class="py-1 text-slate-600" :style="{ paddingLeft: `${(child.level - 1) * 8}px` }">
              {{ child.text }}
            </div>
          </template>
        </template>
      </nav>
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>