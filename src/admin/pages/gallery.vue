<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import { Badge } from '@/admin/components/ui/badge';
import { Label } from '@/admin/components/ui/label';
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
import type { Gallery } from '@/lib/types/gallery';

interface FormData {
  title: string;
}

const empty_form: FormData = { title: '' };

const router = useRouter();
const galleries = reactive<Gallery[]>([]);
const loading = ref(true);
const load_error = ref('');

onMounted(async () => {
  try {
    const res = await fetch('/content/gallery.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { galleries: Gallery[] } = await res.json();
    galleries.splice(0, galleries.length, ...(Array.isArray(data.galleries) ? data.galleries : []));
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

// Tags management for add sheet
const tag_input = ref('');
const gallery_tags = ref<string[]>([]);

function add_gallery_tag() {
  const t = tag_input.value.trim();
  if (t && !gallery_tags.value.includes(t)) {
    gallery_tags.value.push(t);
  }
  tag_input.value = '';
}

function remove_gallery_tag(t: string) {
  gallery_tags.value = gallery_tags.value.filter((x) => x !== t);
}

// Sheet state
const sheet_open = ref(false);
const form_data = reactive<FormData>({ ...empty_form });

const filtered_galleries = computed(() => {
  if (!search_query.value) return galleries;
  const q = search_query.value.toLowerCase();
  return galleries.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q))
  );
});

const total_pages = computed(() => Math.ceil(filtered_galleries.value.length / page_size));

const paged_galleries = computed(() => {
  const start = (current_page.value - 1) * page_size;
  return filtered_galleries.value.slice(start, start + page_size);
});

const all_selected = computed(
  () => paged_galleries.value.length > 0 && selected_ids.value.length === paged_galleries.value.length
);

function toggle_select(id: string) {
  const idx = selected_ids.value.indexOf(id);
  if (idx >= 0) selected_ids.value.splice(idx, 1);
  else selected_ids.value.push(id);
}

function select_all() {
  if (selected_ids.value.length === paged_galleries.value.length) {
    selected_ids.value = [];
  } else {
    selected_ids.value = paged_galleries.value.map((g) => g.id);
  }
}

function generate_id(): string {
  const existing_ids = galleries.map((g) => g.id);
  let num = galleries.length + 1;
  let id: string;
  do {
    id = `gallery-${String(num).padStart(3, '0')}`;
    num++;
  } while (existing_ids.includes(id));
  return id;
}

function open_add_sheet() {
  Object.assign(form_data, empty_form);
  gallery_tags.value = [];
  sheet_open.value = true;
}

function save_gallery() {
  if (!form_data.title.trim()) return;
  galleries.unshift({
    id: generate_id(),
    title: form_data.title.trim(),
    cover_path: '',
    tags: [...gallery_tags.value],
    photos: [],
    created_at: new Date().toISOString().split('T')[0],
  });
  sheet_open.value = false;
}

function delete_gallery(id: string) {
  const idx = galleries.findIndex((g) => g.id === id);
  if (idx >= 0) galleries.splice(idx, 1);
  const sel_idx = selected_ids.value.indexOf(id);
  if (sel_idx >= 0) selected_ids.value.splice(sel_idx, 1);
}

function delete_selected() {
  if (selected_ids.value.length === 0) return;
  const id_set = new Set(selected_ids.value);
  for (let i = galleries.length - 1; i >= 0; i--) {
    if (id_set.has(galleries[i].id)) galleries.splice(i, 1);
  }
  selected_ids.value = [];
}

function navigate_edit(id: string) {
  router.push(`/admin/gallery/${id}/edit`);
}

function display_cover(gallery: Gallery): string {
  if (gallery.cover_path) return gallery.cover_path;
  if (gallery.photos.length > 0) return gallery.photos[0];
  return '';
}
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-foreground">相册管理</h1>
      <Button size="sm" @click="open_add_sheet">
        <Icon icon="lucide:plus" class="size-4 mr-1" />
        添加相册
      </Button>
    </div>

    <!-- 搜索和操作条 -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative max-w-xs w-full">
        <Icon
          icon="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
        />
        <Input v-model="search_query" placeholder="搜索标题或标签..." class="pl-9 h-9" />
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
      <div class="text-sm text-muted-foreground ml-auto">共 {{ filtered_galleries.length }} 条</div>
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

    <!-- 相册表格 -->
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
            <TableHead class="w-56">标题</TableHead>
            <TableHead class="w-36">标签</TableHead>
            <TableHead class="w-20">照片数</TableHead>
            <TableHead class="w-24">创建日期</TableHead>
            <TableHead class="w-24 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="gallery in paged_galleries" :key="gallery.id">
            <TableRow
              class="cursor-pointer"
              :class="[
                selected_ids.includes(gallery.id) ? 'bg-muted/30' : '',
                expanded_ids.has(gallery.id) ? 'border-b-0' : '',
              ]"
              @click="toggle_expand(gallery.id)"
            >
              <TableCell @click.stop>
                <input
                  type="checkbox"
                  :checked="selected_ids.includes(gallery.id)"
                  @change="toggle_select(gallery.id)"
                  class="size-4 accent-primary"
                />
              </TableCell>
              <TableCell class="font-medium text-foreground">
                <div class="flex items-center gap-3">
                  <img
                    v-if="display_cover(gallery)"
                    :src="display_cover(gallery)"
                    :alt="gallery.title"
                    class="size-10 shrink-0 rounded-lg object-cover bg-muted"
                    loading="lazy"
                    @error="($event.target as HTMLImageElement).style.display='none'"
                  />
                  <div
                    v-else
                    class="size-10 shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"
                  >
                    <Icon icon="lucide:image" class="size-5" />
                  </div>
                  <span class="truncate">{{ gallery.title }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="tag in gallery.tags.slice(0, 2)"
                    :key="tag"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ tag }}
                  </Badge>
                  <span v-if="gallery.tags.length > 2" class="text-xs text-muted-foreground">
                    +{{ gallery.tags.length - 2 }}
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ gallery.photos.length }}</TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ gallery.created_at }}</TableCell>
              <TableCell class="text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" title="编辑" @click="navigate_edit(gallery.id)">
                    <Icon icon="lucide:pen" class="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="删除"
                    class="text-destructive hover:text-destructive"
                    @click="delete_gallery(gallery.id)"
                  >
                    <Icon icon="lucide:trash-2" class="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            <!-- 相册详情展开 -->
            <TableRow v-if="expanded_ids.has(gallery.id)" class="bg-muted/20">
              <TableCell :colspan="6" class="p-0">
                <div class="px-6 py-3 space-y-2 text-sm border-t border-border">
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-16">标题:</span>
                    <span>{{ gallery.title }}</span>
                  </div>
                  <div v-if="gallery.tags?.length" class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-16">标签:</span>
                    <div class="flex flex-wrap gap-1">
                      <Badge v-for="tag in gallery.tags" :key="tag" variant="secondary" class="text-xs">{{ tag }}</Badge>
                    </div>
                  </div>
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-16">照片数:</span>
                    <span>{{ gallery.photos.length }} 张</span>
                  </div>
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-16">创建日期:</span>
                    <span class="text-muted-foreground">{{ gallery.created_at }}</span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- 空状态 -->
          <TableRow v-if="paged_galleries.length === 0">
            <TableCell :colspan="6" class="text-center py-12 text-muted-foreground">
              没有找到匹配的相册
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

    <!-- 添加相册 Sheet -->
    <Sheet :open="sheet_open" @update:open="sheet_open = $event">
      <SheetContent side="right" class="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>添加相册</SheetTitle>
          <SheetDescription>
            创建相册后可以在编辑页面添加照片
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 space-y-4 px-6 py-4">
          <div class="space-y-2">
            <Label for="title">标题 *</Label>
            <Input id="title" v-model="form_data.title" placeholder="相册标题" />
          </div>
          <div class="space-y-2">
            <Label>标签</Label>
            <div class="flex items-center gap-2">
              <Input v-model="tag_input" placeholder="输入标签后添加" class="flex-1" @keydown.enter.prevent="add_gallery_tag" />
              <Button variant="outline" size="sm" @click="add_gallery_tag" :disabled="!tag_input.trim()">添加</Button>
            </div>
            <div v-if="gallery_tags.length" class="flex flex-wrap gap-2 pt-1">
              <Badge
                v-for="t in gallery_tags"
                :key="t"
                variant="secondary"
                class="cursor-pointer gap-1"
                @click="remove_gallery_tag(t)"
              >
                {{ t }}
                <Icon icon="lucide:x" class="size-3" />
              </Badge>
            </div>
          </div>
        </div>

        <SheetFooter>
          <SheetClose as-child>
            <Button variant="outline">取消</Button>
          </SheetClose>
          <Button :disabled="!form_data.title.trim()" @click="save_gallery">
            添加
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>
