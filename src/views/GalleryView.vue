<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { fetch_gallery, create_photo, update_photo, delete_photo } from '@/api/gallery'
import { post } from '@/api/request'
import { flatten_exif_orientation } from '@/utils/image'
import type { Gallery, Photo } from '@/api/types'
import PhotoCard from '@/components/gallery/PhotoCard.vue'
import PhotoViewer from '@/components/gallery/PhotoViewer.vue'
import NavMenu from '@/components/common/NavMenu.vue'
import CommentSection from '@/components/comment/CommentSection.vue'
import { ArrowLeft, Maximize2, Loader2, Upload, X, Trash2, MessageCircle } from 'lucide-vue-next'

interface PhotoState {
  id: string
  src: string
  x: number
  y: number
  rotation: number
  width: number
  height: number
  z_index: number
}

const route = useRoute()
const router = useRouter()
const { can_toggle_visibility } = useAuth()
const { success, error } = useToast()
const { confirm } = useConfirm()

// 是否移动端
const is_mobile = ref(false)

// 画布缩放（移动端）
const canvas_scale = ref(1)
const canvas_offset_x = ref(0)
const canvas_offset_y = ref(0)

// 画布拖动状态
const is_dragging_canvas = ref(false)
let drag_start_x = 0
let drag_start_y = 0
let drag_start_offset_x = 0
let drag_start_offset_y = 0

// 触摸缩放状态
let initial_pinch_distance = 0
let initial_scale = 1
let initial_offset_x = 0
let initial_offset_y = 0
let pinch_center_x = 0
let pinch_center_y = 0

// 相册信息
const gallery_info = ref<Gallery | null>(null)

// 照片数据
const photos = ref<PhotoState[]>([])

// 加载状态
const loading = ref(false)

// 当前查看的照片
const viewing_photo = ref<PhotoState | null>(null)

// 是否显示评论
const show_comments = ref(false)

// 删除模式
const delete_mode = ref(false)

// 全局最高 z-index
let global_max_z_index = 1

// 相册 ID
const gallery_id = computed(() => route.params.id as string)

function check_mobile() {
  is_mobile.value = window.innerWidth < 768
  // 切换设备时重置缩放
  if (!is_mobile.value) {
    canvas_scale.value = 1
    canvas_offset_x.value = 0
    canvas_offset_y.value = 0
  }
}

// 加载相册数据
async function load_gallery() {
  loading.value = true
  try {
    const gallery = await fetch_gallery(gallery_id.value)
    gallery_info.value = gallery
    photos.value = gallery.photos.map((p) => ({
      id: p.id,
      src: p.src,
      x: p.x,
      y: p.y,
      rotation: p.rotation,
      width: p.width || 200,
      height: p.height || 150,
      z_index: p.z_index || 1,
    }))
    global_max_z_index = Math.max(...photos.value.map((p) => p.z_index), 0) + 1
  } catch (e) {
    console.error('加载相册失败:', e)
    error('加载相册失败')
  } finally {
    loading.value = false
  }
}

// 上传照片
const upload_loading = ref(false)
const file_input_ref = ref<HTMLInputElement | null>(null)

function trigger_upload() {
  file_input_ref.value?.click()
}

interface UploadToken {
  token: string
  key: string
  domain: string
  expires_in: number
  fsize_limit: number
  upload_url: string
  download_url: string
}

async function handle_file_change(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !gallery_id.value) return

  upload_loading.value = true
  try {
    // 1. 处理图片：将 EXIF 方向"烧平"进像素
    const processed_file = await flatten_exif_orientation(file)

    // 2. 获取上传凭证
    const token_data = await post<UploadToken>('/admin/upload', { type: 'photo' })

    // 3. 上传到七牛云
    const formData = new FormData()
    formData.append('token', token_data.token)
    formData.append('key', token_data.key)
    formData.append('file', processed_file)

    const upload_response = await fetch(token_data.upload_url, {
      method: 'POST',
      body: formData,
    })

    if (!upload_response.ok) {
      throw new Error('上传到七牛云失败')
    }

    // 4. 随机位置
    const x = 50 + Math.random() * 300
    const y = 50 + Math.random() * 300
    const rotation = (Math.random() - 0.5) * 30

    // 5. 创建照片记录
    const photo = await create_photo({
      gallery_id: gallery_id.value,
      src: token_data.download_url,
      filename: file.name,
      x,
      y,
      rotation,
      width: 200,
      height: 150,
    })

    photos.value.push({
      id: photo.id,
      src: photo.src,
      x: photo.x,
      y: photo.y,
      rotation: photo.rotation,
      width: photo.width || 200,
      height: photo.height || 150,
      z_index: photo.z_index || 1,
    })
    global_max_z_index++
    success('上传成功')
  } catch (e) {
    console.error('上传失败:', e)
    error('上传失败')
  } finally {
    upload_loading.value = false
    input.value = ''
  }
}

