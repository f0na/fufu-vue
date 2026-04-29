import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Keybinding {
  key: string;
  command: string;
  description: string;
}

export interface EditorSettings {
  theme: 'vs' | 'vs-dark' | 'hc-black';
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
  lineNumbers: 'on' | 'off' | 'relative';
}

const default_keybindings: Keybinding[] = [
  { key: 'Ctrl+S', command: 'save', description: '保存文件' },
  { key: 'Ctrl+Z', command: 'undo', description: '撤销' },
  { key: 'Ctrl+Y', command: 'redo', description: '重做' },
  { key: 'Ctrl+F', command: 'find', description: '查找' },
  { key: 'Ctrl+H', command: 'replace', description: '替换' },
  { key: 'Alt+Up', command: 'moveLineUp', description: '上移行' },
  { key: 'Alt+Down', command: 'moveLineDown', description: '下移行' },
  { key: 'Shift+Alt+Up', command: 'copyLineUp', description: '复制行到上方' },
  { key: 'Shift+Alt+Down', command: 'copyLineDown', description: '复制行到下方' },
  { key: 'Ctrl+D', command: 'deleteLines', description: '删除行' },
  { key: 'Ctrl+`', command: 'toggleTerminal', description: '切换终端' },
];

const default_settings: EditorSettings = {
  theme: 'vs',
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'off',
  minimap: true,
  lineNumbers: 'on',
};

export const useEditorSettingsStore = defineStore('editor-settings', () => {
  const load_from_storage = <T>(key: string, default_value: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : default_value;
    } catch {
      return default_value;
    }
  };

  const keybindings = ref<Keybinding[]>(
    load_from_storage('fufu-editor-keybindings', default_keybindings)
  );
  const editor_settings = ref<EditorSettings>(
    load_from_storage('fufu-editor-settings', default_settings)
  );
  const vim_mode = ref(load_from_storage('fufu-editor-vim-mode', true));

  const keybindings_by_command = computed(() => {
    const map = new Map<string, Keybinding[]>();
    for (const kb of keybindings.value) {
      const existing = map.get(kb.command) || [];
      existing.push(kb);
      map.set(kb.command, existing);
    }
    return map;
  });

  const keybindings_by_key = computed(() => {
    const map = new Map<string, Keybinding>();
    for (const kb of keybindings.value) {
      map.set(kb.key.toLowerCase(), kb);
    }
    return map;
  });

  function save_keybindings() {
    localStorage.setItem('fufu-editor-keybindings', JSON.stringify(keybindings.value));
  }

  function save_editor_settings() {
    localStorage.setItem('fufu-editor-settings', JSON.stringify(editor_settings.value));
  }

  function save_vim_mode() {
    localStorage.setItem('fufu-editor-vim-mode', JSON.stringify(vim_mode.value));
  }

  function add_keybinding(keybinding: Keybinding) {
    keybindings.value.push(keybinding);
    save_keybindings();
  }

  function remove_keybinding(index: number) {
    keybindings.value.splice(index, 1);
    save_keybindings();
  }

  function update_keybinding(index: number, keybinding: Partial<Keybinding>) {
    Object.assign(keybindings.value[index], keybinding);
    save_keybindings();
  }

  function reset_keybindings() {
    keybindings.value = [...default_keybindings];
    save_keybindings();
  }

  function update_editor_setting<K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) {
    editor_settings.value[key] = value;
    save_editor_settings();
  }

  function reset_editor_settings() {
    editor_settings.value = { ...default_settings };
    save_editor_settings();
  }

  function toggle_vim_mode() {
    vim_mode.value = !vim_mode.value;
    save_vim_mode();
  }

  function save_editor_settings_fn() {
    save_editor_settings();
  }

  function export_settings() {
    return JSON.stringify(
      {
        keybindings: keybindings.value,
        editorSettings: editor_settings.value,
        vimMode: vim_mode.value,
      },
      null,
      2
    );
  }

  function import_settings(json: string) {
    try {
      const data = JSON.parse(json);
      if (data.keybindings) keybindings.value = data.keybindings;
      if (data.editorSettings) editor_settings.value = data.editorSettings;
      if (typeof data.vimMode === 'boolean') vim_mode.value = data.vimMode;
      save_keybindings();
      save_editor_settings();
      save_vim_mode();
      return true;
    } catch {
      return false;
    }
  }

  return {
    keybindings,
    editor_settings,
    vim_mode,
    keybindings_by_command,
    keybindings_by_key,
    add_keybinding,
    remove_keybinding,
    update_keybinding,
    reset_keybindings,
    save_editor_settings_fn,
    update_editor_setting,
    reset_editor_settings,
    toggle_vim_mode,
    export_settings,
    import_settings,
  };
});
