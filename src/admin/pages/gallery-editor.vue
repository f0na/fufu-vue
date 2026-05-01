<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import { Badge } from '@/admin/components/ui/badge';
import { Label } from '@/admin/components/ui/label';
import type { GalleryPhoto } from '@/lib/types/gallery';
import * as galleries_api from '@/lib/api/galleries';
import { upload_to_github } from '@/lib/api/upload';
import { proxy_image_url } from '@/lib/image-proxy';

const router = useRouter();
const route = useRoute();
const gallery_id = route.params.id as string;

const loading = ref(true);
const saving = ref(false);
const load_error = ref('');
const not_found = ref(false);

const title = ref('');
const tags = ref<string[]>([]);
const photos = ref<GalleryPhoto[]>([]);
const cover_path = ref('');

// Tags management
const tag_input = ref('');
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

// URL add
const url_input = ref('');
async function add_photo_url() {
  const url = url_input.value.trim();
  if (!url) return;
  url_input.value = '';
  try {
    const created = await galleries_api.add_photos(gallery_id, [url]);
    photos.value.push(...created);
    if (!cover_path.value) cover_path.value = url;
  } catch (e) {
    toast.error('添加图片链接失败：' + (e instanceof Error ? e.message : '未知错误'));
  }
}

// File upload
const upload_loading = ref(false);
const file_input = ref<HTMLInputElement | null>(null);

async function handle_upload(files: FileList | null) {
  if (!files?.length) return;
  upload_loading.value = true;
  const uploaded_urls: string[] = [];
  let fail_count = 0;
  let last_error = '';
  try {
    for (const file of Array.from(files)) {
      try {
        const url = await upload_to_github(file);
        uploaded_urls.push(url);
      } catch (e) {
        last_error = e instanceof Error ? e.message : '未知错误';
        fail_count++;
      }
    }
    if (uploaded_urls.length > 0) {
      const created = await galleries_api.add_photos(gallery_id, uploaded_urls);
      photos.value.push(...created);
      if (!cover_path.value && created.length > 0) {
        cover_path.value = created[0].path;
      }
    }
    if (uploaded_urls.length > 0 && fail_count === 0) {
      toast.success(`成功上传 ${uploaded_urls.length} 张照片`);
    } else if (uploaded_urls.length > 0 && fail_count > 0) {
      toast.warning(`成功 ${uploaded_urls.length} 张，${fail_count} 张失败`);
    } else {
      toast.error(`上传失败：${last_error}`);
    }
  } finally {
    upload_loading.value = false;
    if (file_input.value) file_input.value.value = '';
  }
}

function set_cover(photo: GalleryPhoto) {
  cover_path.value = cover_path.value === photo.path ? '' : photo.path;
}

async function remove_photo(photo: GalleryPhoto) {
  try {
    await galleries_api.delete_photo(photo.id);
    photos.value = photos.value.filter((p) => p.id !== photo.id);
    if (cover_path.value === photo.path) {
      cover_path.value = photos.value.length > 0 ? photos.value[0].path : '';
    }
  } catch (e) {
    toast.error('删除失败：' + (e instanceof Error ? e.message : '未知错误'));
  }
}

function move_photo(from: number, direction: -1 | 1) {
  const to = from + direction;
  if (to < 0 || to >= photos.value.length) return;
  [photos.value[from], photos.value[to]] = [photos.value[to], photos.value[from]];
}

// Load gallery data
onMounted(async () => {
  try {
    const gallery = await galleries_api.get_gallery_by_id(gallery_id);
    title.value = gallery.title;
    tags.value = typeof gallery.tags === 'string' ? JSON.parse(gallery.tags as string) : gallery.tags;
    cover_path.value = gallery.cover_path || '';
    photos.value = Array.isArray(gallery.photos)
      ? gallery.photos.map((p) => (typeof p === 'object' && p !== null ? (p as GalleryPhoto) : { id: '', gallery_id: gallery_id, path: p, created_at: '', deleted_at: null }))
      : [];
  } catch (e) {
    load_error.value = e instanceof Error ? e.message : '从后端加载相册失败';
  } finally {
    loading.value = false;
  }
});

