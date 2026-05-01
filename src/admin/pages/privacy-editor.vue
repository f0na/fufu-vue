<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/admin/components/ui/input';
import { Label } from '@/admin/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/admin/components/ui/sheet';
import MonacoEditor from '@/admin/components/editor/MonacoEditor.vue';
import MarkdownPreview from '@/admin/components/editor/MarkdownPreview.vue';
import { useRouter } from 'vue-router';
import * as privacy_api from '@/lib/api/privacy';

interface PolicyVersion {
  version: string;
  date: string;
  content: string;
}

const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const show_preview = ref(false);
const meta_open = ref(false);
const active_version_idx = ref(0);

const versions = reactive<PolicyVersion[]>([]);

onMounted(async () => {
  try {
    const api_versions = await privacy_api.get_privacy_versions();
    if (Array.isArray(api_versions)) {
      versions.splice(0, versions.length, ...api_versions.map((v) => ({
        version: v.version,
        date: v.date || v.created_at?.split('T')[0] || '',
        content: v.content || '',
      })));
    }
  } catch {
    // Use defaults when backend is unavailable
  } finally {
    loading.value = false;
    if (versions.length === 0) {
      add_version();
    }
  }
});

function toggle_preview() {
  show_preview.value = !show_preview.value;
}

function add_version() {
  const date = new Date().toISOString().split('T')[0];
  const num = versions.length + 1;
  versions.push({ version: `v${num}.0`, date, content: '' });
  active_version_idx.value = versions.length - 1;
}

function remove_version(idx: number) {
  versions.splice(idx, 1);
  if (active_version_idx.value >= versions.length) {
    active_version_idx.value = Math.max(0, versions.length - 1);
  }
}

async function save() {
  saving.value = true;
  try {
    // Save each version individually via API
    for (const v of versions) {
      await privacy_api.create_privacy({
        version: v.version,
        date: v.date,
        content: v.content,
      });
    }
    toast.success('隐私政策已保存');
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
        <span class="text-xs font-medium text-text">隐私政策编辑</span>
      </div>
      <div class="flex items-center gap-1">
        <!-- 元数据 -->
        <Sheet v-model:open="meta_open">
          <button
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer border-none text-text hover:bg-bg-hover"
            @click="meta_open = true"
          >
            <Icon icon="lucide:file-text" class="w-3.5 h-3.5" />
            元数据
          </button>
          <SheetContent side="right" class="p-0" v-if="versions[active_version_idx]">
            <SheetHeader class="px-5 py-4 border-b border-border">
              <SheetTitle>版本元数据</SheetTitle>
            </SheetHeader>
            <div class="p-5 space-y-5">
              <div class="space-y-2">
                <Label>版本号</Label>
                <Input v-model="versions[active_version_idx].version" placeholder="v2.0" />
              </div>
              <div class="space-y-2">
                <Label>日期</Label>
                <DatePicker v-model="versions[active_version_idx].date" />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Button variant="outline" size="sm" @click="add_version">
          <Icon icon="lucide:plus" class="size-3 mr-1" />
          添加版本
        </Button>
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

    <!-- 版本切换栏 -->
    <div v-if="versions.length > 0" class="flex items-center h-9 px-3 bg-bg-alt border-b border-border shrink-0 gap-1">
      <button
        v-for="(v, idx) in versions"
        :key="v.version"
        class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer border-none"
        :class="active_version_idx === idx ? 'bg-accent/20 text-accent font-medium' : 'text-text-dim hover:text-text hover:bg-bg-hover'"
        @click="active_version_idx = idx"
      >
        {{ v.version }}
        <span class="opacity-60">({{ v.date }})</span>
        <Icon
          v-if="versions.length > 1"
          icon="lucide:x"
          class="size-3 cursor-pointer hover:text-danger"
          @click.stop="remove_version(idx)"
        />
      </button>
    </div>

    <!-- 工作区 -->
    <main class="flex flex-1 overflow-hidden">
      <template v-if="versions[active_version_idx]">
        <div class="flex flex-1 overflow-hidden">
          <section class="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div class="flex items-center h-7 px-3 bg-bg-alt border-b border-border shrink-0">
              <div class="flex items-center gap-1.5">
                <Icon icon="lucide:code" class="w-3 h-3 text-accent" />
                <span class="text-[11px] font-medium uppercase tracking-wide text-text-dim">编辑</span>
              </div>
            </div>
            <div class="flex-1 overflow-hidden">
              <MonacoEditor :value="versions[active_version_idx].content" @change="versions[active_version_idx].content = $event" />
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
              <MarkdownPreview :content="versions[active_version_idx].content" />
            </div>
          </section>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="flex-1 flex flex-col items-center justify-center text-text-dim text-sm gap-3">
        <Icon icon="lucide:file-text" class="size-10 opacity-40" />
        <p>暂无版本</p>
        <Button variant="outline" size="sm" @click="add_version">
          <Icon icon="lucide:plus" class="size-3.5 mr-1" />
          添加版本
        </Button>
      </div>
    </main>
  </div>
</template>
