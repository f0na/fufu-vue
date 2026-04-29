<template>
  <div class="flex flex-col h-full bg-bg text-text">
    <div class="px-5 py-4 border-b border-border">
      <h2 class="text-lg font-semibold text-text">设置</h2>
    </div>

    <div class="flex-1 overflow-y-auto p-5">
      <!-- Vim 模式 -->
      <section class="mb-6 pb-6 border-b border-border">
        <h3 class="mb-4 text-sm font-semibold text-text">Vim 模式</h3>
        <label class="flex items-center gap-2.5 cursor-pointer text-[13px]">
          <input
            type="checkbox"
            :checked="settings_store.vim_mode"
            @change="settings_store.toggle_vim_mode()"
            class="w-4 h-4 cursor-pointer accent-accent"
          />
          启用 Vim 模式
        </label>
      </section>

      <!-- 编辑器设置 -->
      <section class="mb-6 pb-6 border-b border-border">
        <h3 class="mb-4 text-sm font-semibold text-text">编辑器设置</h3>

        <div class="flex justify-between items-center mb-3 gap-4">
          <label class="shrink-0 text-[13px]">主题</label>
          <Select v-model="theme" @update:model-value="update_theme">
            <SelectTrigger class="flex-1 max-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="o in [
                  { v: 'vs', l: 'Light (vs)' },
                  { v: 'vs-dark', l: 'Dark (vs-dark)' },
                  { v: 'hc-black', l: '高对比度 (hc-black)' },
                ]"
                :key="o.v"
                :value="o.v"
              >
                <SelectItemText>{{ o.l }}</SelectItemText>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex justify-between items-center mb-3 gap-4">
          <label class="shrink-0 text-[13px]">字体大小</label>
          <input
            type="number"
            v-model.number="settings_store.editor_settings.fontSize"
            @change="save_settings_fn"
            min="8"
            max="72"
            class="flex-1 max-w-[200px] py-1.5 px-2.5 bg-bg-hover border border-border-light rounded text-text text-[13px]"
          />
        </div>

        <div class="flex justify-between items-center mb-3 gap-4">
          <label class="shrink-0 text-[13px]">Tab 大小</label>
          <input
            type="number"
            v-model.number="settings_store.editor_settings.tabSize"
            @change="save_settings_fn"
            min="1"
            max="8"
            class="flex-1 max-w-[200px] py-1.5 px-2.5 bg-bg-hover border border-border-light rounded text-text text-[13px]"
          />
        </div>

        <div class="flex justify-between items-center mb-3 gap-4">
          <label class="shrink-0 text-[13px]">自动换行</label>
          <Select
            v-model="settings_store.editor_settings.wordWrap"
            @update:model-value="save_settings_fn"
          >
            <SelectTrigger class="flex-1 max-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on">
                <SelectItemText>开启</SelectItemText>
              </SelectItem>
              <SelectItem value="off">
                <SelectItemText>关闭</SelectItemText>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex justify-between items-center mb-3 gap-4">
          <label class="shrink-0 text-[13px]">缩略图</label>
          <input
            type="checkbox"
            :checked="settings_store.editor_settings.minimap"
            @change="update_minimap"
            class="w-4 h-4 cursor-pointer accent-accent"
          />
        </div>

        <div class="flex justify-between items-center mb-3 gap-4">
          <label class="shrink-0 text-[13px]">行号</label>
          <Select
            v-model="settings_store.editor_settings.lineNumbers"
            @update:model-value="save_settings_fn"
          >
            <SelectTrigger class="flex-1 max-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on">
                <SelectItemText>开启</SelectItemText>
              </SelectItem>
              <SelectItem value="off">
                <SelectItemText>关闭</SelectItemText>
              </SelectItem>
              <SelectItem value="relative">
                <SelectItemText>相对行号</SelectItemText>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button
          class="w-full py-2 px-4 bg-bg-input rounded text-text text-[13px] cursor-pointer border-none hover:bg-border-light"
          @click="reset_editor_settings"
        >
          重置编辑器设置
        </button>
      </section>

      <!-- 快捷键 -->
      <section class="mb-6 pb-6 border-b border-border">
        <h3 class="mb-4 text-sm font-semibold text-text">快捷键</h3>

        <div class="flex flex-col gap-2 mb-4">
          <div
            v-for="(kb, index) in settings_store.keybindings"
            :key="index"
            class="flex items-center gap-3 px-3 py-2 rounded text-[13px]"
            :class="editing_index === index ? 'bg-bg-hover ring-1 ring-border' : 'even:bg-bg-alt'"
          >
            <span class="font-semibold min-w-[120px] text-text">{{ kb.command }}</span>
            <span class="flex-1 text-text-dim text-xs">{{ kb.description }}</span>

            <template v-if="editing_index === index">
              <input
                ref="key_input"
                type="text"
                :value="editing_key"
                @keydown.prevent="capture_key"
                @blur="cancel_edit"
                placeholder="按任意键组合..."
                class="flex-1 py-1.5 px-2.5 bg-bg-hover border border-border-light rounded text-text font-mono text-[13px]"
              />
              <div class="flex gap-2">
                <button
                  class="py-1 px-3 bg-accent text-white rounded text-xs cursor-pointer border-none"
                  @click="save_edit(index)"
                >
                  保存
                </button>
                <button
                  class="py-1 px-3 bg-bg-input text-text rounded text-xs cursor-pointer border-none"
                  @click="cancel_edit"
                >
                  取消
                </button>
              </div>
            </template>

            <template v-else>
              <span
                class="font-mono bg-key-bg px-2 py-1 rounded text-[13px] cursor-pointer border border-key-border hover:bg-bg-hover"
                @click="start_edit(index, kb)"
                >{{ kb.key }}</span
              >
              <button
                class="bg-transparent border-none text-danger cursor-pointer text-lg px-2 py-1 opacity-70 hover:opacity-100"
                @click="delete_keybinding(index)"
              >
                &times;
              </button>
            </template>
          </div>
        </div>

        <!-- 添加快捷键 -->
        <div class="bg-bg-hover p-4 rounded mb-4">
          <h4 class="mb-3 text-[13px] font-semibold text-text">添加自定义快捷键</h4>
          <div class="flex justify-between items-center mb-3 gap-4">
            <label class="shrink-0 text-[13px]">按键</label>
            <input
              ref="new_key_input"
              type="text"
              v-model="new_keybinding.key"
              @keydown.prevent="capture_new_key"
              placeholder="按任意键组合..."
              readonly
              class="flex-1 max-w-[200px] py-1.5 px-2.5 bg-bg-hover border border-border-light rounded text-text font-mono text-[13px] cursor-pointer"
            />
          </div>
          <div class="flex justify-between items-center mb-3 gap-4">
            <label class="shrink-0 text-[13px]">命令</label>
            <input
              type="text"
              v-model="new_keybinding.command"
              placeholder="例如：save, undo, redo"
              class="flex-1 max-w-[200px] py-1.5 px-2.5 bg-bg-hover border border-border-light rounded text-text text-[13px]"
            />
          </div>
          <div class="flex justify-between items-center mb-3 gap-4">
            <label class="shrink-0 text-[13px]">描述</label>
            <input
              type="text"
              v-model="new_keybinding.description"
              placeholder="快捷键描述"
              class="flex-1 max-w-[200px] py-1.5 px-2.5 bg-bg-hover border border-border-light rounded text-text text-[13px]"
            />
          </div>
          <button
            class="py-2 px-4 bg-accent text-white rounded text-[13px] cursor-pointer border-none hover:bg-accent-hover"
            @click="add_keybinding"
          >
            添加快捷键
          </button>
        </div>

        <button
          class="w-full py-2 px-4 bg-bg-input rounded text-text text-[13px] cursor-pointer border-none hover:bg-border-light"
          @click="settings_store.reset_keybindings()"
        >
          重置为默认快捷键
        </button>
      </section>

      <!-- 导入导出 -->
      <section class="mb-6 pb-6">
        <h3 class="mb-4 text-sm font-semibold text-text">导入/导出配置</h3>
        <div class="flex gap-3 mb-3">
          <button
            class="py-2 px-4 bg-accent text-white rounded text-[13px] cursor-pointer border-none hover:bg-accent-hover"
            @click="export_settings_fn"
          >
            导出配置
          </button>
          <button
            class="py-2 px-4 bg-accent text-white rounded text-[13px] cursor-pointer border-none hover:bg-accent-hover"
            @click="show_import = true"
          >
            导入配置
          </button>
        </div>

        <textarea
          v-if="show_import"
          v-model="import_text"
          placeholder="粘贴配置 JSON..."
          class="w-full min-h-[150px] p-3 bg-bg-hover border border-border-light rounded text-text font-mono text-xs resize-y"
        ></textarea>
        <div v-if="show_import" class="flex gap-3 mt-3">
          <button
            class="py-2 px-4 bg-accent text-white rounded text-[13px] cursor-pointer border-none hover:bg-accent-hover"
            @click="import_settings_fn"
          >
            确认导入
          </button>
          <button
            class="py-2 px-4 bg-bg-input text-text rounded text-[13px] cursor-pointer border-none hover:bg-border-light"
            @click="show_import = false"
          >
            取消
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useEditorSettingsStore } from '@/admin/stores/editor-settings';
import type { Keybinding } from '@/admin/stores/editor-settings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@/admin/components/ui/select';

