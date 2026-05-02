<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import { Textarea } from '@/admin/components/ui/textarea';
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
import type { FriendItem, FriendStatus } from '@/lib/types/friend';
import * as friends_api from '@/lib/api/friends';

interface FormData {
  name: string;
  url: string;
  avatar: string;
  description: string;
}

const empty_form: FormData = {
  name: '',
  url: '',
  avatar: '',
  description: '',
};

const friends = reactive<FriendItem[]>([]);
const loading = ref(true);
const load_error = ref('');

onMounted(async () => {
  try {
    const statuses: FriendStatus[] = ['approved', 'pending', 'rejected'];
    const results = await Promise.all(
      statuses.map((s) => friends_api.get_friends({ page: 1, page_size: 1000, status: s }))
    );
    const all = results.flatMap((r) =>
      r.data.map((f) => ({
        ...f,
        avatar: f.avatar_url || f.avatar,
      }))
    );
    friends.splice(0, friends.length, ...all);
  } catch (e) {
    load_error.value = e instanceof Error ? e.message : '从后端加载友人数据失败';
  } finally {
    loading.value = false;
  }
});

const search_query = ref('');
const status_filter = ref<FriendStatus | 'all'>('all');
const current_page = ref(1);
const page_size = 15;
const selected_ids = ref<string[]>([]);
const expanded_ids = ref(new Set<string>());

function toggle_expand(id: string) {
  const set = expanded_ids.value;
  if (set.has(id)) set.delete(id);
  else set.add(id);
}

const sheet_open = ref(false);
const editing_id = ref<string | null>(null);
const form_data = reactive<FormData>({ ...empty_form });
const avatar_dirty = ref(false);
const saving = ref(false);

watch(
  () => form_data.url,
  (url) => {
    if (!avatar_dirty.value && !editing_id.value && extract_domain(url)) {
      form_data.avatar = favicon_url(url);
    }
  }
);

const filtered_friends = computed(() => {
  let result = friends;
  if (status_filter.value !== 'all') {
    result = result.filter((f) => f.status === status_filter.value);
  }
  if (search_query.value) {
    const q = search_query.value.toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.url.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
    );
  }
  return result;
});

const total_pages = computed(() => Math.ceil(filtered_friends.value.length / page_size));

const paged_friends = computed(() => {
  const start = (current_page.value - 1) * page_size;
  return filtered_friends.value.slice(start, start + page_size);
});

const all_selected = computed(
  () => paged_friends.value.length > 0 && selected_ids.value.length === paged_friends.value.length
);

function toggle_select(id: string) {
  const idx = selected_ids.value.indexOf(id);
  if (idx >= 0) selected_ids.value.splice(idx, 1);
  else selected_ids.value.push(id);
}

function select_all() {
  if (selected_ids.value.length === paged_friends.value.length) {
    selected_ids.value = [];
  } else {
    selected_ids.value = paged_friends.value.map((f) => f.id);
  }
}

function open_add_sheet() {
  editing_id.value = null;
  Object.assign(form_data, empty_form);
  avatar_dirty.value = false;
  sheet_open.value = true;
}

function open_edit_sheet(friend: FriendItem) {
  editing_id.value = friend.id;
  form_data.name = friend.name;
  form_data.url = friend.url;
  form_data.avatar = friend.avatar ?? '';
  form_data.description = friend.description ?? '';
  avatar_dirty.value = true;
  sheet_open.value = true;
}

async function save_friend() {
  if (!form_data.name.trim() || !form_data.url.trim()) return;
  saving.value = true;

  const url = normalize_url(form_data.url);
  const data = {
    name: form_data.name.trim(),
    url,
    avatar_url: form_data.avatar.trim() || undefined,
    description: form_data.description.trim() || undefined,
  };

  try {
    if (editing_id.value) {
      await friends_api.update_friend(editing_id.value, data);
      const idx = friends.findIndex((f) => f.id === editing_id.value);
      if (idx >= 0) {
        friends[idx] = {
          ...friends[idx],
          ...data,
          avatar: data.avatar_url,
        };
      }
    } else {
      const created = await friends_api.create_friend(data);
      friends.unshift({
        ...created,
        avatar: created.avatar_url || created.avatar,
      });
    }

    toast.success(editing_id.value ? '友人已更新' : '友人已添加');
    sheet_open.value = false;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '保存失败');
  } finally {
    saving.value = false;
  }
}

