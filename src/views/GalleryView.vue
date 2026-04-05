<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PhotoCard from '@/components/gallery/PhotoCard.vue'
import PhotoViewer from '@/components/gallery/PhotoViewer.vue'
import NavMenu from '@/components/common/NavMenu.vue'
import CommentSection from '@/components/comment/CommentSection.vue'

interface PhotoState {
    id: number
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

function check_mobile() {
    is_mobile.value = window.innerWidth < 768
    // 切换设备时重置缩放
    if (!is_mobile.value) {
        canvas_scale.value = 1
        canvas_offset_x.value = 0
        canvas_offset_y.value = 0
    }
}

// 照片数据
const photos = ref<PhotoState[]>([])

// 当前查看的照片
const viewing_photo = ref<PhotoState | null>(null)

// 是否显示评论
const show_comments = ref(false)

// 全局最高 z-index
let global_max_z_index = 1

// 相册 ID
const gallery_id = computed(() => route.params.id as string)

// localStorage key
function get_storage_key(id: string): string {
    return `gallery_${id}`
}

// 保存状态到 localStorage
function save_state() {
    const state = photos.value.map(p => ({
        id: p.id,
        src: p.src,
        x: p.x,
        y: p.y,
        rotation: p.rotation,
        width: p.width,
        height: p.height,
        z_index: p.z_index,
    }))
    localStorage.setItem(get_storage_key(gallery_id.value), JSON.stringify(state))
}

// 从 localStorage 加载状态
function load_state(): PhotoState[] | null {
    const saved = localStorage.getItem(get_storage_key(gallery_id.value))
    if (saved) {
        try {
            return JSON.parse(saved)
        } catch {
            return null
        }
    }
    return null
}

// 生成随机位置和角度（用于初始化演示数据）
function generate_random_position() {
    const container_width = 1200 // 使用固定宽度作为设计基准
    const container_height = 800
    const photo_size = 200

    const x = 50 + Math.random() * (container_width - photo_size)
    const y = 50 + Math.random() * (container_height - photo_size)
    const rotation = (Math.random() - 0.5) * 30 // -15° 到 15°

    return { x, y, rotation }
}

// 初始化照片
function init_photos() {
    check_mobile()

    const saved_state = load_state()

    if (saved_state && saved_state.length > 0) {
        photos.value = saved_state
        global_max_z_index = Math.max(...saved_state.map(p => p.z_index)) + 1
    } else {
        // 演示数据：生成默认照片
        generate_demo_photos()
    }
}

// 生成演示照片数据
function generate_demo_photos() {
    const image_sources = [
        'https://t.alcy.cc/moez',
        'https://t.alcy.cc/ycy',
        'https://www.loliapi.com/acg/',
    ]

    const photo_count = 8

    for (let i = 0; i < photo_count; i++) {
        const { x, y, rotation } = generate_random_position()

        photos.value.push({
            id: i + 1,
            src: image_sources[i % image_sources.length]!,
            x,
            y,
            rotation,
            width: 200,
            height: 150,
            z_index: i + 1,
        })
    }

    global_max_z_index = photos.value.length
    save_state()
}

function handle_photo_click(photo: PhotoState) {
    viewing_photo.value = photo
}

function handle_drag_start(id: number) {
    global_max_z_index++
    const photo = photos.value.find(p => p.id === id)
    if (photo) {
        photo.z_index = global_max_z_index
    }
}

function handle_drag_end(id: number, x: number, y: number) {
    const photo = photos.value.find(p => p.id === id)
    if (photo) {
        photo.x = x
        photo.y = y
        photo.z_index = global_max_z_index
        save_state()
    }
}

function handle_update_size(id: number, width: number, height: number) {
    const photo = photos.value.find(p => p.id === id)
    if (photo) {
        photo.width = width
        photo.height = height
        save_state()
    }
}

function handle_rotate(id: number, rotation: number) {
    const photo = photos.value.find(p => p.id === id)
    if (photo) {
        photo.rotation = rotation
        save_state()
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
    // 只在左键按下且不是在照片上时开始拖动
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest('.photo-card')) return

    start_canvas_drag(e.clientX, e.clientY)
}

function handle_window_mousemove(e: MouseEvent) {
    if (show_comments.value) return
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
        y: (t0.clientY + t1.clientY) / 2
    }
}

