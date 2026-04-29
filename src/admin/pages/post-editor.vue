<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import { Label } from '@/admin/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from '@/admin/components/ui/select';
import { Badge } from '@/admin/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/admin/components/ui/sheet';
import MonacoEditor from '@/admin/components/editor/MonacoEditor.vue';
import MarkdownPreview from '@/admin/components/editor/MarkdownPreview.vue';
import EditorSettings from '@/admin/components/editor/EditorSettings.vue';
import { useEditorSettingsStore } from '@/admin/stores/editor-settings';
import { translate_zh_to_en, text_to_slug } from '@/lib/translate';

const router = useRouter();
const route = useRoute();
const settings_store = useEditorSettingsStore();

const settings_open = ref(false);
const show_preview = ref(false);
const meta_open = ref(false);
const translating = ref(false);
const vim_status = ref({ mode: 'NORMAL', line: 1, col: 1, chars: 0 });
const editor_content = ref('');

const title = ref('');
const slug = ref('');
const category = ref('技术');
const status = ref<'draft' | 'published'>('draft');
const tags = ref<string[]>([]);
const tag_input = ref('');

let auto_slug_timer: ReturnType<typeof setTimeout> | null = null;

const categories = ['技术', '生活', '杂谈', '旅行', '音乐'];

const toggle_preview = () => {
  show_preview.value = !show_preview.value;
};

function fallback_slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function auto_slug() {
  if (auto_slug_timer) clearTimeout(auto_slug_timer);
  auto_slug_timer = setTimeout(async () => {
    if (!title.value) return;

    translating.value = true;
    try {
      const translated = await translate_zh_to_en(title.value);
      slug.value = text_to_slug(translated);
    } catch {
      // fallback
      slug.value = fallback_slug(title.value);
    } finally {
      translating.value = false;
    }
  }, 600);
}

function add_tag() {
  const t = tag_input.value.trim();
  if (t && !tags.value.includes(t)) {
    tags.value.push(t);
  }
  tag_input.value = '';
}

function remove_tag(t: string) {
  tags.value = tags.value.filter((x) => x !== t);
}

onMounted(async () => {
  const post_slug = route.params.slug as string | undefined;
  if (!post_slug) return;
  const { get_post_by_slug, get_post_content } = await import('@/lib/posts');
  const post = await get_post_by_slug(post_slug);
  if (post) {
    title.value = post.title || '';
    slug.value = post.slug || '';
    tags.value = post.tags ? [...post.tags] : [];
    category.value = (post as Record<string, any>).category || '技术';
    status.value = (post as Record<string, any>).status || 'draft';
    const result = await get_post_content(post_slug);
    if (result) {
      editor_content.value = result.content;
    }
  }
});

function handle_save() {
  // TODO: save to backend
  toast.success('文章已保存');
}
</script>