async function delete_friend(id: string) {
  try {
    await friends_api.delete_friend(id);
    const idx = friends.findIndex((f) => f.id === id);
    if (idx >= 0) friends.splice(idx, 1);
    const sel_idx = selected_ids.value.indexOf(id);
    if (sel_idx >= 0) selected_ids.value.splice(sel_idx, 1);
    toast.success('已删除');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '删除失败');
  }
}

async function delete_selected() {
  if (selected_ids.value.length === 0) return;
  try {
    for (const id of [...selected_ids.value]) {
      await friends_api.delete_friend(id);
    }
    const id_set = new Set(selected_ids.value);
    for (let i = friends.length - 1; i >= 0; i--) {
      if (id_set.has(friends[i].id)) friends.splice(i, 1);
    }
    selected_ids.value = [];
    toast.success('已删除选中项');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '删除失败');
  }
}

async function approve_friend(id: string) {
  try {
    await friends_api.update_friend_status(id, 'approved');
    const item = friends.find((f) => f.id === id);
    if (item) item.status = 'approved';
    toast.success('已通过');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '操作失败');
  }
}

async function reject_friend(id: string) {
  try {
    await friends_api.update_friend_status(id, 'rejected');
    const item = friends.find((f) => f.id === id);
    if (item) item.status = 'rejected';
    toast.success('已拒绝');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : '操作失败');
  }
}

function status_badge_variant(status?: FriendStatus): string {
  switch (status) {
    case 'approved': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'pending':  return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:         return 'bg-muted text-muted-foreground';
  }
}

