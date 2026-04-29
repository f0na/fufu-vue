<template>
  <div class="relative w-full h-full flex flex-col">
    <div ref="editor_container" class="flex-1 min-h-0"></div>
    <span ref="status_bar" class="vim-mount"></span>
    <div
      v-if="!editor_ready"
      class="absolute inset-0 flex flex-col items-center justify-center bg-bg text-text gap-3 z-10"
    >
      <div
        class="w-8 h-8 border-[3px] border-accent border-t-transparent rounded-full animate-spin"
      ></div>
      <span class="text-sm">加载编辑器...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import { initVimMode } from 'monaco-vim';
import type { VimAdapterInstance } from 'monaco-vim';

type VimAdapterWithObserver = VimAdapterInstance & { _modeObserver?: MutationObserver };
import { useEditorSettingsStore } from '@/admin/stores/editor-settings';
import { initialize_markdown_support } from '@/utils/languageServices';
import { init_text_mate } from '@/utils/textmate';

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

const props = defineProps<{
  value?: string;
}>();

const emit = defineEmits<{
  change: [value: string];
  'vim-status': [status: { mode: string; line: number; col: number; chars: number }];
}>();

const settings_store = useEditorSettingsStore();

const editor_container = ref<HTMLElement | null>(null);
const status_bar = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
let vim_adapter: VimAdapterInstance | null = null;
const editor_ready = ref(false);
const vim_mode_indicator = ref('NORMAL');
const cursor_line = ref(1);
const cursor_col = ref(1);
const char_count = ref(0);

const emit_vim_status = () => {
  emit('vim-status', {
    mode: vim_mode_indicator.value,
    line: cursor_line.value,
    col: cursor_col.value,
    chars: char_count.value,
  });
};

const update_vim_status = () => {
  if (!editor) return;
  const pos = editor.getPosition();
  cursor_line.value = pos.lineNumber;
  cursor_col.value = pos.column;
  const model = editor.getModel();
  if (model) {
    char_count.value = model.getValueLength();
  }
  emit_vim_status();
};

const update_mode_indicator_from_status_bar = () => {
  if (!status_bar.value) return;
  const mode_info_node = status_bar.value.querySelector('span');
  const text = mode_info_node?.textContent || status_bar.value.textContent || '';
  if (text.includes('--INSERT--')) {
    vim_mode_indicator.value = 'INSERT';
  } else if (text.includes('--VISUAL LINE--')) {
    vim_mode_indicator.value = 'V-LINE';
  } else if (text.includes('--VISUAL BLOCK--')) {
    vim_mode_indicator.value = 'V-BLOCK';
  } else if (text.includes('--VISUAL--')) {
    vim_mode_indicator.value = 'VISUAL';
  } else if (text.includes('--REPLACE--')) {
    vim_mode_indicator.value = 'REPLACE';
  } else if (text.includes('--NORMAL--') || text.trim() === '') {
    vim_mode_indicator.value = 'NORMAL';
  }
  emit_vim_status();
};

const update_mode_indicator = (mode: string) => {
  if (mode === 'insert') vim_mode_indicator.value = 'INSERT';
  else if (mode === 'visual') vim_mode_indicator.value = 'VISUAL';
  else if (mode === 'visual-line') vim_mode_indicator.value = 'V-LINE';
  else if (mode === 'visual-block') vim_mode_indicator.value = 'V-BLOCK';
  else if (mode === 'replace') vim_mode_indicator.value = 'REPLACE';
  else vim_mode_indicator.value = 'NORMAL';
  emit_vim_status();
};

const init_editor = async () => {
  if (!editor_container.value) return;

  initialize_markdown_support();

  editor = monaco.editor.create(editor_container.value, {
    value: props.value || '',
    language: 'markdown',
    theme: settings_store.editor_settings.theme,
    fontSize: settings_store.editor_settings.fontSize,
    tabSize: settings_store.editor_settings.tabSize,
    wordWrap: settings_store.editor_settings.wordWrap,
    minimap: { enabled: settings_store.editor_settings.minimap },
    lineNumbers: settings_store.editor_settings.lineNumbers,
    automaticLayout: true,
    scrollbar: { vertical: 'hidden', horizontal: 'hidden', alwaysConsumeMouseWheel: false },
    scrollBeyondLastColumn: false,
    renderWhitespace: 'selection',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    readOnly: false,
    domReadOnly: false,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
    suggestOnTriggerCharacters: true,
    quickSuggestionsDelay: 10,
  });

  editor.onDidChangeModelContent(() => {
    emit('change', editor?.getValue() || '');
  });

  editor.onDidChangeCursorPosition(() => {
    update_vim_status();
    if (settings_store.vim_mode) {
      update_mode_indicator_from_status_bar();
    }
  });

  if (settings_store.vim_mode && editor && status_bar.value) {
    vim_adapter = initVimMode(editor, status_bar.value);

    vim_adapter.on('vim-mode-change', update_mode_indicator);

    const observer = new MutationObserver(() => {
      nextTick(() => update_mode_indicator_from_status_bar());
    });
    observer.observe(status_bar.value, { childList: true, subtree: true, characterData: true });
    (vim_adapter as VimAdapterWithObserver)._modeObserver = observer;

    await new Promise((resolve) => setTimeout(resolve, 100));
    update_mode_indicator_from_status_bar();
  }

  editor_ready.value = true;
  update_vim_status();
};

watch(
  () => settings_store.editor_settings,
  (new_settings) => {
    if (!editor) return;
    editor.updateOptions({
      theme: new_settings.theme,
      fontSize: new_settings.fontSize,
      tabSize: new_settings.tabSize,
      wordWrap: new_settings.wordWrap,
      minimap: { enabled: new_settings.minimap },
      lineNumbers:
        new_settings.lineNumbers === 'on'
          ? 'on'
          : new_settings.lineNumbers === 'off'
            ? 'off'
            : 'relative',
    });
  },
  { deep: true }
);

watch(
  () => props.value,
  (new_value) => {
    if (!editor || editor.getValue() === new_value) return;
    editor.setValue(new_value || '');
  }
);

watch(
  () => settings_store.vim_mode,
  async (enabled) => {
    if (!editor) return;
    if (enabled && !vim_adapter) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (status_bar.value) {
        vim_adapter = initVimMode(editor, status_bar.value);
        update_mode_indicator('normal');
      }
    } else if (!enabled && vim_adapter) {
      vim_adapter.dispose();
      vim_adapter = null;
      vim_mode_indicator.value = 'NORMAL';
      emit_vim_status();
    }
  }
);

const set_value = (value: string) => {
  if (editor && editor.getValue() !== value) editor.setValue(value);
};

const get_value = (): string => editor?.getValue() || '';

defineExpose({ set_value, get_value });

onMounted(() => {
  init_text_mate();
  init_editor();
});

onBeforeUnmount(() => {
  if (vim_adapter) {
    if ((vim_adapter as VimAdapterWithObserver)._modeObserver) {
      (vim_adapter as VimAdapterWithObserver)._modeObserver.disconnect();
    }
    vim_adapter.dispose();
    vim_adapter = null;
  }
  if (editor) {
    editor.dispose();
    editor = null;
  }
});
</script>

<style scoped>
.vim-mount,
.vim-mount * {
  display: none !important;
}
</style>
