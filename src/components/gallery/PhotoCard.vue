<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface PhotoData {
    id: number
    src: string
    x: number
    y: number
    rotation: number
    width: number
    height: number
    z_index: number
}

const props = defineProps<{
    photo: PhotoData
    z_index: number
    is_mobile?: boolean
}>()

const emit = defineEmits<{
    (e: 'click', photo: PhotoData): void
    (e: 'drag-start', id: number): void
    (e: 'drag-end', id: number, x: number, y: number): void
    (e: 'update-size', id: number, width: number, height: number): void
    (e: 'rotate', id: number, rotation: number): void
}>()

const is_dragging = ref(false)
const is_rotating = ref(false)
const has_moved = ref(false)
const current_x = ref(props.photo.x)
const current_y = ref(props.photo.y)
const loaded = ref(false)
const natural_width = ref(0)
const natural_height = ref(0)

// 当前旋转角度
const current_rotation = ref(props.photo.rotation)

// 拖动偏移
let drag_offset_x = 0
let drag_offset_y = 0

// 旋转中心
let rotate_center_x = 0
let rotate_center_y = 0
let rotate_start_angle = 0

// 计算显示尺寸（限制最大宽高）
const display_size = computed(() => {
    if (!loaded.value) {
        // 移动端默认更小
        const default_width = props.is_mobile ? 140 : 200
        const default_height = props.is_mobile ? 100 : 150
        return { width: props.photo.width || default_width, height: props.photo.height || default_height }
    }

    // 移动端尺寸限制更严格
    const max_width = props.is_mobile ? 180 : 280
    const max_height = props.is_mobile ? 140 : 220
    const min_width = props.is_mobile ? 100 : 160
    const min_height = props.is_mobile ? 80 : 120

    let width = natural_width.value
    let height = natural_height.value

    // 按比例缩放
    if (width > max_width) {
        height = height * (max_width / width)
        width = max_width
    }
    if (height > max_height) {
        width = width * (max_height / height)
        height = max_height
    }
    if (width < min_width) {
        height = height * (min_width / width)
        width = min_width
    }
    if (height < min_height) {
        width = width * (min_height / height)
        height = min_height
    }

    return { width: Math.round(width), height: Math.round(height) }
})

const photo_style = computed(() => ({
    transform: `translate(${current_x.value}px, ${current_y.value}px) rotate(${current_rotation.value}deg)`,
    zIndex: props.z_index,
}))

// 监听外部旋转变化
watch(() => props.photo.rotation, (new_rotation) => {
    current_rotation.value = new_rotation
})

// 监听位置变化
watch(() => props.photo.x, (new_x) => {
    if (!is_dragging.value) current_x.value = new_x
})
watch(() => props.photo.y, (new_y) => {
    if (!is_dragging.value) current_y.value = new_y
})

function handle_image_load(e: Event) {
    const img = e.target as HTMLImageElement
    natural_width.value = img.naturalWidth
    natural_height.value = img.naturalHeight
    loaded.value = true

    // 通知父组件更新尺寸
    emit('update-size', props.photo.id, display_size.value.width, display_size.value.height)
}

// 计算角度
function get_angle(x: number, y: number, center_x: number, center_y: number): number {
    return Math.atan2(y - center_y, x - center_x) * (180 / Math.PI)
}

// ========== 鼠标事件（桌面端） ==========

function handle_mouse_down(e: MouseEvent) {
    e.preventDefault()
    is_dragging.value = true
    has_moved.value = false
    drag_offset_x = e.clientX - current_x.value
    drag_offset_y = e.clientY - current_y.value

    emit('drag-start', props.photo.id)

    document.addEventListener('mousemove', handle_mouse_move)
    document.addEventListener('mouseup', handle_mouse_up)
}

function handle_mouse_move(e: MouseEvent) {
    if (!is_dragging.value) return

    const new_x = e.clientX - drag_offset_x
    const new_y = e.clientY - drag_offset_y

    if (!has_moved.value) {
        const dx = Math.abs(new_x - current_x.value)
        const dy = Math.abs(new_y - current_y.value)
        if (dx > 1 || dy > 1) {
            has_moved.value = true
        }
    }

    current_x.value = new_x
    current_y.value = new_y
}

function handle_mouse_up() {
    is_dragging.value = false
    document.removeEventListener('mousemove', handle_mouse_move)
    document.removeEventListener('mouseup', handle_mouse_up)

    if (has_moved.value) {
        emit('drag-end', props.photo.id, current_x.value, current_y.value)
    } else {
        emit('click', props.photo)
    }
}

// ========== 触摸事件（移动端） ==========

function handle_touch_start(e: TouchEvent) {
    if (e.touches.length !== 1) return
    e.preventDefault()

    const touch = e.touches[0]
    is_dragging.value = true
    has_moved.value = false
    drag_offset_x = touch.clientX - current_x.value
    drag_offset_y = touch.clientY - current_y.value

    emit('drag-start', props.photo.id)
}

