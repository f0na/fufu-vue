<script setup lang="ts">
/**
 * Monaco Markdown 编辑器组件
 * 支持 Tab 缩进 4 空格、自定义快捷键、Vim 模式
 */
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
  vimMode?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

// 双向绑定
const content = useVModel(props, 'modelValue', emits)

// 编辑器引用
const editor_container = ref<HTMLDivElement | null>(null)
const is_ready = ref(false)

// Vim 模式状态
const vim_state = ref<'normal' | 'insert' | 'visual'>('normal')

// Monaco 相关
let monaco: typeof import('monaco-editor') | null = null
let editor: import('monaco-editor').editor.IStandaloneCodeEditor | null = null

// 初始化编辑器
async function init_editor() {
  if (!editor_container.value) return

  try {
    // 动态加载 Monaco
    monaco = await import('monaco-editor')

    // 定义浅色主题
    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1e293b',
        'editorLineNumber.foreground': '#fb7185',
      }
    })

    // 创建编辑器
    editor = monaco.editor.create(editor_container.value, {
      value: content.value,
      language: 'markdown',
      theme: 'custom-light',
      tabSize: 4,
      insertSpaces: true,
      wordWrap: 'on',
      lineHeight: 22,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      lineNumbersMinChars: 3,
      folding: false,
      renderLineHighlight: 'line',
      scrollbar: {
        vertical: 'hidden',
        horizontal: 'hidden',
        verticalScrollbarSize: 0,
        horizontalScrollbarSize: 0,
        alwaysConsumeMouseWheel: false,
      },
      padding: { top: 12, bottom: 12 },
      readOnly: props.disabled,
      automaticLayout: true,
    })

    // 注册自定义快捷键
    register_custom_actions()

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue() || ''
      if (value !== content.value) {
        content.value = value
      }
      // 自动调整高度
      update_editor_height()
    })

    // 监听焦点事件
    editor.onDidFocusEditorWidget(() => {
      emits('focus')
    })

    editor.onDidBlurEditorWidget(() => {
      emits('blur')
    })

    // 添加滚轮事件监听，让页面可以滚动
    editor_container.value.addEventListener('wheel', handle_wheel, { passive: false })

    // 初始化高度
    update_editor_height()

    is_ready.value = true
  } catch (error) {
    console.error('Failed to initialize Monaco editor:', error)
  }
}

// 自动调整编辑器高度
function update_editor_height() {
  if (!editor || !editor_container.value) return

  const content_height = editor.getContentHeight()

  // 防止异常值（负数或超大值）
  if (content_height <= 0 || content_height > 100000) {
    console.warn('Invalid content height:', content_height)
    return
  }

  editor_container.value.style.height = `${content_height}px`
}

// 注册自定义快捷键
function register_custom_actions() {
  if (!editor || !monaco) return

  // Ctrl/Cmd + Enter: 在下方插入新行
  editor.addAction({
    id: 'insert-line-below',
    label: '在下方插入新行',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: (ed) => {
      const position = ed.getPosition()
      if (!position) return
      const model = ed.getModel()
      if (!model) return

      const lineCount = model.getLineCount()
      const newLine = Math.min(position.lineNumber + 1, lineCount + 1)

      ed.executeEdits('', [{
        range: new monaco!.Range(newLine, 1, newLine, 1),
        text: '\n',
      }])

      ed.setPosition({ lineNumber: newLine, column: 1 })
      ed.focus()
    },
  })

  // Ctrl/Cmd + Shift + Enter: 在上方插入新行
  editor.addAction({
    id: 'insert-line-above',
    label: '在上方插入新行',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter],
    run: (ed) => {
      const position = ed.getPosition()
      if (!position) return

      ed.executeEdits('', [{
        range: new monaco!.Range(position.lineNumber, 1, position.lineNumber, 1),
        text: '\n',
      }])

      ed.setPosition({ lineNumber: position.lineNumber, column: 1 })
      ed.focus()
    },
  })

  // Ctrl/Cmd + B: 加粗
  editor.addAction({
    id: 'format-bold',
    label: '加粗',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB],
    run: (ed) => wrap_selection(ed, '**', '**'),
  })

  // Ctrl/Cmd + I: 斜体
  editor.addAction({
    id: 'format-italic',
    label: '斜体',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI],
    run: (ed) => wrap_selection(ed, '*', '*'),
  })

  // Ctrl/Cmd + K: 插入链接
  editor.addAction({
    id: 'insert-link',
    label: '插入链接',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
    run: (ed) => wrap_selection(ed, '[', '](url)'),
  })

  // Ctrl/Cmd + `: 行内代码
  editor.addAction({
    id: 'format-code',
    label: '行内代码',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backquote],
    run: (ed) => wrap_selection(ed, '`', '`'),
  })

  // Vim 模式快捷键
  if (props.vimMode) {
    setup_vim_keybindings()
  }
}