// 删除照片
async function handle_delete_photo(photo: PhotoState) {
  const confirmed = await confirm('确定要删除这张照片吗？')
  if (!confirmed) return

  try {
    await delete_photo(photo.id)
    photos.value = photos.value.filter((p) => p.id !== photo.id)
    success('删除成功')
  } catch (e) {
    console.error('删除失败:', e)
    error('删除失败')
  }
}

function handle_photo_click(photo: PhotoState) {
  if (delete_mode.value) {
    handle_delete_photo(photo)
    return
  }
  viewing_photo.value = photo
}

function handle_drag_start(id: string) {
  global_max_z_index++
  const photo = photos.value.find((p) => p.id === id)
  if (photo) {
    photo.z_index = global_max_z_index
  }
}

// 防抖更新照片
const update_timers = new Map<string, ReturnType<typeof setTimeout>>()
const pending_updates = new Map<
  string,
  { x?: number; y?: number; rotation?: number; z_index?: number }
>()

function debounced_update_photo(
  id: string,
  data: { x?: number; y?: number; rotation?: number; z_index?: number },
) {
  // 合并待更新的数据
  const existing = pending_updates.get(id) || {}
  pending_updates.set(id, { ...existing, ...data })

  // 清除之前的定时器
  const existing_timer = update_timers.get(id)
  if (existing_timer) {
    clearTimeout(existing_timer)
  }

  // 设置新的定时器，500ms 后上传
  const timer = setTimeout(async () => {
    const update_data = pending_updates.get(id)
    if (!update_data) return

    pending_updates.delete(id)
    update_timers.delete(id)

    try {
      await update_photo(id, update_data)
    } catch (e) {
      console.error('更新照片失败:', e)
    }
  }, 500)

  update_timers.set(id, timer)
}

function handle_drag_end(id: string, x: number, y: number) {
  const photo = photos.value.find((p) => p.id === id)
  if (photo) {
    photo.x = x
    photo.y = y
    photo.z_index = global_max_z_index

    // 部分更新，只传需要修改的字段
    debounced_update_photo(id, {
      x,
      y,
      z_index: global_max_z_index,
    })
  }
}

function handle_update_size(id: string, width: number, height: number) {
  const photo = photos.value.find((p) => p.id === id)
  if (photo) {
    photo.width = width
    photo.height = height
  }
}

function handle_rotate(id: string, rotation: number) {
  const photo = photos.value.find((p) => p.id === id)
  if (photo) {
    photo.rotation = rotation

    // 部分更新，只传需要修改的字段
    debounced_update_photo(id, { rotation })
  }
}

function handle_viewer_close() {
  viewing_photo.value = null
}

function go_back() {
  router.push('/home/gallery')
}

// ========== 画布拖动 ==========

function start_canvas_drag(client_x: number, client_y: number) {
  is_dragging_canvas.value = true
  drag_start_x = client_x
  drag_start_y = client_y
  drag_start_offset_x = canvas_offset_x.value
  drag_start_offset_y = canvas_offset_y.value
}

function move_canvas_drag(client_x: number, client_y: number) {
  if (!is_dragging_canvas.value) return

  const dx = client_x - drag_start_x
  const dy = client_y - drag_start_y

  canvas_offset_x.value = drag_start_offset_x + dx
  canvas_offset_y.value = drag_start_offset_y + dy
}

function end_canvas_drag() {
  is_dragging_canvas.value = false
}

// 鼠标拖动画布
function handle_window_mousedown(e: MouseEvent) {
  // 评论区打开时不响应
  if (show_comments.value) return
  // 删除模式时不响应
  if (delete_mode.value) return
  // 只在左键按下且不是在照片上时开始拖动
  if (e.button !== 0) return
  if ((e.target as HTMLElement).closest('.photo-card')) return

  start_canvas_drag(e.clientX, e.clientY)
}