function handle_touch_move(e: TouchEvent) {
    if (!is_dragging.value || e.touches.length !== 1) return

    const touch = e.touches[0]
    const new_x = touch.clientX - drag_offset_x
    const new_y = touch.clientY - drag_offset_y

    if (!has_moved.value) {
        const dx = Math.abs(new_x - current_x.value)
        const dy = Math.abs(new_y - current_y.value)
        if (dx > 1 || dy > 1) {
            has_moved.value = true
        }
    }

    current_x.value = new_x
    current_y.value = new_y
}

function handle_touch_end(e: TouchEvent) {
    if (!is_dragging.value) return
    is_dragging.value = false

    if (has_moved.value) {
        emit('drag-end', props.photo.id, current_x.value, current_y.value)
    } else {
        emit('click', props.photo)
    }
}

// ========== 旋转事件 ==========

function handle_rotate_start(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    is_rotating.value = true

    const photo_width = display_size.value.width + 24
    const photo_height = display_size.value.height + 24
    rotate_center_x = current_x.value + photo_width / 2
    rotate_center_y = current_y.value + photo_height / 2

    rotate_start_angle = get_angle(e.clientX, e.clientY, rotate_center_x, rotate_center_y) - current_rotation.value

    emit('drag-start', props.photo.id)

    document.addEventListener('mousemove', handle_rotate_move)
    document.addEventListener('mouseup', handle_rotate_end)
}

function handle_rotate_move(e: MouseEvent) {
    if (!is_rotating.value) return

    const current_angle = get_angle(e.clientX, e.clientY, rotate_center_x, rotate_center_y)
    current_rotation.value = current_angle - rotate_start_angle
}

function handle_rotate_end() {
    is_rotating.value = false
    document.removeEventListener('mousemove', handle_rotate_move)
    document.removeEventListener('mouseup', handle_rotate_end)

    emit('rotate', props.photo.id, current_rotation.value)
}

// 移动端触摸旋转
function handle_rotate_touch_start(e: TouchEvent) {
    if (e.touches.length !== 1) return
    e.preventDefault()
    e.stopPropagation()
    is_rotating.value = true

    const photo_width = display_size.value.width + 18
    const photo_height = display_size.value.height + 18
    rotate_center_x = current_x.value + photo_width / 2
    rotate_center_y = current_y.value + photo_height / 2

    const touch = e.touches[0]
    rotate_start_angle = get_angle(touch.clientX, touch.clientY, rotate_center_x, rotate_center_y) - current_rotation.value

    emit('drag-start', props.photo.id)
}

function handle_rotate_touch_move(e: TouchEvent) {
    if (!is_rotating.value || e.touches.length !== 1) return

    const touch = e.touches[0]
    const current_angle = get_angle(touch.clientX, touch.clientY, rotate_center_x, rotate_center_y)
    current_rotation.value = current_angle - rotate_start_angle
}

function handle_rotate_touch_end() {
    is_rotating.value = false
    emit('rotate', props.photo.id, current_rotation.value)
}
</script>

<template>
    <div
        class="photo-card absolute shadow-lg select-none transition-shadow"
        :class="is_dragging ? 'shadow-xl' : ''"
        :style="photo_style"
        @mousedown="handle_mouse_down"
        @touchstart="handle_touch_start"
        @touchmove="handle_touch_move"
        @touchend="handle_touch_end"
    >
        <!-- 白色底片效果 -->
        <div class="bg-white p-3 shadow-md relative group" :class="is_mobile ? 'p-2' : 'p-3'">
            <!-- 图片容器 -->
            <div
                class="overflow-hidden"
                :style="{
                    width: `${display_size.width}px`,
                    height: `${display_size.height}px`
                }"
            >
                <img
                    :src="photo.src"
                    :alt="`Photo ${photo.id}`"
                    class="w-full h-full object-cover"
                    draggable="false"
                    @load="handle_image_load"
                />
            </div>

            <!-- 旋转手柄 - 右上角 -->
            <div
                v-if="!is_mobile"
                class="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-slate-100"
                :class="is_rotating ? 'opacity-100 cursor-grabbing bg-slate-100' : ''"
                @mousedown="handle_rotate_start"
            >
                <div class="i-lucide-rotate-cw w-3.5 h-3.5 text-slate-500" />
            </div>

            <!-- 移动端旋转手柄 - 更大更容易触摸 -->
            <div
                v-if="is_mobile"
                class="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md cursor-grab flex items-center justify-center active:bg-slate-100"
                :class="is_rotating ? 'bg-slate-100' : ''"
                @touchstart="handle_rotate_touch_start"
                @touchmove="handle_rotate_touch_move"
                @touchend="handle_rotate_touch_end"
            >
                <div class="i-lucide-rotate-cw w-4 h-4 text-slate-500" />
            </div>
        </div>
    </div>
</template>