// 设置 Vim 按键
function setup_vim_keybindings() {
  if (!editor || !monaco) return

  // Escape: 返回普通模式
  editor.addCommand(monaco.KeyCode.Escape, () => {
    vim_state.value = 'normal'
  })

  // i: 进入插入模式
  editor.addAction({
    id: 'vim-insert-mode',
    label: 'Vim: 插入模式',
    keybindings: [monaco.KeyCode.KeyI],
    run: () => {
      vim_state.value = 'insert'
    },
  })
}

// 包裹选中内容
function wrap_selection(
  ed: import('monaco-editor').editor.ICodeEditor,
  prefix: string,
  suffix: string
) {
  if (!monaco) return

  const selection = ed.getSelection()
  if (!selection) return

  const model = ed.getModel()
  if (!model) return

  const selected_text = model.getValueInRange(selection)
  const new_text = prefix + selected_text + suffix

  ed.executeEdits('', [{
    range: selection,
    text: new_text,
  }])

  const start = selection.getStartPosition()
  const end = selection.getEndPosition()

  if (selected_text) {
    ed.setSelection(new monaco.Selection(
      start.lineNumber,
      start.column,
      end.lineNumber,
      end.column + prefix.length + suffix.length
    ))
  } else {
    ed.setPosition({
      lineNumber: start.lineNumber,
      column: start.column + prefix.length,
    })
  }

  ed.focus()
}

// 公开方法：插入文本
function insert_text(text: string) {
  if (!editor || !monaco) return

  const position = editor.getPosition()
  if (!position) return

  editor.executeEdits('', [{
    range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
    text,
  }])

  editor.focus()
}

// 公开方法：插入标题
function insert_heading(level: number) {
  if (!editor || !monaco) return

  const position = editor.getPosition()
  if (!position) return

  const model = editor.getModel()
  if (!model) return

  // 获取当前行的内容
  const line_content = model.getLineContent(position.lineNumber)
  const prefix = '#'.repeat(level) + ' '

  // 检查当前行是否已经有标题标记
  const heading_match = line_content.match(/^(#{1,6}\s*)/)

  if (heading_match && heading_match[1]) {
    // 替换现有的标题级别
    const new_content = prefix + line_content.slice(heading_match[1].length)
    editor.executeEdits('', [{
      range: new monaco.Range(position.lineNumber, 1, position.lineNumber, line_content.length + 1),
      text: new_content,
    }])
  } else {
    // 在行首插入标题标记
    editor.executeEdits('', [{
      range: new monaco.Range(position.lineNumber, 1, position.lineNumber, 1),
      text: prefix,
    }])
  }

  editor.focus()
}

// 公开方法：包裹选中内容
function wrap_selection_external(prefix: string, suffix: string) {
  if (editor) {
    wrap_selection(editor, prefix, suffix)
  }
}

// 公开方法：获取焦点
function focus() {
  editor?.focus()
}

// 监听外部内容变化
watch(content, (new_value) => {
  if (editor) {
    const current_value = editor.getValue()
    if (current_value !== new_value) {
      editor.setValue(new_value)
      // 延迟更新高度，确保 Monaco 完成布局计算
      requestAnimationFrame(() => {
        update_editor_height()
      })
    }
  }
})

// 监听禁用状态
watch(() => props.disabled, (disabled) => {
  if (editor) {
    editor.updateOptions({ readOnly: disabled })
  }
})

// 监听 Vim 模式变化
watch(() => props.vimMode, (enabled) => {
  if (enabled) {
    setup_vim_keybindings()
  } else {
    vim_state.value = 'normal'
  }
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    init_editor()
  })
})

