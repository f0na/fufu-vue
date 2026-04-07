<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePostEdit } from '@/composables/usePostEdit'
import { usePostStore } from '@/stores/post'
import { useToast } from '@/composables/useToast'
import { useRouter, useRoute } from 'vue-router'
import { create_post, update_post, get_post } from '@/api/post'
import { post } from '@/api/request'
import type { PostStatus } from '@/api/types'
import CustomSelect from '@/components/common/CustomSelect.vue'

interface UploadToken {
    token: string
    key: string
    domain: string
    expires_in: number
    fsize_limit: number
    upload_url: string
    download_url: string
}

const router = useRouter()
const route = useRoute()
const { success, error } = useToast()
const post_store = usePostStore()
const { form_data, slug_generating, generate_slug, add_tag, remove_tag, import_markdown_file, reset_form } = usePostEdit()

// 是否为编辑模式
const route_id = computed(() => route.params.id as string | undefined)
const is_edit = computed(() => !!route_id.value)

// 加载状态
const loading = ref(false)
const submit_loading = ref(false)

// 封面图文件输入
const cover_input_ref = ref<HTMLInputElement | null>(null)
// 待上传封面图文件
const pending_cover_file = ref<File | null>(null)
// 本地预览 URL
const cover_preview_url = ref<string | null>(null)

// 封面图预览 URL（优先本地预览，其次远程 URL）
const cover_display_url = computed(() => {
    return cover_preview_url.value || form_data.value.cover || null
})

// 状态选项
const status_options = [
    { value: 'draft', label: '草稿' },
    { value: 'published', label: '已发布' },
    { value: 'hidden', label: '隐藏' },
]

// 分类选项（从缓存获取）
const category_options = computed(() => {
    return post_store.categories.map((c) => ({ value: c.name, label: c.name }))
})

// 加载文章数据（编辑模式）
async function load_post() {
    if (!route_id.value) return

    loading.value = true
    try {
        const post = await get_post(route_id.value)
        form_data.value = {
            title: post.title,
            slug: post.slug,
            summary: post.summary || '',
            content: post.content,
            cover: post.cover || '',
            tags: post.tags,
            category: post.category || '',
            status: post.status,
            top: post.top,
            comment_allowed: post.comment_allowed,
        }
    } catch (e) {
        console.error('加载文章失败:', e)
        error('加载文章失败')
        router.back()
    } finally {
        loading.value = false
    }
}

// 触发封面图上传
function trigger_cover_upload() {
    cover_input_ref.value?.click()
}

// 处理封面图选择
function handle_cover_select(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file && file.type.startsWith('image/')) {
        // 清除旧的本地预览
        if (cover_preview_url.value) {
            URL.revokeObjectURL(cover_preview_url.value)
        }
        // 生成本地预览
        cover_preview_url.value = URL.createObjectURL(file)
        pending_cover_file.value = file
        // 清除远程 URL
        form_data.value.cover = ''
    }
    target.value = ''
}

// 清除封面图
function clear_cover() {
    if (cover_preview_url.value) {
        URL.revokeObjectURL(cover_preview_url.value)
    }
    cover_preview_url.value = null
    pending_cover_file.value = null
    form_data.value.cover = ''
}

// 上传文件到七牛云
async function upload_file(file: File): Promise<string> {
    const token_data = await post<UploadToken>('/admin/upload', { type: 'cover' })

    const formData = new FormData()
    formData.append('token', token_data.token)
    formData.append('key', token_data.key)
    formData.append('file', file)

    const response = await fetch(token_data.upload_url, {
        method: 'POST',
        body: formData,
    })

    if (!response.ok) {
        throw new Error('上传失败')
    }

    return token_data.download_url
}

// 生成 slug
async function handle_generate_slug() {
    await generate_slug()
}

// 提交表单
async function handle_submit() {
    if (!form_data.value.title.trim()) {
        error('请填写文章标题')
        return
    }

    if (!form_data.value.content.trim()) {
        error('请填写文章内容')
        return
    }

    submit_loading.value = true
    try {
        // 如果有待上传封面图，先上传
        let cover_url = form_data.value.cover.trim()
        if (pending_cover_file.value) {
            cover_url = await upload_file(pending_cover_file.value)
        }

        const data = {
            title: form_data.value.title.trim(),
            slug: form_data.value.slug.trim() || undefined,
            summary: form_data.value.summary.trim() || undefined,
            content: form_data.value.content,
            cover: cover_url || undefined,
            tags: form_data.value.tags,
            category: form_data.value.category.trim() || undefined,
            status: form_data.value.status,
            top: form_data.value.top,
            comment_allowed: form_data.value.comment_allowed,
        }

        if (is_edit.value && route_id.value) {
            await update_post(route_id.value, data)
            success('更新成功')
        } else {
            const new_post = await create_post(data)
            post_store.upsert_post_local(new_post)
            success('创建成功')
        }

        router.push('/home/posts')
    } catch (e) {
        console.error('操作失败:', e)
        error(is_edit.value ? '更新失败' : '创建失败')
    } finally {
        submit_loading.value = false
    }
}

// 取消
function handle_cancel() {
    router.back()
}

// 初始化
watch(route_id, () => {
    if (is_edit.value) {
        load_post()
    } else {
        reset_form()
    }
}, { immediate: true })

// 加载分类列表
watch(() => post_store.categories_loaded, (loaded) => {
    if (!loaded) {
        post_store.load_categories()
    }
}, { immediate: true })