function status_label(status?: FriendStatus): string {
  switch (status) {
    case 'approved': return '已通过';
    case 'pending':  return '待审核';
    case 'rejected': return '已拒绝';
    default:         return '未知';
  }
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
      <h1 class="text-2xl font-semibold text-foreground">友人帐管理</h1>
      <Button size="sm" @click="open_add_sheet">
        <Icon icon="lucide:plus" class="size-4 mr-1" />
        添加友人
      </Button>
    </div>

    <!-- 搜索和操作条 -->
    <div class="flex flex-col gap-3 mb-4">
      <div class="flex items-center gap-3">
        <div class="relative max-w-xs w-full">
          <Icon
            icon="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          />
          <Input v-model="search_query" placeholder="搜索名称、链接或描述..." class="pl-9 h-9" />
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
        <div class="text-sm text-muted-foreground ml-auto">共 {{ filtered_friends.length }} 条</div>
      </div>
      <div class="flex items-center gap-1.5">
        <button
          v-for="opt in ([
            { value: 'all', label: '全部' },
            { value: 'pending', label: '待审核' },
            { value: 'approved', label: '已通过' },
            { value: 'rejected', label: '已拒绝' },
          ] as const)"
          :key="opt.value"
          class="px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer"
          :class="
            status_filter === opt.value
              ? 'bg-foreground text-background border-foreground'
              : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30'
          "
          @click="status_filter = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
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

    <!-- 友人表格 -->
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
            <TableHead class="w-44">名称</TableHead>
            <TableHead class="w-44">链接</TableHead>
            <TableHead class="hidden md:table-cell">描述</TableHead>
            <TableHead class="w-20">状态</TableHead>
            <TableHead class="w-20">创建日期</TableHead>
            <TableHead class="w-28 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="friend in paged_friends" :key="friend.id">
            <TableRow
              class="cursor-pointer"
              :class="[
                selected_ids.includes(friend.id) ? 'bg-muted/30' : '',
                expanded_ids.has(friend.id) ? 'border-b-0' : '',
              ]"
              @click="toggle_expand(friend.id)"
            >
              <TableCell @click.stop>
                <input
                  type="checkbox"
                  :checked="selected_ids.includes(friend.id)"
                  @change="toggle_select(friend.id)"
                  class="size-4 accent-primary"
                />
              </TableCell>
              <TableCell class="font-medium text-foreground">
                <div class="flex items-center gap-2">
                  <img
                    :src="friend.avatar || favicon_url(friend.url)"
                    :alt="friend.name"
                    class="size-8 shrink-0 rounded-lg object-cover bg-muted"
                    loading="lazy"
                    @error="($event.target as HTMLImageElement).style.display='none'"
                  />
                  <span class="truncate">{{ friend.name }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <a
                    :href="friend.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm text-muted-foreground hover:text-primary truncate block max-w-[200px]"
                    :title="friend.url"
                  >
                    {{ truncate_url(friend.url) }}
                  </a>
                </div>
              </TableCell>
              <TableCell class="hidden md:table-cell text-sm text-muted-foreground max-w-[200px]">
                <span class="truncate block">{{ friend.description || '-' }}</span>
              </TableCell>
              <TableCell>
                <span
                  class="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full"
                  :class="status_badge_variant(friend.status)"
                >
                  {{ status_label(friend.status) }}
                </span>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground whitespace-nowrap">{{ friend.created_at }}</TableCell>
              <TableCell class="text-right" @click.stop>
                <div class="flex items-center justify-end gap-0.5">
                  <template v-if="friend.status !== 'approved'">
                    <Button variant="ghost" size="icon-sm" title="通过" @click="approve_friend(friend.id)">
                      <Icon icon="lucide:check" class="size-3.5 text-green-600" />
                    </Button>
                  </template>
                  <template v-if="friend.status !== 'rejected'">
                    <Button variant="ghost" size="icon-sm" title="拒绝" @click="reject_friend(friend.id)">
                      <Icon icon="lucide:x" class="size-3.5 text-red-500" />
                    </Button>
                  </template>
                  <Button variant="ghost" size="icon-sm" title="编辑" @click="open_edit_sheet(friend)">
                    <Icon icon="lucide:pen" class="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="删除"
                    class="text-destructive hover:text-destructive"
                    @click="delete_friend(friend.id)"
                  >
                    <Icon icon="lucide:trash-2" class="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            <!-- 展开完整内容 -->
            <TableRow v-if="expanded_ids.has(friend.id)" class="bg-muted/20">
              <TableCell :colspan="7" class="p-0">
                <div class="px-6 py-3 space-y-2 text-sm border-t border-border">
                  <div class="flex gap-3 items-center">
                    <span class="text-muted-foreground shrink-0 w-12">头像:</span>
                    <img
                      :src="friend.avatar || favicon_url(friend.url)"
                      :alt="friend.name"
                      class="size-8 rounded-lg object-cover bg-muted"
                      loading="lazy"
                      @error="($event.target as HTMLImageElement).style.display='none'"
                    />
                  </div>
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">名称:</span>
                    <span>{{ friend.name }}</span>
                  </div>
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">链接:</span>
                    <a :href="friend.url" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline truncate">{{ friend.url }}</a>
                  </div>
                  <div v-if="friend.description" class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">描述:</span>
                    <span class="text-muted-foreground">{{ friend.description }}</span>
                  </div>
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">创建日期:</span>
                    <span class="text-muted-foreground">{{ friend.created_at }}</span>
                  </div>
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">状态:</span>
                    <span
                      class="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full"
                      :class="status_badge_variant(friend.status)"
                    >
                      {{ status_label(friend.status) }}
                    </span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- 空状态 -->
          <TableRow v-if="paged_friends.length === 0">
            <TableCell :colspan="7" class="text-center py-12 text-muted-foreground">
              没有找到匹配的友人
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
          <SheetTitle>{{ editing_id ? '编辑友人' : '添加友人' }}</SheetTitle>
          <SheetDescription>
            {{ editing_id ? '修改友链信息' : '添加一个新的友链' }}
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 space-y-4 px-6 py-4">
          <div class="space-y-2">
            <Label for="name">名称 *</Label>
            <Input id="name" v-model="form_data.name" placeholder="站点名称" />
          </div>
          <div class="space-y-2">
            <Label for="url">URL *</Label>
            <Input id="url" v-model="form_data.url" placeholder="https://example.com" />
          </div>
          <div class="space-y-2">
            <Label for="avatar">头像 URL <span class="text-muted-foreground font-normal text-xs">（留空则自动使用网站图标）</span></Label>
            <Input id="avatar" v-model="form_data.avatar" placeholder="留空则自动使用网站图标" @input="avatar_dirty = true" />
            <div v-if="extract_domain(form_data.url)" class="flex items-center gap-3 pt-1">
              <img
                :src="form_data.avatar || favicon_url(form_data.url)"
                alt="avatar preview"
                class="size-8 rounded-lg object-cover bg-muted"
                @error="($event.target as HTMLImageElement).style.display='none'"
              />
              <span class="text-xs text-muted-foreground">
                {{ form_data.avatar ? '自定义' : '自动获取' }}：{{ extract_domain(form_data.url) }}
              </span>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="description">描述</Label>
            <Textarea id="description" v-model="form_data.description" placeholder="站点描述" :rows="3" />
          </div>
        </div>

        <SheetFooter>
          <SheetClose as-child>
            <Button variant="outline">取消</Button>
          </SheetClose>
          <Button
            :disabled="!form_data.name.trim() || !form_data.url.trim() || saving"
            @click="save_friend"
          >
            {{ saving ? '保存中...' : editing_id ? '保存' : '添加' }}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>
