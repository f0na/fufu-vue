<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { get_gallery_by_id } from '@/lib/gallery-data';
import PostComments from '@/components/post/post-comments.vue';
import type { PhotoState } from '@/lib/types/gallery';

const router = useRouter();

interface Props {
  gallery_id: string;
}
const props = defineProps<Props>();

const gallery_title = ref('');
const photos = ref<string[]>([]);

// 评论配置
const comments_config = {
  repo: 'f0na/fufu-next',
  repo_id: 'R_kgDOSF1Eww',
  category: 'Announcements',
  category_id: 'DIC_kwDOSF1Ew8C7HmC',
  mapping: 'pathname' as const,
};

interface SavedState {
  photo_states: PhotoState[];
  canvas_scale: number;
  canvas_offset_x: number;
  canvas_offset_y: number;
}

const DEFAULT_PHOTO_WIDTH = 200;

const random_rotation = () => Math.random() * 30 - 15;

const is_mobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

const init_photo_states = (photo_list: string[]): PhotoState[] => {
  const viewport_width = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewport_height = typeof window !== 'undefined' ? window.innerHeight : 800;
  const mobile = is_mobile();
  const photo_width = mobile ? 140 : DEFAULT_PHOTO_WIDTH;

  return photo_list.map((photo, index) => ({
    id: photo,
    x: 30 + Math.random() * Math.max(100, viewport_width - photo_width - 60),
    y: 80 + Math.random() * Math.max(100, viewport_height - 300) + index * (mobile ? 15 : 25),
    rotation: random_rotation(),
    z_index: index,
  }));
};

const get_storage_key = (id: string) => `gallery_${id}_state`;

// 照片状态
const photo_states = ref<PhotoState[]>([]);
const max_z_index = ref(0);

// 画布状态
const canvas_scale = ref(1);
const canvas_offset_x = ref(0);
const canvas_offset_y = ref(0);

// 灯箱状态
const lightbox_photo = ref<string | null>(null);
const lightbox_rotation = ref(0);

// 评论抽屉
const show_comments = ref(false);

// 画布 ref
const canvas_ref = ref<HTMLDivElement | null>(null);

// 移动端检测
const mobile = ref(typeof window !== 'undefined' && window.innerWidth < 768);

// 拖动状态跟踪
const dragging_photo = ref<string | null>(null);
const drag_start_x = ref(0);
const drag_start_y = ref(0);
const photo_start_x = ref(0);
const photo_start_y = ref(0);
const has_moved = ref(false);

// 旋转状态跟踪
const rotating_photo = ref<string | null>(null);
const rotate_start_angle = ref(0);
const rotate_center_x = ref(0);
const rotate_center_y = ref(0);
const initial_rotation = ref(0);

// 画布拖动状态
const canvas_dragging = ref(false);
const canvas_drag_start_x = ref(0);
const canvas_drag_start_y = ref(0);
const canvas_start_offset_x = ref(0);
const canvas_start_offset_y = ref(0);

// 加载状态
const loading = ref(true);