<template>
  <div class="editor-panel flex flex-col h-full -m-6 bg-bg font-sans">
    <!-- 工具栏 -->
    <header
      class="flex items-center justify-between h-9 px-3 bg-bg-alt border-b border-border shrink-0"
    >
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center justify-center w-6 h-6 rounded text-text-dim hover:text-text hover:bg-bg-hover cursor-pointer border-none text-sm"
          @click="router.back()"
        >
          <Icon icon="lucide:arrow-left" class="w-3.5 h-3.5" />
        </button>
        <span class="text-xs font-medium text-text">Markdown 编辑器</span>
      </div>
      <div class="flex gap-1 items-center">
        <!-- 元数据 -->
        <Sheet v-model:open="meta_open">
          <SheetTrigger as-child>
            <button
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer border-none text-text hover:bg-bg-hover"
            >
              <Icon icon="lucide:file-text" class="w-3.5 h-3.5" />
              元数据
            </button>
          </SheetTrigger>
          <SheetContent side="right" class="p-0">
            <SheetHeader class="px-5 py-4 border-b border-border">
              <SheetTitle>文档元数据</SheetTitle>
            </SheetHeader>
            <div class="p-5 space-y-5">
              <div class="space-y-2">
                <Label for="meta-title">标题</Label>
                <Input id="meta-title" v-model="title" placeholder="文章标题" @input="auto_slug" />
              </div>
              <div class="space-y-2">
                <Label for="meta-slug">slug</Label>
                <div class="relative">
                  <Input id="meta-slug" v-model="slug" placeholder="url-slug" />
                  <span
                    v-if="translating"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-text-dim"
                  >翻译中...</span>
                </div>
              </div>
              <div class="space-y-2">
                <Label for="meta-category">分类</Label>
                <Select v-model="category">
                  <SelectTrigger id="meta-category">
                    <SelectValue>{{ category }}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="c in categories" :key="c" :value="c">
                      <SelectItemText>{{ c }}</SelectItemText>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label>状态</Label>
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    :class="status === 'draft' ? 'bg-primary text-primary-foreground' : ''"
                    @click="status = 'draft'"
                    >草稿</Button
                  >
                  <Button
                    variant="outline"
                    size="sm"
                    :class="status === 'published' ? 'bg-primary text-primary-foreground' : ''"
                    @click="status = 'published'"
                    >已发布</Button
                  >
                </div>
              </div>
              <div class="space-y-2">
                <Label>标签</Label>
                <div class="flex items-center gap-2">
                  <Input
                    v-model="tag_input"
                    placeholder="输入标签后按回车"
                    @keydown.enter.prevent="add_tag"
                    class="flex-1"
                  />
                  <Button variant="outline" size="sm" @click="add_tag" :disabled="!tag_input.trim()"
                    >添加</Button
                  >
                </div>
                <div v-if="tags.length" class="flex flex-wrap gap-2 pt-1">
                  <Badge
                    v-for="t in tags"
                    :key="t"
                    variant="secondary"
                    class="cursor-pointer gap-1"
                    @click="remove_tag(t)"
                  >
                    {{ t }}
                    <Icon icon="lucide:x" class="size-3" />
                  </Badge>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <button
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer border-none"
          :class="show_preview ? 'bg-accent-dim text-white' : 'text-text hover:bg-bg-hover'"
          @click="toggle_preview"
        >
          <Icon icon="lucide:eye" class="w-3.5 h-3.5" />
          预览
        </button>
        <!-- 设置 -->
        <Sheet v-model:open="settings_open">
          <SheetTrigger as-child>
            <button
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer border-none text-text hover:bg-bg-hover"
            >
              <Icon icon="lucide:settings" class="w-3.5 h-3.5" />
              设置
            </button>
          </SheetTrigger>
          <SheetContent side="right" class="p-0 w-[450px] max-w-[90vw]">
            <EditorSettings @close="settings_open = false" />
          </SheetContent>
        </Sheet>
        <div class="w-px h-4 bg-border mx-1" />
        <button
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer border-none text-text hover:bg-bg-hover"
          @click="handle_save"
        >
          保存
        </button>
        <button
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs cursor-pointer border-none bg-accent text-white hover:bg-accent-hover"
          @click="handle_save"
        >
          发布
        </button>
      </div>
    </header>

    <!-- 工作区 -->
    <main class="flex flex-1 overflow-hidden">
      <div class="flex flex-1 overflow-hidden">
        <!-- 左：编辑窗 -->
        <section class="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div class="flex items-center h-7 px-3 bg-bg-alt border-b border-border shrink-0">
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:code" class="w-3 h-3 text-accent" />
              <span class="text-[11px] font-medium uppercase tracking-wide text-text-dim"
                >编辑</span
              >
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <MonacoEditor
              :value="editor_content"
              @change="editor_content = $event"
              @vim-status="vim_status = $event"
            />
          </div>
        </section>

        <!-- 分隔线 -->
        <div v-if="show_preview" class="flex items-stretch shrink-0 w-[3px] cursor-col-resize">
          <div class="w-px mx-auto bg-border"></div>
        </div>

        <!-- 右：预览窗 -->
        <section v-if="show_preview" class="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div class="flex items-center h-7 px-3 bg-bg-alt border-b border-border shrink-0">
            <div class="flex items-center gap-1.5">
              <Icon icon="lucide:eye" class="w-3 h-3 text-accent" />
              <span class="text-[11px] font-medium uppercase tracking-wide text-text-dim"
                >预览</span
              >
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <MarkdownPreview :content="editor_content" />
          </div>
        </section>
      </div>
    </main>

    <!-- Vim 状态栏（固定在底部） -->
    <div
      v-if="settings_store.vim_mode"
      class="flex items-center h-[22px] px-3 bg-accent text-white text-[11px] font-mono shrink-0 gap-2"
    >
      <span
        class="font-bold px-1.5 min-w-[56px] text-center rounded-sm leading-[18px]"
        :class="{
          'bg-white/20': vim_status.mode === 'NORMAL',
          'bg-success': vim_status.mode === 'INSERT',
          'bg-warning': vim_status.mode === 'VISUAL' || vim_status.mode.startsWith('V-'),
          'bg-danger': vim_status.mode === 'REPLACE',
        }"
        >{{ vim_status.mode }}</span
      >
      <span class="text-white/70">[md]</span>
      <span class="flex-1"></span>
      <span class="text-white/60">{{ vim_status.line }},{{ vim_status.col }}</span>
      <span class="text-white/60">ch {{ vim_status.chars }}</span>
    </div>
  </div>
</template>