function handle_touch_start(e: TouchEvent) {
    if (!is_mobile.value) return
    // 评论区打开时不响应
    if (show_comments.value) return

    if (e.touches.length === 2) {
        // 双指按下，开始缩放
        initial_pinch_distance = get_pinch_distance(e.touches)
        initial_scale = canvas_scale.value
        initial_offset_x = canvas_offset_x.value
        initial_offset_y = canvas_offset_y.value
        const center = get_pinch_center(e.touches)
        pinch_center_x = center.x
        pinch_center_y = center.y
    } else if (e.touches.length === 1) {
        // 单指按下，开始拖动（检查是否在照片上）
        if (!(e.target as HTMLElement).closest('.photo-card')) {
            start_canvas_drag(e.touches[0]!.clientX, e.touches[0]!.clientY)
        }
    }
}

function handle_touch_move(e: TouchEvent) {
    if (!is_mobile.value) return
    if (show_comments.value) return

    if (e.touches.length === 2) {
        e.preventDefault()
        const current_distance = get_pinch_distance(e.touches)
        if (initial_pinch_distance > 0) {
            // 计算新缩放比例
            const new_scale = initial_scale * (current_distance / initial_pinch_distance)
            // 限制缩放范围 0.3 - 3
            canvas_scale.value = Math.min(3, Math.max(0.3, new_scale))

            // 计算偏移以保持缩放中心
            const scale_ratio = canvas_scale.value / initial_scale
            canvas_offset_x.value = pinch_center_x - (pinch_center_x - initial_offset_x) * scale_ratio
            canvas_offset_y.value = pinch_center_y - (pinch_center_y - initial_offset_y) * scale_ratio
        }
    } else if (e.touches.length === 1 && is_dragging_canvas.value) {
        // 单指拖动画布
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
    // 评论区打开时不响应
    if (show_comments.value) return

    e.preventDefault()

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const new_scale = canvas_scale.value * delta
    canvas_scale.value = Math.min(3, Math.max(0.3, new_scale))

    // 以屏幕中心为缩放中心
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
    init_photos()
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
            <div class="i-lucide-arrow-left w-5 h-5 text-slate-600" />
        </button>

        <!-- 重置缩放按钮（画布缩放或偏移后显示） -->
        <button
            v-if="canvas_scale !== 1 || canvas_offset_x !== 0 || canvas_offset_y !== 0"
            class="fixed z-50 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white shadow-md rounded-full transition-colors"
            :class="is_mobile ? 'top-4 left-4' : 'top-4 left-16'"
            @click="reset_canvas_scale"
        >
            <div class="i-lucide-maximize-2 w-5 h-5 text-slate-600" />
        </button>

        <!-- 评论按钮 -->
        <button
            class="fixed z-50 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white shadow-md rounded-full transition-colors"
            :class="is_mobile ? 'top-4 right-4' : 'top-4 right-4'"
            @click="show_comments = !show_comments"
        >
            <div class="i-lucide-message-circle w-5 h-5 text-slate-600" />
        </button>

        <!-- 照片画布 -->
        <div
            class="relative w-full h-screen"
            :class="is_mobile ? 'pb-14' : ''"
            :style="canvas_style"
            @touchstart="handle_touch_start"
            @touchmove="handle_touch_move"
            @touchend="handle_touch_end"
        >
            <photo-card
                v-for="photo in photos"
                :key="photo.id"
                :photo="photo"
                :z_index="photo.z_index"
                :is_mobile="is_mobile"
                @click="handle_photo_click"
                @drag-start="handle_drag_start"
                @drag-end="handle_drag_end"
                @update-size="handle_update_size"
                @rotate="handle_rotate"
            />
        </div>

        <!-- 放大查看 -->
        <photo-viewer
            :photo="viewing_photo"
            @close="handle_viewer_close"
        />

        <!-- 评论抽屉 -->
        <teleport to="body">
            <div v-if="show_comments" class="fixed inset-0 z-[100]">
                <!-- 遮罩 -->
                <div class="absolute inset-0 bg-black/30" @click="show_comments = false" />
                <!-- 抽屉 -->
                <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto">
                    <div class="sticky top-0 bg-white border-b border-[var(--c-border)] p-4 flex items-center justify-between">
                        <h2 class="text-lg font-medium text-slate-700">评论区</h2>
                        <button
                            @click="show_comments = false"
                            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <div class="i-lucide-x w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                    <div class="p-4">
                        <CommentSection
                            target_type="gallery"
                            :target_id="gallery_id"
                        />
                    </div>
                </div>
            </div>
        </teleport>

        <!-- 导航栏 -->
        <nav-menu />
    </div>
</template>