// 监听 cover URL 变化，清除本地预览
watch(() => form_data.value.cover, (new_val: string) => {
    if (new_val && cover_preview_url.value) {
        // 用户输入了 URL，清除本地预览
        URL.revokeObjectURL(cover_preview_url.value)
        cover_preview_url.value = null
        pending_cover_file.value = null
    }
})
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- 标题 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <label class="text-xs font-medium text-slate-500 mb-1 block">
                标题 <span class="text-red-500">*</span>
            </label>
            <input v-model="form_data.title" type="text" placeholder="文章标题"
                class="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-[var(--c-primary)] focus:outline-none" />
        </div>

        <!-- Slug -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <label class="text-xs font-medium text-slate-500 mb-1 block">Slug</label>
            <div class="flex gap-2">
                <input v-model="form_data.slug" type="text" placeholder="url-slug"
                    class="flex-1 min-w-0 max-w-48 px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-[var(--c-primary)] focus:outline-none"
                    :disabled="slug_generating" />
                <button @click="handle_generate_slug" :disabled="slug_generating || !form_data.title"
                    class="px-2 py-1.5 text-xs rounded-lg bg-[var(--c-primary-bg)] text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)]/70 disabled:opacity-50 shrink-0">
                    {{ slug_generating ? '生成中...' : '生成' }}
                </button>
            </div>
        </div>

        <!-- 摘要 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <label class="text-xs font-medium text-slate-500 mb-1 block">摘要</label>
            <textarea v-model="form_data.summary" placeholder="文章摘要（可选）" rows="3"
                class="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-[var(--c-primary)] focus:outline-none resize-none" />
        </div>

        <!-- 封面图 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <label class="text-xs font-medium text-slate-500 mb-1 block">封面图</label>
            <!-- 有封面图时显示预览 -->
            <div v-if="cover_display_url" class="relative group">
                <div class="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 cursor-pointer" @click="trigger_cover_upload">
                    <img :src="cover_display_url" alt="封面" class="w-full h-full object-cover" />
                    <!-- 更换提示 -->
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="text-white text-xs">点击更换封面</span>
                    </div>
                </div>
                <!-- 清除按钮 -->
                <button type="button" @click="clear_cover"
                    class="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                    <div class="i-lucide-x w-3 h-3" />
                </button>
            </div>
            <!-- 无封面图时的占位 -->
            <div v-else class="relative group cursor-pointer" @click="trigger_cover_upload">
                <div class="w-full aspect-video rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-[var(--c-primary)] hover:bg-[var(--c-primary-bg)]/30 transition-colors">
                    <div class="i-lucide-image-plus w-6 h-6" />
                    <span class="text-xs">点击上传封面</span>
                </div>
            </div>
            <!-- URL 输入框 -->
            <input v-model="form_data.cover" type="text" placeholder="或输入图片URL"
                class="w-full mt-2 px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-[var(--c-primary)] focus:outline-none" />
            <input ref="cover_input_ref" type="file" accept="image/*" class="hidden" @change="handle_cover_select" />
        </div>

        <!-- 标签 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <label class="text-xs font-medium text-slate-500 mb-1 block">标签</label>
            <div class="flex flex-wrap gap-1 mb-2">
                <span v-for="tag in form_data.tags" :key="tag"
                    class="px-2 py-0.5 text-xs rounded-lg bg-[var(--c-primary-bg)] text-[var(--c-primary)] cursor-pointer hover:opacity-70"
                    @click="remove_tag(tag)">
                    {{ tag }} ×
                </span>
            </div>
            <input type="text" placeholder="按回车添加"
                class="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-[var(--c-primary)] focus:outline-none"
                @keydown.enter="(e) => { const val = (e.target as HTMLInputElement).value.trim(); if (val) { add_tag(val); (e.target as HTMLInputElement).value = '' } }" />
        </div>

        <!-- 分类 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <label class="text-xs font-medium text-slate-500 mb-1 block">分类</label>
            <input v-model="form_data.category" type="text" placeholder="分类名称"
                class="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:border-[var(--c-primary)] focus:outline-none"
                list="category-options" />
            <datalist id="category-options">
                <option v-for="cat in category_options" :key="cat.value" :value="cat.value" />
            </datalist>
        </div>

        <!-- 状态 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <label class="text-xs font-medium text-slate-500 mb-1 block">状态</label>
            <CustomSelect v-model="form_data.status" :options="status_options" />
        </div>

        <!-- 置顶 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-slate-500">置顶</label>
                <button type="button" @click="form_data.top = !form_data.top"
                    class="relative w-10 h-5 rounded-full transition-colors"
                    :class="form_data.top ? 'bg-[var(--c-primary)]' : 'bg-slate-300'">
                    <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                        :class="form_data.top ? 'translate-x-5' : 'translate-x-0'" />
                </button>
            </div>
        </div>

        <!-- 允许评论 -->
        <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-slate-500">允许评论</label>
                <button type="button" @click="form_data.comment_allowed = !form_data.comment_allowed"
                    class="relative w-10 h-5 rounded-full transition-colors"
                    :class="form_data.comment_allowed ? 'bg-[var(--c-primary)]' : 'bg-slate-300'">
                    <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                        :class="form_data.comment_allowed ? 'translate-x-5' : 'translate-x-0'" />
                </button>
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col gap-2">
            <button @click="handle_cancel"
                class="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                取消
            </button>
            <button @click="handle_submit" :disabled="submit_loading"
                class="px-3 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all disabled:opacity-50">
                {{ submit_loading ? '提交中...' : is_edit ? '保存' : '创建' }}
            </button>
        </div>
    </div>
</template>