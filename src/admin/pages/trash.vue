<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/admin/components/ui/table';
import type { TrashItem, TrashResource } from '@/lib/types/trash';
import * as trash_api from '@/lib/api/trash';

const resource_options: { label: string; value: TrashResource }[] = [
  { label: '文章', value: 'posts' },
  { label: '友人帐', value: 'friends' },
  { label: '链接', value: 'links' },
  { label: '相册', value: 'galleries' },
  { label: '番剧记录', value: 'bangumi_records' },
];

const active_resource = ref<TrashResource>('posts');
const items = reactive<TrashItem[]>([]);
const loading = ref(true);
const load_error = ref('');
const page = ref(1);
const total_pages = ref(0);
const total = ref(0);
const selected_ids = ref<string[]>([]);

// Confirm dialog state
const confirm_dialog = reactive<{
  open: boolean;
  type: 'restore' | 'delete';
  ids: string[];
  title: string;
}>({
  open: false,
  type: 'delete',
  ids: [],
  title: '',
});

async function load_trash() {
  loading.value = true;
  load_error.value = '';
  selected_ids.value = [];
  try {
    const result = await trash_api.get_trash(active_resource.value, {
      page: page.value,
      page_size: 20,
    });
    items.splice(0, items.length, ...result.data);
    total.value = result.total;
    total_pages.value = result.total_pages;
  } catch (e) {
    load_error.value = e instanceof Error ? e.message : '加载回收站数据失败';
  } finally {
    loading.value = false;
  }
}

function switch_resource(resource: TrashResource) {
  if (resource === active_resource.value) return;
  active_resource.value = resource;
  page.value = 1;
  load_trash();
}

function go_page(p: number) {
  page.value = p;
  load_trash();
}

// Selection
const all_selected = computed(
  () => items.length > 0 && selected_ids.value.length === items.length
);

function toggle_select(id: string) {
  const idx = selected_ids.value.indexOf(id);
  if (idx >= 0) selected_ids.value.splice(idx, 1);
  else selected_ids.value.push(id);
}

function toggle_select_all() {
  if (selected_ids.value.length === items.length) {
    selected_ids.value = [];
  } else {
    selected_ids.value = items.map((i) => i.id);
  }
}

// Restore single
function confirm_restore(id: string) {
  confirm_dialog.open = true;
  confirm_dialog.type = 'restore';
  confirm_dialog.ids = [id];
  confirm_dialog.title = '确定要恢复此项吗？';
}

function confirm_restore_selected() {
  if (selected_ids.value.length === 0) return;
  confirm_dialog.open = true;
  confirm_dialog.type = 'restore';
  confirm_dialog.ids = [...selected_ids.value];
  confirm_dialog.title = `确定要恢复选中的 ${selected_ids.value.length} 项吗？`;
}

// Delete single
function confirm_delete(id: string) {
  confirm_dialog.open = true;
  confirm_dialog.type = 'delete';
  confirm_dialog.ids = [id];
  confirm_dialog.title = '确定要永久删除此项吗？此操作不可撤销。';
}

function confirm_delete_selected() {
  if (selected_ids.value.length === 0) return;
  confirm_dialog.open = true;
  confirm_dialog.type = 'delete';
  confirm_dialog.ids = [...selected_ids.value];
  confirm_dialog.title = `确定要永久删除选中的 ${selected_ids.value.length} 项吗？此操作不可撤销。`;
}

async function execute_confirm() {
  const resource = active_resource.value;
  const ids = confirm_dialog.ids;
  confirm_dialog.open = false;

  try {
    if (confirm_dialog.type === 'restore') {
      await Promise.all(ids.map((id) => trash_api.restore(resource, id)));
      toast.success(ids.length === 1 ? '已恢复' : `已恢复 ${ids.length} 项`);
    } else {
      await Promise.all(ids.map((id) => trash_api.permanently_delete(resource, id)));
      toast.success(ids.length === 1 ? '已永久删除' : `已永久删除 ${ids.length} 项`);
    }
    const id_set = new Set(ids);
    for (let i = items.length - 1; i >= 0; i--) {
      if (id_set.has(items[i].id)) items.splice(i, 1);
    }
    selected_ids.value = selected_ids.value.filter((sid) => !id_set.has(sid));
    total.value = Math.max(0, total.value - ids.length);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '操作失败');
  }
}