const settings_store = useEditorSettingsStore();
const theme = ref(settings_store.editor_settings.theme);

const update_theme = () => settings_store.update_editor_setting('theme', theme.value);
const update_minimap = () =>
  settings_store.update_editor_setting('minimap', !settings_store.editor_settings.minimap);
const save_settings_fn = () => settings_store.save_editor_settings_fn();

const reset_editor_settings = () => {
  settings_store.reset_editor_settings();
  theme.value = settings_store.editor_settings.theme;
};

const editing_index = ref<number | null>(null);
const editing_key = ref('');
const key_input = ref<HTMLInputElement | null>(null);

const start_edit = async (index: number, kb: Keybinding) => {
  editing_index.value = index;
  editing_key.value = kb.key;
  await nextTick();
  key_input.value?.focus();
};

const capture_key = (e: KeyboardEvent) => {
  const keys = [];
  if (e.ctrlKey) keys.push('Ctrl');
  if (e.shiftKey) keys.push('Shift');
  if (e.altKey) keys.push('Alt');
  if (e.metaKey) keys.push('Meta');
  const key = e.key;
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key))
    keys.push(key.length === 1 ? key.toUpperCase() : key);
  editing_key.value = keys.join('+');
};

const save_edit = (index: number) => {
  if (editing_key.value) settings_store.update_keybinding(index, { key: editing_key.value });
  editing_index.value = null;
  editing_key.value = '';
};