// 加载相册数据
async function load_gallery(gallery_id: string) {
  const g = await get_gallery_by_id(gallery_id);
  if (!g) {
    router.replace('/gallery');
    return;
  }

  gallery_title.value = g.title;
  photos.value = g.photos;

  const storage_key = get_storage_key(gallery_id);
  const saved = localStorage.getItem(storage_key);

  if (saved) {
    try {
      const parsed: SavedState = JSON.parse(saved);

      if (parsed.canvas_scale) canvas_scale.value = parsed.canvas_scale;
      if (parsed.canvas_offset_x) canvas_offset_x.value = parsed.canvas_offset_x;
      if (parsed.canvas_offset_y) canvas_offset_y.value = parsed.canvas_offset_y;

      const viewport_width = window.innerWidth;
      const viewport_height = window.innerHeight;
      const photo_width = mobile.value ? 140 : DEFAULT_PHOTO_WIDTH;

      const all_states = g.photos.map((photo, index) => {
        const existing = parsed.photo_states?.find((s) => s.id === photo);
        return (
          existing || {
            id: photo,
            x: 30 + Math.random() * Math.max(100, viewport_width - photo_width - 60),
            y:
              80 +
              Math.random() * Math.max(100, viewport_height - 300) +
              index * (mobile.value ? 15 : 25),
            rotation: random_rotation(),
            z_index: index,
          }
        );
      });
      photo_states.value = all_states;
      max_z_index.value = Math.max(...all_states.map((s) => s.z_index)) + 1;
    } catch {
      photo_states.value = init_photo_states(g.photos);
      max_z_index.value = g.photos.length;
    }
  } else {
    photo_states.value = init_photo_states(g.photos);
    max_z_index.value = g.photos.length;
  }

  loading.value = false;
}

watch(
  () => props.gallery_id,
  (gallery_id) => {
    load_gallery(gallery_id);
  }
);

// 保存状态
watch([photo_states, canvas_scale, canvas_offset_x, canvas_offset_y], () => {
  if (photo_states.value.length > 0) {
    const storage_key = get_storage_key(props.gallery_id);
    const state: SavedState = {
      photo_states: photo_states.value,
      canvas_scale: canvas_scale.value,
      canvas_offset_x: canvas_offset_x.value,
      canvas_offset_y: canvas_offset_y.value,
    };
    localStorage.setItem(storage_key, JSON.stringify(state));
  }
});

// 滚轮缩放
function handle_wheel(e: WheelEvent) {
  if (
    lightbox_photo.value ||
    show_comments.value ||
    dragging_photo.value ||
    rotating_photo.value ||
    canvas_dragging.value
  )
    return;

  e.preventDefault();

  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  const new_scale = canvas_scale.value * delta;
  canvas_scale.value = Math.min(3, Math.max(0.3, new_scale));
}

onMounted(() => {
  const container = canvas_ref.value;
  if (container) {
    container.addEventListener('wheel', handle_wheel, { passive: false });
  }

  // 延迟加载相册数据，优先渲染页面框架
  requestAnimationFrame(() => load_gallery(props.gallery_id));
});

onUnmounted(() => {
  const container = canvas_ref.value;
  if (container) {
    container.removeEventListener('wheel', handle_wheel);
  }
});

// 提升照片层级
function bring_to_top(photo_id: string) {
  max_z_index.value++;
  const new_z = max_z_index.value;
  photo_states.value = photo_states.value.map((state) =>
    state.id === photo_id ? { ...state, z_index: new_z } : state
  );
}

// 鼠标移动处理
function handle_mouse_move(e: MouseEvent) {
  // 1. 处理旋转
  if (rotating_photo.value) {
    const current_angle =
      Math.atan2(e.clientY - rotate_center_y.value, e.clientX - rotate_center_x.value) *
      (180 / Math.PI);

    const new_rotation = initial_rotation.value + (current_angle - rotate_start_angle.value);

    photo_states.value = photo_states.value.map((state) =>
      state.id === rotating_photo.value ? { ...state, rotation: new_rotation } : state
    );
    return;
  }

  // 2. 处理照片拖动
  if (dragging_photo.value && !canvas_dragging.value) {
    const dx = e.clientX - drag_start_x.value;
    const dy = e.clientY - drag_start_y.value;

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      has_moved.value = true;

      photo_states.value = photo_states.value.map((state) =>
        state.id === dragging_photo.value
          ? {
              ...state,
              x: photo_start_x.value + dx / canvas_scale.value,
              y: photo_start_y.value + dy / canvas_scale.value,
            }
          : state
      );
    }
    return;
  }

  // 3. 处理画布拖动
  if (canvas_dragging.value) {
    const dx = e.clientX - canvas_drag_start_x.value;
    const dy = e.clientY - canvas_drag_start_y.value;

    canvas_offset_x.value = canvas_start_offset_x.value + dx;
    canvas_offset_y.value = canvas_start_offset_y.value + dy;
  }
}