onMounted(load_trash);

interface ColumnDef {
  key: string;
  label: string;
  class?: string;
  render: (item: TrashItem) => string;
}

const resource_columns: Record<TrashResource, ColumnDef[]> = {
  posts: [
    { key: 'title', label: '标题', class: 'w-64', render: (i) => i.title },
    { key: 'slug', label: 'Slug', class: 'w-36', render: (i) => i.slug || '-' },
    { key: 'tags', label: '标签', class: 'w-36', render: (i) => {
      try { const t = JSON.parse(i.tags || '[]'); return Array.isArray(t) ? t.join(', ') : i.tags || '-'; } catch { return i.tags || '-'; }
    }},
    { key: 'published_at', label: '日期', class: 'w-24', render: (i) => i.published_at?.split('T')[0] || i.created_at?.split('T')[0] || '-' },
  ],
  friends: [
    { key: 'name', label: '名称', class: 'w-44', render: (i) => i.name || i.title },
    { key: 'url', label: '链接', class: 'w-44', render: (i) => i.url || '-' },
    { key: 'description', label: '描述', class: 'hidden md:table-cell', render: (i) => i.description || '-' },
    { key: 'status', label: '状态', class: 'w-20', render: (i) => ({ pending: '待审核', approved: '已通过', rejected: '已拒绝' })[i.status || ''] || i.status || '-' },
    { key: 'created_at', label: '创建日期', class: 'w-20', render: (i) => i.created_at?.split('T')[0] || '-' },
  ],
  links: [
    { key: 'title', label: '标题', class: 'w-64', render: (i) => i.title },
    { key: 'url', label: '链接', class: 'w-56', render: (i) => i.url || '-' },
    { key: 'tags', label: '标签', class: 'w-36', render: (i) => {
      try { const t = JSON.parse(i.tags || '[]'); return Array.isArray(t) ? t.join(', ') : i.tags || '-'; } catch { return i.tags || '-'; }
    }},
    { key: 'favorite', label: '收藏', class: 'w-16 text-center', render: (i) => i.favorite ? '⭐' : '-' },
    { key: 'created_at', label: '创建日期', class: 'w-24', render: (i) => i.created_at?.split('T')[0] || '-' },
  ],
  galleries: [
    { key: 'title', label: '标题', class: 'w-56', render: (i) => i.title },
    { key: 'tags', label: '标签', class: 'w-36', render: (i) => {
      try { const t = JSON.parse(i.tags || '[]'); return Array.isArray(t) ? t.join(', ') : i.tags || '-'; } catch { return i.tags || '-'; }
    }},
    { key: 'created_at', label: '创建日期', class: 'w-24', render: (i) => i.created_at?.split('T')[0] || '-' },
  ],
  bangumi_records: [
    { key: 'title', label: '标题', class: 'w-56', render: (i) => i.title },
    { key: 'status', label: '追番状态', class: 'w-24', render: (i) => ({ watching: '在看', want_to_watch: '想看', watched: '已看', dropped: '弃番' })[i.status || ''] || i.status || '-' },
    { key: 'progress', label: '进度', class: 'w-20 text-center', render: (i) => i.progress || '-' },
    { key: 'created_at', label: '创建日期', class: 'w-24', render: (i) => i.created_at?.split('T')[0] || '-' },
  ],
};