onUnmounted(() => {
  // 移除滚轮事件监听
  if (editor_container.value) {
    editor_container.value.removeEventListener('wheel', handle_wheel)
  }
  editor?.dispose()
  editor = null
  monaco = null
})

// 处理滚轮事件，让页面可以滚动
function handle_wheel(e: WheelEvent) {
  // 如果按住 Ctrl，不拦截（用于缩放）
  if (e.ctrlKey) return

  // 获取父级可滚动容器
  let target = editor_container.value?.parentElement
  while (target) {
    const style = window.getComputedStyle(target)
    const overflow = style.overflow + style.overflowY
    if (/(auto|scroll)/.test(overflow)) {
      // 找到可滚动容器，让它滚动
      target.scrollTop += e.deltaY
      e.preventDefault()
      break
    }
    target = target.parentElement
  }
}

// 暴露方法
defineExpose({
  insert_text,
  insert_heading,
  wrap_selection: wrap_selection_external,
  focus,
})
</script>

<template>
  <div class="monaco-editor-wrapper">
    <div
      ref="editor_container"
      class="monaco-markdown-editor"
    />

    <!-- Vim 模式状态栏 -->
    <div
      v-if="vimMode && is_ready"
      class="vim-status-bar"
      :class="{
        'vim-status-normal': vim_state === 'normal',
        'vim-status-insert': vim_state === 'insert',
        'vim-status-visual': vim_state === 'visual',
      }"
    >
      <span class="vim-mode-indicator">
        {{ vim_state === 'normal' ? 'NORMAL' : vim_state === 'insert' ? 'INSERT' : 'VISUAL' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.monaco-editor-wrapper {
  position: relative;
  width: 100%;
}

.monaco-markdown-editor {
  width: 100%;
  min-height: 150px;
}

/* 移除所有 Monaco 默认边框和背景 */
.monaco-markdown-editor :deep(.monaco-editor),
.monaco-markdown-editor :deep(.monaco-editor .margin),
.monaco-markdown-editor :deep(.monaco-editor .monaco-editor-background),
.monaco-markdown-editor :deep(.monaco-editor .margin-view-overlays),
.monaco-markdown-editor :deep(.monaco-editor .view-overlays),
.monaco-markdown-editor :deep(.monaco-editor .lines-content) {
  background-color: #ffffff !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* 行号主题色 */
.monaco-markdown-editor :deep(.monaco-editor .line-numbers) {
  color: var(--c-primary, #fb7185) !important;
}

/* 隐藏滚动条 */
.monaco-markdown-editor :deep(.monaco-editor .monaco-scrollable-element > .scrollbar) {
  display: none !important;
}

/* Vim 状态栏样式 */
.vim-status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 12px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-top: 1px solid var(--c-border, #e2e8f0);
}

.vim-mode-indicator {
  text-transform: uppercase;
}

/* Normal 模式 - 主题色 */
.vim-status-normal {
  background: var(--c-primary-bg, #ffe4e6);
  color: var(--c-primary, #fb7185);
}

/* Insert 模式 - 蓝色 */
.vim-status-insert {
  background: #dbeafe;
  color: #2563eb;
}

/* Visual 模式 - 绿色 */
.vim-status-visual {
  background: #dcfce7;
  color: #16a34a;
}
</style>