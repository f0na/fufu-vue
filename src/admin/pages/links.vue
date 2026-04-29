<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import { Badge } from '@/admin/components/ui/badge';
import { Label } from '@/admin/components/ui/label';
import { Textarea } from '@/admin/components/ui/textarea';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/admin/components/ui/sheet';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/admin/components/ui/table';
import type { LinkItem } from '@/lib/types/link';

interface FormData {
  title: string;
  url: string;
  description: string;
  tags: string;
  is_starred: boolean;
}

const empty_form: FormData = {
  title: '',
  url: '',
  description: '',
  tags: '',
  is_starred: false,
};

const links = reactive<LinkItem[]>([]);
const loading = ref(true);
const load_error = ref('');

onMounted(async () => {
  try {
    const res = await fetch('/content/links/links.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { links: LinkItem[] } = await res.json();
    links.splice(0, links.length, ...(Array.isArray(data.links) ? data.links : []));
  } catch (e) {
    load_error.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
});
const search_query = ref('');
const current_page = ref(1);
const page_size = 15;
const selected_ids = ref<string[]>([]);
const expanded_ids = ref(new Set<string>());
function toggle_expand(id: string) {
  const set = expanded_ids.value;
  if (set.has(id)) set.delete(id);
  else set.add(id);
}
const tag_input = ref('');
const link_tags = ref<string[]>([]);
function add_link_tag() {
  const t = tag_input.value.trim();
  if (t && !link_tags.value.includes(t)) {
    link_tags.value.push(t);
  }
  tag_input.value = '';
}
function remove_link_tag(t: string) {
  link_tags.value = link_tags.value.filter((x) => x !== t);
}

// Sheet state
const sheet_open = ref(false);
const editing_id = ref<string | null>(null);
const form_data = reactive<FormData>({ ...empty_form });

const filtered_links = computed(() => {
  if (!search_query.value) return links;
  const q = search_query.value.toLowerCase();
  return links.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.url.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q))
  );
});

const total_pages = computed(() => Math.ceil(filtered_links.value.length / page_size));

const paged_links = computed(() => {
  const start = (current_page.value - 1) * page_size;
  return filtered_links.value.slice(start, start + page_size);
});

const all_selected = computed(
  () => paged_links.value.length > 0 && selected_ids.value.length === paged_links.value.length
);

function toggle_select(id: string) {
  const idx = selected_ids.value.indexOf(id);
  if (idx >= 0) selected_ids.value.splice(idx, 1);
  else selected_ids.value.push(id);
}

function select_all() {
  if (selected_ids.value.length === paged_links.value.length) {
    selected_ids.value = [];
  } else {
    selected_ids.value = paged_links.value.map((l) => l.id);
  }
}

function generate_id(): string {
  const existing_ids = links.map((l) => l.id);
  let num = links.length + 1;
  let id: string;
  do {
    id = `link-${String(num).padStart(3, '0')}`;
    num++;
  } while (existing_ids.includes(id));
  return id;
}

function open_add_sheet() {
  editing_id.value = null;
  Object.assign(form_data, empty_form);
  link_tags.value = [];
  sheet_open.value = true;
}

function open_edit_sheet(link: LinkItem) {
  editing_id.value = link.id;
  form_data.title = link.title;
  form_data.url = link.url;
  form_data.description = link.description ?? '';
  link_tags.value = [...link.tags];
  form_data.is_starred = link.is_starred ?? false;
  sheet_open.value = true;
}

function save_link() {
  if (!form_data.title.trim() || !form_data.url.trim()) return;

  const url = normalize_url(form_data.url);

  if (editing_id.value) {
    const idx = links.findIndex((l) => l.id === editing_id.value);
    if (idx >= 0) {
      links[idx] = {
        ...links[idx],
        title: form_data.title.trim(),
        url,
        description: form_data.description.trim(),
        tags: [...link_tags.value],
        is_starred: form_data.is_starred,
      };
    }
  } else {
    links.unshift({
      id: generate_id(),
      title: form_data.title.trim(),
      url,
      description: form_data.description.trim() || undefined,
      tags: [...link_tags.value],
      created_at: new Date().toISOString().split('T')[0],
      is_starred: form_data.is_starred || undefined,
    });
  }

  toast.success(editing_id.value ? '链接已更新' : '链接已添加');
  sheet_open.value = false;
}

function delete_link(id: string) {
  const idx = links.findIndex((l) => l.id === id);
  if (idx >= 0) links.splice(idx, 1);
  const sel_idx = selected_ids.value.indexOf(id);
  if (sel_idx >= 0) selected_ids.value.splice(sel_idx, 1);
}