function handle_mouse_up() {
  if (rotating_photo.value) {
    rotating_photo.value = null;
    return;
  }

  if (dragging_photo.value) {
    const photo_id = dragging_photo.value;

    if (!has_moved.value) {
      const state = photo_states.value.find((s) => s.id === photo_id);
      if (state) {
        lightbox_photo.value = photo_id;
        lightbox_rotation.value = state.rotation;
      }
    }

    dragging_photo.value = null;
    has_moved.value = false;
    return;
  }

  if (canvas_dragging.value) {
    canvas_dragging.value = false;
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handle_mouse_move);
  document.addEventListener('mouseup', handle_mouse_up);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handle_mouse_move);
  document.removeEventListener('mouseup', handle_mouse_up);
});

function handle_photo_drag_start(e: MouseEvent, photo_id: string, state: PhotoState) {
  e.preventDefault();
  e.stopPropagation();

  dragging_photo.value = photo_id;
  drag_start_x.value = e.clientX;
  drag_start_y.value = e.clientY;
  photo_start_x.value = state.x;
  photo_start_y.value = state.y;
  has_moved.value = false;

  bring_to_top(photo_id);
}

function handle_rotate_start(e: MouseEvent, photo_id: string, state: PhotoState) {
  e.preventDefault();
  e.stopPropagation();

  rotating_photo.value = photo_id;
  bring_to_top(photo_id);

  const photo_width = (mobile.value ? 140 : DEFAULT_PHOTO_WIDTH) + 24;
  const photo_height = (mobile.value ? 140 : DEFAULT_PHOTO_WIDTH) + 24;

  const center_x = (state.x + photo_width / 2) * canvas_scale.value + canvas_offset_x.value;
  const center_y = (state.y + photo_height / 2) * canvas_scale.value + canvas_offset_y.value + 60;

  rotate_center_x.value = center_x;
  rotate_center_y.value = center_y;
  initial_rotation.value = state.rotation;
  rotate_start_angle.value =
    Math.atan2(e.clientY - center_y, e.clientX - center_x) * (180 / Math.PI);
}

function handle_canvas_drag_start(e: MouseEvent) {
  if (dragging_photo.value || rotating_photo.value) return;

  e.preventDefault();

  canvas_dragging.value = true;
  canvas_drag_start_x.value = e.clientX;
  canvas_drag_start_y.value = e.clientY;
  canvas_start_offset_x.value = canvas_offset_x.value;
  canvas_start_offset_y.value = canvas_offset_y.value;
}

function handle_zoom(delta: number) {
  canvas_scale.value = Math.min(Math.max(canvas_scale.value + delta, 0.3), 3);
}

function handle_reset() {
  canvas_scale.value = 1;
  canvas_offset_x.value = 0;
  canvas_offset_y.value = 0;
}

// 画布照片宽度
const photo_width = computed(() => (mobile.value ? 140 : 200));
</script>