function handle_window_mousemove(e: MouseEvent) {
  if (show_comments.value || delete_mode.value) return
  move_canvas_drag(e.clientX, e.clientY)
}

function handle_window_mouseup() {
  end_canvas_drag()
}

// ========== 移动端画布缩放 ==========

function get_pinch_distance(touches: TouchList): number {
  if (touches.length < 2) return 0
  const t0 = touches[0]!
  const t1 = touches[1]!
  const dx = t0.clientX - t1.clientX
  const dy = t0.clientY - t1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function get_pinch_center(touches: TouchList): { x: number; y: number } {
  const t0 = touches[0]!
  const t1 = touches[1]!
  return {
    x: (t0.clientX + t1.clientX) / 2,
    y: (t0.clientY + t1.clientY) / 2,
  }
}

function handle_touch_start(e: TouchEvent) {
  if (!is_mobile.value) return
  if (show_comments.value || delete_mode.value) return

  if (e.touches.length === 2) {
    initial_pinch_distance = get_pinch_distance(e.touches)
    initial_scale = canvas_scale.value
    initial_offset_x = canvas_offset_x.value
    initial_offset_y = canvas_offset_y.value
    const center = get_pinch_center(e.touches)
    pinch_center_x = center.x
    pinch_center_y = center.y
  } else if (e.touches.length === 1) {
    if (!(e.target as HTMLElement).closest('.photo-card')) {
      start_canvas_drag(e.touches[0]!.clientX, e.touches[0]!.clientY)
    }
  }
}

function handle_touch_move(e: TouchEvent) {
  if (!is_mobile.value) return
  if (show_comments.value || delete_mode.value) return

  if (e.touches.length === 2) {
    e.preventDefault()
    const current_distance = get_pinch_distance(e.touches)
    if (initial_pinch_distance > 0) {
      const new_scale = initial_scale * (current_distance / initial_pinch_distance)
      canvas_scale.value = Math.min(3, Math.max(0.3, new_scale))

      const scale_ratio = canvas_scale.value / initial_scale
      canvas_offset_x.value = pinch_center_x - (pinch_center_x - initial_offset_x) * scale_ratio
      canvas_offset_y.value = pinch_center_y - (pinch_center_y - initial_offset_y) * scale_ratio
    }
  } else if (e.touches.length === 1 && is_dragging_canvas.value) {
    move_canvas_drag(e.touches[0]!.clientX, e.touches[0]!.clientY)
  }
}

function handle_touch_end() {
  if (!is_mobile.value) return
  initial_pinch_distance = 0
  end_canvas_drag()
}

// 重置画布缩放
function reset_canvas_scale() {
  canvas_scale.value = 1
  canvas_offset_x.value = 0
  canvas_offset_y.value = 0
}

// 滚轮缩放（桌面端）
function handle_wheel(e: WheelEvent) {
  if (is_mobile.value) return
  if (show_comments.value || delete_mode.value) return

  e.preventDefault()

  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const new_scale = canvas_scale.value * delta
  canvas_scale.value = Math.min(3, Math.max(0.3, new_scale))

  const screen_center_x = window.innerWidth / 2
  const screen_center_y = window.innerHeight / 2

  canvas_offset_x.value = screen_center_x - (screen_center_x - canvas_offset_x.value) * delta
  canvas_offset_y.value = screen_center_y - (screen_center_y - canvas_offset_y.value) * delta
}

const canvas_style = computed(() => ({
  transform: `translate(${canvas_offset_x.value}px, ${canvas_offset_y.value}px) scale(${canvas_scale.value})`,
  transformOrigin: 'center center',
}))

onMounted(() => {
  check_mobile()
  load_gallery()
  window.addEventListener('resize', check_mobile)
  window.addEventListener('wheel', handle_wheel, { passive: false })
  window.addEventListener('mousedown', handle_window_mousedown)
  window.addEventListener('mousemove', handle_window_mousemove)
  window.addEventListener('mouseup', handle_window_mouseup)
})

onUnmounted(() => {
  window.removeEventListener('resize', check_mobile)
  window.removeEventListener('wheel', handle_wheel)
  window.removeEventListener('mousedown', handle_window_mousedown)
  window.removeEventListener('mousemove', handle_window_mousemove)
  window.removeEventListener('mouseup', handle_window_mouseup)
})
</script>

<template>
  <div class="min-h-screen bg-[var(--c-bg)] relative overflow-hidden">
    <!-- 返回按钮 - 桌面端 -->
    <button
      v-if="!is_mobile"
      class="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white shadow-md rounded-full transition-colors"
      @click="go_back"
    >
      <ArrowLeft class="w-5 h-5 text-slate-600" />
    </button>

    <!-- 重置缩放按钮 -->
    <button
      v-if="canvas_scale !== 1 || canvas_offset_x !== 0 || canvas_offset_y !== 0"
      class="fixed z-50 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white shadow-md rounded-full transition-colors"
      :class="is_mobile ? 'top-4 left-4' : 'top-4 left-16'"
      @click="reset_canvas_scale"
    >
      <Maximize2 class="w-5 h-5 text-slate-600" />
    </button>

    <!-- 右上角按钮组 -->
    <div class="fixed top-4 right-4 z-50 flex items-center gap-2">
      <!-- 上传按钮（管理员） -->
      <template v-if="can_toggle_visibility">
        <button
          class="w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white shadow-md rounded-full transition-colors"
          :class="{ 'opacity-50': upload_loading }"
          :disabled="upload_loading"
          @click="trigger_upload"
        >
          <Loader2 v-if="upload_loading" class="w-5 h-5 text-slate-600 animate-spin" />
          <Upload v-else class="w-5 h-5 text-slate-600" />
        </button>
        <!-- 删除模式按钮 -->
        <button
          class="w-10 h-10 flex items-center justify-center shadow-md rounded-full transition-colors"
          :class="
            delete_mode ? 'bg-red-500 text-white' : 'bg-white/80 hover:bg-white text-slate-600'
          "
          @click="delete_mode = !delete_mode"
        >
          <X v-if="delete_mode" class="w-5 h-5" />
          <Trash2 v-else class="w-5 h-5" />
        </button>
      </template>
      <!-- 评论按钮 -->
      <button
        class="w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white shadow-md rounded-full transition-colors"
        @click="show_comments = !show_comments"
      >
        <MessageCircle class="w-5 h-5 text-slate-600" />
      </button>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="file_input_ref"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handle_file_change"
    />

    <!-- 删除模式提示 -->
    <div
      v-if="delete_mode"
      class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-500 text-white text-sm rounded-lg"
    >
      点击照片进行删除
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="fixed inset-0 flex items-center justify-center">
      <Loader2 class="w-8 h-8 animate-spin text-slate-400" />
    </div>

    <!-- 照片画布 -->
    <div
      v-else
      class="relative w-full h-screen"
      :class="is_mobile ? 'pb-14' : ''"
      :style="canvas_style"
      @touchstart="handle_touch_start"
      @touchmove="handle_touch_move"
      @touchend="handle_touch_end"
    >
      <PhotoCard
        v-for="photo in photos"
        :key="photo.id"
        :photo="photo"
        :z_index="photo.z_index"
        :is_mobile="is_mobile"
        :delete_mode="delete_mode"
        @click="handle_photo_click"
        @drag-start="handle_drag_start"
        @drag-end="handle_drag_end"
        @update-size="handle_update_size"
        @rotate="handle_rotate"
      />
    </div>

    <!-- 放大查看 -->
    <PhotoViewer :photo="viewing_photo" @close="handle_viewer_close" />

    <!-- 评论抽屉 -->
    <teleport to="body">
      <div v-if="show_comments" class="fixed inset-0 z-[100]">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/30" @click="show_comments = false" />
        <!-- 抽屉 -->
        <div
          class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto"
        >
          <div
            class="sticky top-0 bg-white border-b border-[var(--c-border)] p-4 flex items-center justify-between"
          >
            <h2 class="text-lg font-medium text-slate-700">评论区</h2>
            <button
              @click="show_comments = false"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <X class="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div class="p-4">
            <CommentSection target_type="gallery" :target_id="gallery_id" />
          </div>
        </div>
      </div>
    </teleport>

    <!-- 导航栏 -->
    <NavMenu />
  </div>
</template>
