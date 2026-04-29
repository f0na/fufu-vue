<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import { Badge } from '@/admin/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/admin/components/ui/table';
import type { Post } from '@/lib/types/post';

const posts = reactive<Post[]>([]);
const loading = ref(true);
const load_error = ref('');

onMounted(async () => {
  try {
    const res = await fetch('/content/posts/_index.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Post[] = await res.json();
    posts.splice(0, posts.length, ...(Array.isArray(data) ? data : []));
  } catch (e) {
    load_error.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
});

const search_query = ref('');
const current_page = ref(1);
const page_size = 15;
const selected_slugs = ref<string[]>([]);
const expanded_slugs = ref(new Set<string>());
function toggle_expand(slug: string) {
  const set = expanded_slugs.value;
  if (set.has(slug)) set.delete(slug);
  else set.add(slug);
}

const filtered_posts = computed(() => {
  if (!search_query.value) return posts;
  const q = search_query.value.toLowerCase();
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
});

const total_pages = computed(() => Math.ceil(filtered_posts.value.length / page_size));

const paged_posts = computed(() => {
  const start = (current_page.value - 1) * page_size;
  return filtered_posts.value.slice(start, start + page_size);
});

const all_selected = computed(
  () => paged_posts.value.length > 0 && selected_slugs.value.length === paged_posts.value.length
);

function toggle_select(slug: string) {
  const idx = selected_slugs.value.indexOf(slug);
  if (idx >= 0) selected_slugs.value.splice(idx, 1);
  else selected_slugs.value.push(slug);
}

function select_all() {
  if (selected_slugs.value.length === paged_posts.value.length) {
    selected_slugs.value = [];
  } else {
    selected_slugs.value = paged_posts.value.map((p) => p.slug);
  }
}

function delete_post(slug: string) {
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx >= 0) posts.splice(idx, 1);
  const sel_idx = selected_slugs.value.indexOf(slug);
  if (sel_idx >= 0) selected_slugs.value.splice(sel_idx, 1);
}

function delete_selected() {
  if (selected_slugs.value.length === 0) return;
  const slug_set = new Set(selected_slugs.value);
  for (let i = posts.length - 1; i >= 0; i--) {
    if (slug_set.has(posts[i].slug)) posts.splice(i, 1);
  }
  selected_slugs.value = [];
}
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-foreground">文章管理</h1>
      <Button size="sm" as-child>
        <RouterLink to="/admin/posts/new">
          <Icon icon="lucide:plus" class="size-4 mr-1" />
          新建文章
        </RouterLink>
      </Button>
    </div>

    <!-- 搜索和操作条 -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative max-w-xs w-full">
        <Icon
          icon="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
        />
        <Input v-model="search_query" placeholder="搜索标题、slug 或标签..." class="pl-9 h-9" />
      </div>
      <Button
        v-if="selected_slugs.length > 0"
        variant="outline"
        size="sm"
        class="text-destructive"
        @click="delete_selected"
      >
        <Icon icon="lucide:trash-2" class="size-3.5 mr-1" />
        删除选中 ({{ selected_slugs.length }})
      </Button>
      <div class="text-sm text-muted-foreground ml-auto">共 {{ filtered_posts.length }} 条</div>
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

    <!-- 文章表格 -->
    <div v-else class="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10">
              <input
                type="checkbox"
                :checked="all_selected"
                :indeterminate="selected_slugs.length > 0 && !all_selected"
                @change="select_all"
                class="size-4 accent-primary"
              />
            </TableHead>
            <TableHead class="w-64">标题</TableHead>
            <TableHead class="w-36">Slug</TableHead>
            <TableHead class="w-36">标签</TableHead>
            <TableHead class="w-24">日期</TableHead>
            <TableHead class="w-32 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-for="post in paged_posts" :key="post.slug">
            <TableRow
              class="cursor-pointer"
              :class="[
                selected_slugs.includes(post.slug) ? 'bg-muted/30' : '',
                expanded_slugs.has(post.slug) ? 'border-b-0' : '',
              ]"
              @click="toggle_expand(post.slug)"
            >
              <TableCell @click.stop>
                <input
                  type="checkbox"
                  :checked="selected_slugs.includes(post.slug)"
                  @change="toggle_select(post.slug)"
                  class="size-4 accent-primary"
                />
              </TableCell>
              <TableCell class="font-medium text-foreground">
                <span class="truncate block max-w-60">{{ post.title }}</span>
              </TableCell>
              <TableCell>
                <code class="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {{ post.slug }}
                </code>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="tag in post.tags.slice(0, 2)"
                    :key="tag"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ tag }}
                  </Badge>
                  <span v-if="post.tags.length > 2" class="text-xs text-muted-foreground">
                    +{{ post.tags.length - 2 }}
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ post.date }}</TableCell>
              <TableCell class="text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" title="编辑" as-child>
                    <RouterLink :to="`/admin/posts/${post.slug}/edit`">
                      <Icon icon="lucide:pen" class="size-3.5" />
                    </RouterLink>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="删除"
                    class="text-destructive hover:text-destructive"
                    @click="delete_post(post.slug)"
                  >
                    <Icon icon="lucide:trash-2" class="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            <!-- 展开完整内容 -->
            <TableRow v-if="expanded_slugs.has(post.slug)" class="bg-muted/20">
              <TableCell :colspan="6" class="p-0">
                <div class="px-6 py-3 space-y-2 text-sm border-t border-border">
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">标题:</span>
                    <span>{{ post.title }}</span>
                  </div>
                  <div class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">Slug:</span>
                    <code class="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{{ post.slug }}</code>
                  </div>
                  <div v-if="post.tags?.length" class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">标签:</span>
                    <div class="flex flex-wrap gap-1">
                      <Badge v-for="tag in post.tags" :key="tag" variant="secondary" class="text-xs">{{ tag }}</Badge>
                    </div>
                  </div>
                  <div v-if="post.excerpt" class="flex gap-3">
                    <span class="text-muted-foreground shrink-0 w-12">摘要:</span>
                    <span class="text-muted-foreground">{{ post.excerpt }}</span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- 空状态 -->
          <TableRow v-if="paged_posts.length === 0">
            <TableCell :colspan="6" class="text-center py-12 text-muted-foreground">
              没有找到匹配的文章
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
  </div>
</template>