<template>
  <div
    ref="canvas_ref"
    class="fixed inset-0 w-screen h-screen overflow-hidden bg-muted/30 select-none"
    @mousedown="handle_canvas_drag_start"
  >
    <!-- 工具栏 -->
    <div class="absolute top-4 left-4 z-50">
      <button
        @click="() => router.push('/gallery')"
        class="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
      >
        <Icon icon="lucide:arrow-left" class="w-5 h-5 text-slate-600" />
      </button>
    </div>

    <!-- 右侧工具按钮 -->
    <div class="absolute top-4 right-4 z-50 flex items-center gap-2">
      <button
        @click="handle_zoom(-0.1)"
        class="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
        title="缩小"
      >
        <Icon icon="lucide:zoom-out" class="w-5 h-5 text-slate-600" />
      </button>

      <button
        @click="handle_zoom(0.1)"
        class="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
        title="放大"
      >
        <Icon icon="lucide:zoom-in" class="w-5 h-5 text-slate-600" />
      </button>

      <button
        @click="handle_reset"
        class="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
        title="重置"
      >
        <Icon icon="lucide:rotate-ccw" class="w-5 h-5 text-slate-600" />
      </button>

      <button
        class="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
        title="点赞"
      >
        <Icon icon="lucide:heart" class="w-5 h-5 text-slate-600" />
      </button>

      <button
        @click="show_comments = true"
        class="w-10 h-10 bg-white/80 hover:bg-white shadow-md rounded-full flex items-center justify-center transition-colors"
        title="评论"
      >
        <Icon icon="lucide:message-circle" class="w-5 h-5 text-slate-600" />
      </button>
    </div>

    <!-- 画布容器 -->
    <div
      class="absolute"
      :style="{
        transform: `translate(${canvas_offset_x}px, ${canvas_offset_y}px) scale(${canvas_scale})`,
        transformOrigin: '0 0',
      }"
    >
      <!-- 照片 -->
      <div
        v-for="state in photo_states"
        :key="state.id"
        class="absolute"
        :style="{
          left: state.x + 'px',
          top: state.y + 'px',
          transform: `rotate(${state.rotation}deg)`,
          zIndex: state.z_index,
        }"
      >
        <div
          class="bg-white p-3 shadow-lg relative group"
          style="display: inline-block"
          @mousedown="handle_photo_drag_start($event, state.id, state)"
        >
          <img
            :src="state.id"
            alt="photo"
            :width="photo_width"
            :style="{
              width: mobile ? '140px' : '200px',
              minWidth: mobile ? '140px' : '200px',
              height: 'auto',
              maxHeight: '300px',
              display: 'block',
            }"
            class="object-cover"
            draggable="false"
          />

          <!-- 旋转手柄 -->
          <div
            class="absolute -top-1 -right-1 bg-white rounded-full shadow-md cursor-grab flex items-center justify-center hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            :style="{ width: mobile ? '32px' : '24px', height: mobile ? '32px' : '24px' }"
            @mousedown="handle_rotate_start($event, state.id, state)"
          >
            <Icon
              icon="lucide:rotate-cw"
              class="text-slate-500"
              :style="{ width: mobile ? '16px' : '14px', height: mobile ? '16px' : '14px' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 灯箱 -->
    <Transition name="lightbox">
      <div
        v-if="lightbox_photo"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60"
        @click="lightbox_photo = null"
      >
        <div
          class="bg-white p-4 shadow-2xl transition-transform duration-300"
          :style="{
            transform: `scale(1) rotate(0deg)`,
          }"
          @click.stop
        >
          <img :src="lightbox_photo" alt="photo" class="max-w-[80vw] max-h-[80vh] object-contain" />
        </div>

        <button
          class="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
          @click="lightbox_photo = null"
        >
          <Icon icon="lucide:x" class="w-6 h-6 text-white" />
        </button>
      </div>
    </Transition>

    <!-- 评论抽屉 -->
    <Transition name="slide">
      <div v-if="show_comments" class="fixed inset-0 z-[100]">
        <div class="absolute inset-0 bg-black/30" @click="show_comments = false" />

        <div
          class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto"
        >
          <div class="p-4">
            <button
              class="mb-4 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center"
              @click="show_comments = false"
            >
              <Icon icon="lucide:x" class="w-4 h-4" />
            </button>

            <PostComments
              :repo="comments_config.repo"
              :repo_id="comments_config.repo_id"
              :category="comments_config.category"
              :category_id="comments_config.category_id"
              :mapping="comments_config.mapping"
              section_id="gallery-comments"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 灯箱淡入淡出 */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

/* 评论抽屉滑入滑出 */
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
</style>
