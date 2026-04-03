<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PhotoCard from '@/components/gallery/PhotoCard.vue'
import PhotoViewer from '@/components/gallery/PhotoViewer.vue'

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

// 照片数据
const photos = ref<PhotoState[]>([])

// 当前查看的照片
const viewing_photo = ref<PhotoState | null>(null)

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

// 生成随机位置和角度
function generate_random_position() {
    const container_width = window.innerWidth - 100
    const container_height = window.innerHeight - 150
    const x = 50 + Math.random() * (container_width - 200)
    const y = 50 + Math.random() * (container_height - 150)
    const rotation = (Math.random() - 0.5) * 30 // -15° 到 15°
    return { x, y, rotation }
}

// 初始化照片
function init_photos() {
    // 尝试加载保存的状态
    const saved_state = load_state()

    if (saved_state && saved_state.length > 0) {
        // 有保存的状态，直接使用
        photos.value = saved_state
        global_max_z_index = Math.max(...saved_state.map(p => p.z_index)) + 1
    } else {
        // 没有保存的状态，生成新的
        generate_photos()
    }
}

// 生成新照片（随机位置）
function generate_photos() {
    const image_sources = [
        'https://t.alcy.cc/moez',
        'https://t.alcy.cc/ycy',
        'https://www.loliapi.com/acg/',
    ]

    for (let i = 0; i < 8; i++) {
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
        // z_index 已经在 drag-start 时更新了
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
    router.back()
}

onMounted(() => {
    init_photos()
})
</script>

<template>
    <div class="min-h-screen bg-[var(--c-bg)] relative overflow-hidden">
        <!-- 返回按钮 -->
        <button
            class="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white shadow-md rounded-full transition-colors"
            @click="go_back"
        >
            <div class="i-lucide-arrow-left w-5 h-5 text-slate-600" />
        </button>

        <!-- 照片区域 -->
        <div class="relative w-full h-screen">
            <photo-card
                v-for="photo in photos"
                :key="photo.id"
                :photo="photo"
                :z_index="photo.z_index"
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
    </div>
</template>