function delete_selected() {
  if (selected_ids.value.length === 0) return;
  const id_set = new Set(selected_ids.value);
  for (let i = links.length - 1; i >= 0; i--) {
    if (id_set.has(links[i].id)) links.splice(i, 1);
  }
  selected_ids.value = [];
}

function toggle_star(link: LinkItem) {
  link.is_starred = !link.is_starred;
  if (!link.is_starred) delete link.is_starred;
}

function truncate_url(url: string, max = 40): string {
  return url.length > max ? url.slice(0, max) + '...' : url;
}

function extract_domain(url: string): string {
  try {
    return new URL(url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`).hostname;
  } catch {
    return '';
  }
}

function favicon_url(url: string): string {
  const domain = extract_domain(url);
  return domain ? `https://favicon.im/${domain}` : '';
}

function normalize_url(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-foreground">链接管理</h1>
      <Button size="sm" @click="open_add_sheet">
        <Icon icon="lucide:plus" class="size-4 mr-1" />
        添加链接
      </Button>
    </div>

    <!-- 搜索和操作条 -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative max-w-xs w-full">
        <Icon
          icon="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
        />
        <Input v-model="search_query" placeholder="搜索标题、链接或标签..." class="pl-9 h-9" />
      </div>
      <Button
        v-if="selected_ids.length > 0"
        variant="outline"
        size="sm"
        class="text-destructive"
        @click="delete_selected"
      >
        <Icon icon="lucide:trash-2" class="size-3.5 mr-1" />
        删除选中 ({{ selected_ids.length }})
      </Button>
      <div class="text-sm text-muted-foreground ml-auto">共 {{ filtered_links.length }} 条</div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <Icon icon="lucide:loader-circle" class="size-5 animate-spin mr-2" />
      加载中...
    </div>

    <!-- 错误状态 -->
    <div
      v-else-if="load_error"
      class="flex flex-col items-center justify-center py-16 text-muted-foreground"
    >
      <Icon icon="lucide:alert-circle" class="size-8 mb-2 text-destructive" />
      <p>数据加载失败：{{ load_error }}</p>
    </div>

    <!-- 链接表格 -->
    <div v-else class="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10">
              <input
                type="checkbox"
                :checked="all_selected"
                :indeterminate="selected_ids.length > 0 && !all_selected"
                @change="select_all"
                class="size-4 accent-primary"
              />
            </TableHead>
            <TableHead class="w-64">标题</TableHead>
            <TableHead class="w-56">链接</TableHead>
            <TableHead class="w-36">标签</TableHead>
            <TableHead class="w-16">收藏</TableHead>
            <TableHead class="w-24">创建日期</TableHead>
            <TableHead class="w-24 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="link in paged_links" :key="link.id">
            <TableRow
              class="cursor-pointer"
              :class="[
                selected_ids.includes(link.id) ? 'bg-muted/30' : '',
                expanded_ids.has(link.id) ? 'border-b-0' : '',
              ]"
              @click="toggle_expand(link.id)"
            >
              <TableCell @click.stop>
                <input
                  type="checkbox"
                  :checked="selected_ids.includes(link.id)"
                  @change="toggle_select(link.id)"
                  class="size-4 accent-primary"
                />
              </TableCell>
              <TableCell class="font-medium text-foreground">
                <div class="flex items-center gap-2">
                  <img
                    v-if="link.url"
                    :src="favicon_url(link.url)"
                    class="size-4 shrink-0 rounded"
                    alt=""
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    @error="($event.target as HTMLImageElement).style.display='none'"
                  />
                  <span class="truncate">{{ link.title }}</span>
                </div>
              </TableCell>
              <TableCell>
                <a
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-muted-foreground hover:text-primary truncate block max-w-[200px]"
                  :title="link.url"
                >
                  {{ truncate_url(link.url) }}
                </a>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="tag in link.tags.slice(0, 2)"
                    :key="tag"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ tag }}
                  </Badge>
                  <span v-if="link.tags.length > 2" class="text-xs text-muted-foreground">
                    +{{ link.tags.length - 2 }}
                  </span>
                </div>
              </TableCell>
              <TableCell @click.stop>
                <button
                  class="cursor-pointer transition-colors p-1.5 -m-1.5"
                  :class="link.is_starred ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'"
                  :title="link.is_starred ? '取消收藏' : '收藏'"
                  @click="toggle_star(link)"
                >
                  <Icon
                    :icon="link.is_starred ? 'ph:star-fill' : 'ph:star'"
                    class="size-5"
                  />
                </button>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ link.created_at }}</TableCell>
              <TableCell class="text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" title="编辑" @click="open_edit_sheet(link)">
                    <Icon icon="lucide:pen" class="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="删除"
                    class="text-destructive hover:text-destructive"
                    @click="delete_link(link.id)"
                  >
                    <Icon icon="lucide:trash-2" class="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            <!-- 展开完整内容 -->
            <TableRow v-if="expanded_ids.has(link.id)" class="bg-muted/20">
              <TableCell :colspan="7" class="p-0">
                <div class="px-6 py-3 space-y-2 text-sm border-t border-border">
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">标题:</span>
                    <span>{{ link.title }}</span>
                  </div>
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">链接:</span>
                    <a :href="link.url" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline truncate">{{ link.url }}</a>
                  </div>
                  <div v-if="link.tags?.length" class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">标签:</span>
                    <div class="flex flex-wrap gap-1">
                      <Badge v-for="tag in link.tags" :key="tag" variant="secondary" class="text-xs">{{ tag }}</Badge>
                    </div>
                  </div>
                  <div v-if="link.description" class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">描述:</span>
                    <span class="text-muted-foreground">{{ link.description }}</span>
                  </div>
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">创建日期:</span>
                    <span class="text-muted-foreground">{{ link.created_at }}</span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- 空状态 -->
          <TableRow v-if="paged_links.length === 0">
            <TableCell :colspan="7" class="text-center py-12 text-muted-foreground">
              没有找到匹配的链接
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- 分页 -->
    <div v-if="total_pages > 1" class="flex items-center justify-center gap-1 mt-4">
      <Button
        variant="ghost"
        size="sm"
        :disabled="current_page <= 1"
        @click="current_page--"
        class="gap-1"
      >
        <Icon icon="lucide:chevron-left" class="size-3.5" />
        上一页
      </Button>
      <template v-for="p in total_pages" :key="p">
        <Button
          variant="ghost"
          size="icon-sm"
          :class="
            p === current_page ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
          "
          @click="current_page = p"
        >
          {{ p }}
        </Button>
      </template>
      <Button
        variant="ghost"
        size="sm"
        :disabled="current_page >= total_pages"
        @click="current_page++"
        class="gap-1"
      >
        下一页
        <Icon icon="lucide:chevron-right" class="size-3.5" />
      </Button>
    </div>

    <!-- 添加/编辑 Sheet -->
    <Sheet :open="sheet_open" @update:open="sheet_open = $event">
      <SheetContent side="right" class="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{{ editing_id ? '编辑链接' : '添加链接' }}</SheetTitle>
          <SheetDescription>
            {{ editing_id ? '修改链接信息' : '添加一个新的友情链接' }}
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 space-y-4 px-6 py-4">
          <div class="space-y-2">
            <Label for="title">标题 *</Label>
            <Input id="title" v-model="form_data.title" placeholder="链接标题" />
          </div>
          <div class="space-y-2">
            <Label for="url">URL *</Label>
            <Input id="url" v-model="form_data.url" placeholder="https://example.com" />
          </div>
          <div class="space-y-2">
            <Label for="description">描述</Label>
            <Textarea id="description" v-model="form_data.description" placeholder="简短描述" :rows="3" />
          </div>
          <div class="space-y-2">
            <Label>标签</Label>
            <div class="flex items-center gap-2">
              <Input v-model="tag_input" placeholder="输入标签后添加" class="flex-1" @keydown.enter.prevent="add_link_tag" />
              <Button variant="outline" size="sm" @click="add_link_tag" :disabled="!tag_input.trim()">添加</Button>
            </div>
            <div v-if="link_tags.length" class="flex flex-wrap gap-2 pt-1">
              <Badge
                v-for="t in link_tags"
                :key="t"
                variant="secondary"
                class="cursor-pointer gap-1"
                @click="remove_link_tag(t)"
              >
                {{ t }}
                <Icon icon="lucide:x" class="size-3" />
              </Badge>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input
              id="is_starred"
              type="checkbox"
              v-model="form_data.is_starred"
              class="size-4 accent-primary"
            />
            <Label for="is_starred" class="cursor-pointer">设为收藏</Label>
          </div>
        </div>

        <SheetFooter>
          <SheetClose as-child>
            <Button variant="outline">取消</Button>
          </SheetClose>
          <Button
            :disabled="!form_data.title.trim() || !form_data.url.trim()"
            @click="save_link"
          >
            {{ editing_id ? '保存' : '添加' }}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>
