<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue-sonner';
import { Icon } from '@iconify/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/admin/components/ui/input';
import { Badge } from '@/admin/components/ui/badge';
import { Label } from '@/admin/components/ui/label';
import type { Gallery } from '@/lib/types/gallery';

const router = useRouter();
const route = useRoute();
const gallery_id = route.params.id as string;

const loading = ref(true);
const saving = ref(false);
const load_error = ref('');
const not_found = ref(false);

const title = ref('');
const tags = ref<string[]>([]);
const photos = ref<string[]>([]);
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
function add_photo_url() {
  const url = url_input.value.trim();
  if (url && !photos.value.includes(url)) {
    photos.value.push(url);
    if (!cover_path.value) cover_path.value = url;
  }
  url_input.value = '';
}

// File upload
const upload_loading = ref(false);
const file_input = ref<HTMLInputElement | null>(null);

async function handle_upload(files: FileList | null) {
  if (!files?.length) return;
  upload_loading.value = true;
  let success_count = 0;
  let fail_count = 0;
  try {
    for (const file of Array.from(files)) {
      try {
        const path = await upload_file(file);
        photos.value.push(path);
        if (!cover_path.value) cover_path.value = path;
        success_count++;
      } catch {
        fail_count++;
      }
    }
    if (success_count > 0 && fail_count === 0) {
      toast.success(`成功上传 ${success_count} 张照片`);
    } else if (success_count > 0 && fail_count > 0) {
      toast.warning(`成功 ${success_count} 张，${fail_count} 张失败`);
    } else {
      toast.error('上传失败');
    }
  } finally {
    upload_loading.value = false;
    if (file_input.value) file_input.value.value = '';
  }
}

async function upload_file(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: base64 }),
        });
        if (!res.ok) throw new Error('上传失败');
        const result = await res.json();
        resolve(result.path);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

function set_cover(path: string) {
  cover_path.value = cover_path.value === path ? '' : path;
}

function remove_photo(path: string) {
  photos.value = photos.value.filter((p) => p !== path);
  if (cover_path.value === path) {
    cover_path.value = photos.value.length > 0 ? photos.value[0] : '';
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
    const res = await fetch('/content/gallery.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { galleries: Gallery[] } = await res.json();
    const gallery = data.galleries.find((g) => g.id === gallery_id);
    if (!gallery) {
      not_found.value = true;
      return;
    }
    title.value = gallery.title;
    tags.value = [...gallery.tags];
    photos.value = [...gallery.photos];
    cover_path.value = gallery.cover_path || (gallery.photos.length > 0 ? gallery.photos[0] : '');
  } catch (e) {
    load_error.value = e instanceof Error ? e.message : '加载失败';
  } finally {
    loading.value = false;
  }
});

async function save() {
  if (!title.value.trim()) return;
  saving.value = true;
  try {
    const res = await fetch('/content/gallery.json');
    const data: { galleries: Gallery[] } = await res.json();
    const idx = data.galleries.findIndex((g) => g.id === gallery_id);
    if (idx < 0) throw new Error('相册不存在');

    data.galleries[idx] = {
      ...data.galleries[idx],
      title: title.value.trim(),
      cover_path: cover_path.value,
      tags: [...tags.value],
      photos: [...photos.value],
    };

    const save_res = await fetch('/api/gallery/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ galleries: data.galleries }),
    });

    if (!save_res.ok) throw new Error('保存失败');
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
            :key="photo"
            class="group relative rounded-lg border border-border overflow-hidden aspect-square bg-muted"
            :class="{ 'ring-2 ring-primary': photo === cover_path }"
          >
            <img
              :src="photo"
              alt=""
              class="size-full object-cover cursor-pointer"
              @click="set_cover(photo)"
              @error="($event.target as HTMLImageElement).style.display='none'"
            />
            <!-- Cover badge -->
            <div
              v-if="photo === cover_path"
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