const columns = computed(() => resource_columns[active_resource.value]);
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-foreground">回收站</h1>
    </div>

    <!-- 资源类型切换 -->
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <button
        v-for="opt in resource_options"
        :key="opt.value"
        class="px-3 py-1.5 text-sm rounded-md transition-colors"
        :class="
          active_resource === opt.value
            ? 'bg-primary text-primary-foreground font-medium'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        "
        @click="switch_resource(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 操作条 -->
    <div class="flex items-center gap-2 mb-4">
      <Button
        v-if="selected_ids.length > 0"
        variant="outline"
        size="sm"
        @click="confirm_restore_selected"
      >
        <Icon icon="lucide:rotate-ccw" class="size-3.5 mr-1" />
        恢复选中 ({{ selected_ids.length }})
      </Button>
      <Button
        v-if="selected_ids.length > 0"
        variant="outline"
        size="sm"
        class="text-destructive hover:text-destructive"
        @click="confirm_delete_selected"
      >
        <Icon icon="lucide:trash-2" class="size-3.5 mr-1" />
        永久删除 ({{ selected_ids.length }})
      </Button>
      <div class="text-sm text-muted-foreground ml-auto">共 {{ total }} 项</div>
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
      <p>加载失败：{{ load_error }}</p>
      <Button variant="outline" size="sm" class="mt-4" @click="load_trash">
        <Icon icon="lucide:refresh" class="size-3.5 mr-1" />
        重试
      </Button>
    </div>

    <!-- 数据表格 -->
    <div v-else class="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10">
              <input
                v-if="items.length > 0"
                type="checkbox"
                :checked="all_selected"
                :indeterminate="selected_ids.length > 0 && !all_selected"
                @change="toggle_select_all"
                class="size-4 accent-primary"
              />
            </TableHead>
            <TableHead v-for="col in columns" :key="col.key" :class="col.class || ''">{{ col.label }}</TableHead>
            <TableHead class="w-36">删除时间</TableHead>
            <TableHead class="w-28 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in items" :key="item.id">
            <TableCell>
              <input
                type="checkbox"
                :checked="selected_ids.includes(item.id)"
                @change="toggle_select(item.id)"
                class="size-4 accent-primary"
              />
            </TableCell>
            <TableCell
              v-for="col in columns"
              :key="col.key"
              class="text-sm text-foreground font-medium"
            >
              {{ col.render(item) }}
            </TableCell>
            <TableCell class="text-sm text-muted-foreground whitespace-nowrap">{{ item.deleted_at }}</TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="恢复"
                  @click="confirm_restore(item.id)"
                >
                  <Icon icon="lucide:rotate-ccw" class="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="永久删除"
                  class="text-destructive hover:text-destructive"
                  @click="confirm_delete(item.id)"
                >
                  <Icon icon="lucide:trash-2" class="size-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <!-- 空状态 -->
          <TableRow v-if="items.length === 0">
            <TableCell :colspan="columns.length + 3" class="text-center py-16 text-muted-foreground">
              <Icon icon="lucide:trash-2" class="size-8 mx-auto mb-2 opacity-40" />
              <p>回收站里空空如也</p>
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
        :disabled="page <= 1"
        @click="go_page(page - 1)"
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
            p === page ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
          "
          @click="go_page(p)"
        >
          {{ p }}
        </Button>
      </template>
      <Button
        variant="ghost"
        size="sm"
        :disabled="page >= total_pages"
        @click="go_page(page + 1)"
        class="gap-1"
      >
        下一页
        <Icon icon="lucide:chevron-right" class="size-3.5" />
      </Button>
    </div>

    <!-- 确认对话框 -->
    <AlertDialog v-model:open="confirm_dialog.open">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ confirm_dialog.title }}</AlertDialogTitle>
          <AlertDialogDescription v-if="confirm_dialog.type === 'delete'">
            此操作将永久删除数据，无法恢复。请确认。
          </AlertDialogDescription>
          <AlertDialogDescription v-else>
            恢复后数据将重新出现在对应管理页面中。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            :class="confirm_dialog.type === 'delete' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''"
            @click="execute_confirm"
          >
            {{ confirm_dialog.type === 'delete' ? '永久删除' : '恢复' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