const cancel_edit = () => {
  editing_index.value = null;
  editing_key.value = '';
};
const delete_keybinding = (index: number) => settings_store.remove_keybinding(index);

const new_keybinding = ref<Keybinding>({ key: '', command: '', description: '' });
const new_key_input = ref<HTMLInputElement | null>(null);

const capture_new_key = (e: KeyboardEvent) => {
  const keys = [];
  if (e.ctrlKey) keys.push('Ctrl');
  if (e.shiftKey) keys.push('Shift');
  if (e.altKey) keys.push('Alt');
  if (e.metaKey) keys.push('Meta');
  const key = e.key;
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key))
    keys.push(key.length === 1 ? key.toUpperCase() : key);
  new_keybinding.value.key = keys.join('+');
};

const add_keybinding = () => {
  if (new_keybinding.value.key && new_keybinding.value.command) {
    settings_store.add_keybinding({ ...new_keybinding.value });
    new_keybinding.value = { key: '', command: '', description: '' };
  }
};

const show_import = ref(false);
const import_text = ref('');

const export_settings_fn = () => {
  navigator.clipboard
    .writeText(settings_store.export_settings())
    .then(() => alert('配置已复制到剪贴板'));
};

const import_settings_fn = () => {
  if (settings_store.import_settings(import_text.value)) {
    alert('配置导入成功');
    show_import.value = false;
    import_text.value = '';
  } else {
    alert('配置格式无效');
  }
};
</script>
