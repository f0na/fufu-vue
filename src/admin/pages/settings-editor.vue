<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import MonacoEditor from '@/admin/components/editor/MonacoEditor.vue';
import MarkdownPreview from '@/admin/components/editor/MarkdownPreview.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const show_preview = ref(false);
const content = ref('');

import * as settings_api from '@/lib/api/settings';

onMounted(async () => {
  try {
    const profile = await settings_api.get_profile();
    content.value = profile.data.description || '';
  } catch {
    // Use defaults when backend is unavailable
  } finally {
    loading.value = false;
  }
});

function toggle_preview() {
  show_preview.value = !show_preview.value;
}

async function save() {
  saving.value = true;
  try {
    await settings_api.update_profile({ description: content.value });
    toast.success('首页内容已保存');
  } catch (e) {
    toast.error('保存失败：' + (e instanceof Error ? e.message : '未知错误'));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <!-- 加载状态 -->
  <div v-if="loading" class="flex items-center justify-center py-20 text-muted-foreground">
    <Icon icon="lucide:loader-circle" class="size-5 animate-spin mr-2" />
    加载中...
  </div>

  <div v-else class="editor-panel flex flex-col h-full -m-6 bg-bg font-sans">
    <!-- 工具栏 -->
    <header class="flex items-center justify-between h-9 px-3 bg-bg-alt border-b border-border shrink-0">
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center justify-center w-6 h-6 rounded text-text-dim hover:text-text hover:bg-bg-hover cursor-pointer border-none text-sm"
          @click="router.back()"
        >
          <Icon icon="lucide:arrow-left" class="w-3.5 h-3.5" />
        </button>
        <span class="text-xs font-medium text-text">首页内容编辑</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer border-none"
          :class="show_preview ? 'bg-accent-dim text-white' : 'text-text hover:bg-bg-hover'"
          @click="toggle_preview"
        >
          <Icon icon="lucide:eye" class="w-3.5 h-3.5" />
          预览
        </button>
        <div class="w-px h-4 bg-border mx-1" />
        <button
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer border-none text-text hover:bg-bg-hover"
          :disabled="saving"
          @click="save"
        >
          <Icon :icon="saving ? 'lucide:loader-circle' : 'lucide:save'" :class="['w-3.5 h-3.5', saving ? 'animate-spin' : '']" />
          保存
        </button>
      </div>
    </header>

    <!-- 工作区 -->
    <main class="flex flex-1 overflow-hidden">
      <div class="flex flex-1 overflow-hidden">
        <section class="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div class="flex items-center h-7 px-3 bg-bg-alt border-b border-border shrink-0">
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:code" class="w-3 h-3 text-accent" />
              <span class="text-[11px] font-medium uppercase tracking-wide text-text-dim">编辑</span>
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <MonacoEditor :value="content" @change="content = $event" />
          </div>
        </section>

        <div v-if="show_preview" class="flex items-stretch shrink-0 w-[3px] cursor-col-resize">
          <div class="w-px mx-auto bg-border"></div>
        </div>

        <section v-if="show_preview" class="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div class="flex items-center h-7 px-3 bg-bg-alt border-b border-border shrink-0">
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:eye" class="w-3 h-3 text-accent" />
              <span class="text-[11px] font-medium uppercase tracking-wide text-text-dim">预览</span>
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <MarkdownPreview :content="content" />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