async function save() {
  if (!title.value.trim()) return;
  // 把输入框中未添加的文本也作为标签
  const t = tag_input.value.trim();
  if (t && !tags.value.includes(t)) tags.value.push(t);
  tag_input.value = '';
  saving.value = true;
  try {
    await galleries_api.update_gallery(gallery_id, {
      title: title.value.trim(),
      cover_path: cover_path.value,
      tags: [...tags.value],
    });
    toast.success('相册已保存');
  } catch (e) {
    toast.error('保存失败：' + (e instanceof Error ? e.message : '未知错误'));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <!-- 顶部导航 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="sm" @click="router.push('/admin/gallery')">
          <Icon icon="lucide:arrow-left" class="size-4 mr-1" />
          返回
        </Button>
        <h1 class="text-2xl font-semibold text-foreground" v-if="title">{{ title }}</h1>
      </div>
      <Button :disabled="!title.trim() || saving" @click.prevent="save">
        <Icon icon="lucide:check" class="size-4 mr-1" />
        {{ saving ? '保存中...' : '保存' }}
      </Button>
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

    <!-- 未找到 -->
    <div
      v-else-if="not_found"
      class="flex flex-col items-center justify-center py-16 text-muted-foreground"
    >
      <Icon icon="lucide:image-off" class="size-8 mb-2" />
      <p>未找到该相册</p>
    </div>

    <!-- 编辑内容 -->
    <div v-else class="space-y-8">
      <!-- 基本信息 -->
      <section class="space-y-4">
        <h2 class="text-lg font-medium text-foreground">基本信息</h2>
        <div class="space-y-2">
          <Label for="title">标题 *</Label>
          <Input id="title" v-model="title" placeholder="相册标题" />
        </div>
        <div class="space-y-2">
          <Label>标签</Label>
          <div class="flex items-center gap-2">
            <Input v-model="tag_input" placeholder="输入标签后添加" class="flex-1" @keydown.enter.prevent="add_tag" />
            <Button variant="outline" size="sm" @click="add_tag" :disabled="!tag_input.trim()">添加</Button>
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
      </section>

      <!-- 分隔线 -->
      <div class="border-t border-border" />

      <!-- 照片管理 -->
      <section class="space-y-4">
        <h2 class="text-lg font-medium text-foreground">照片管理</h2>

        <!-- 上传 -->
        <div class="space-y-2">
          <Label>上传照片</Label>
          <div class="flex items-center gap-2">
            <label
              class="flex items-center gap-2 px-4 py-2 rounded-md border border-border cursor-pointer text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              :class="{ 'opacity-50 pointer-events-none': upload_loading }"
            >
              <Icon icon="lucide:upload" class="size-4" />
              {{ upload_loading ? '上传中...' : '选择文件上传' }}
              <input
                ref="file_input"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handle_upload(($event.target as HTMLInputElement).files)"
              />
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <Label>添加图片链接</Label>
          <div class="flex items-center gap-2">
            <Input v-model="url_input" placeholder="输入图片 URL" class="flex-1" @keydown.enter.prevent="add_photo_url" />
            <Button variant="outline" size="sm" @click="add_photo_url" :disabled="!url_input.trim()">添加</Button>
          </div>
        </div>

        <!-- 照片网格 -->
        <div v-if="photos.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          <div
            v-for="(photo, idx) in photos"
            :key="photo.id || photo.path"
            class="group relative rounded-lg border border-border overflow-hidden aspect-square bg-muted"
            :class="{ 'ring-2 ring-primary': photo.path === cover_path }"
          >
            <img
              :src="proxy_image_url(photo.path)"
              alt=""
              class="size-full object-cover cursor-pointer"
              @click="set_cover(photo)"
              @error="($event.target as HTMLImageElement).style.display='none'"
            />
            <!-- Cover badge -->
            <div
              v-if="photo.path === cover_path"
              class="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-medium"
            >
              封面
            </div>
            <!-- Action buttons -->
            <div
              class="absolute inset-x-0 bottom-0 flex items-center justify-between px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div class="flex items-center gap-1">
                <button
                  class="size-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"
                  title="左移"
                  :disabled="idx === 0"
                  @click="move_photo(idx, -1)"
                >
                  <Icon icon="lucide:chevron-left" class="size-3.5" />
                </button>
                <button
                  class="size-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"
                  title="右移"
                  :disabled="idx === photos.length - 1"
                  @click="move_photo(idx, 1)"
                >
                  <Icon icon="lucide:chevron-right" class="size-3.5" />
                </button>
              </div>
              <button
                class="size-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white"
                title="删除"
                @click="remove_photo(photo)"
              >
                <Icon icon="lucide:x" class="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg"
        >
          <Icon icon="lucide:image-plus" class="size-10 mb-2" />
          <p class="text-sm">暂无照片，请上传或添加图片链接</p>
        </div>
      </section>
    </div>
  </div>
</template>
