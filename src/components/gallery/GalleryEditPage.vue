<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useFormCache } from '@/composables/useFormCache'
import { fetch_gallery, create_gallery, update_gallery, toggle_gallery_visibility } from '@/api/gallery'
import { post } from '@/api/request'
import type { CreateGalleryRequest, UpdateGalleryRequest } from '@/api/types'
import BackToTop from '@/components/common/BackToTop.vue'
import TagsInput from '@/components/common/TagsInput.vue'
import ImageInput from '@/components/common/ImageInput.vue'

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

// 是否为编辑模式
const gallery_id = computed(() => route.params.id as string | undefined)
const is_edit = computed(() => !!gallery_id.value)

// 默认表单值
const default_form = {
  title: '',
  cover: '',
  tags: '',
  visible: true,
}

// 表单数据（带缓存）
const { form_data, reset, clear_cache } = useFormCache('gallery_edit', default_form)

// 加载状态
const loading = ref(false)
const submit_loading = ref(false)

// 图片输入组件 ref
const image_input_ref = ref<InstanceType<typeof ImageInput> | null>(null)
// 待上传文件
const pending_file = ref<File | null>(null)

// 加载相册数据（编辑模式）
async function load_gallery() {
  if (!gallery_id.value) return

  loading.value = true
  try {
    const gallery = await fetch_gallery(gallery_id.value)

    form_data.value = {
      title: gallery.title,
      cover: gallery.cover || '',
      tags: gallery.tags.join(', '),
      visible: gallery.visible,
    }
  } catch (e) {
    console.error('加载相册失败:', e)
    error('加载相册失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 处理文件选择
function handle_file_selected(file: File | null) {
  pending_file.value = file
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

// 返回
function go_back() {
  router.back()
}

// 提交表单
async function handle_submit() {
  if (!form_data.value.title.trim()) {
    error('请填写相册名称')
    return
  }

  submit_loading.value = true
  try {
    // 如果有待上传文件，先上传
    let cover_url = form_data.value.cover.trim()
    if (pending_file.value) {
      cover_url = await upload_file(pending_file.value)
    }

    const tags = form_data.value.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t)

    if (is_edit.value && gallery_id.value) {
      // 编辑模式：更新相册
      const update_data: UpdateGalleryRequest = {
        title: form_data.value.title.trim(),
        cover: cover_url || undefined,
        tags,
      }
      await update_gallery(gallery_id.value, update_data)

      // 如果可见性有变化，单独调用
      // 注意：需要先获取当前相册的 visible 状态进行比较
      // 这里简化处理，在创建时不处理 visible

      success('更新成功')
    } else {
      // 新建模式：创建相册
      const create_data: CreateGalleryRequest = {
        title: form_data.value.title.trim(),
        cover: cover_url || undefined,
        tags,
      }
      await create_gallery(create_data)
      success('添加成功')
    }
    clear_cache()
    router.back()
  } catch (e) {
    console.error('操作失败:', e)
    error(is_edit.value ? '更新失败' : '添加失败')
  } finally {
    submit_loading.value = false
  }
}

// 初始化
onMounted(() => {
  if (is_edit.value) {
    load_gallery()
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 返回按钮 -->
    <button
      @click="go_back"
      class="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--c-primary)] transition-colors self-start"
    >
      <div class="i-lucide-arrow-left w-4 h-4" />
      返回
    </button>

    <!-- 标题 -->
    <h1 class="text-xl font-medium text-slate-700">
      {{ is_edit ? '编辑相册' : '添加相册' }}
    </h1>

    <!-- 加载中 -->
    <div v-if="loading" class="py-12 flex justify-center">
      <div class="i-lucide-loader-2 w-8 h-8 animate-spin text-slate-400" />
    </div>

    <!-- 表单 -->
    <div v-else class="flex flex-col gap-6">
      <!-- 名称 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">名称 <span class="text-red-500">*</span></label>
        <input
          v-model="form_data.title"
          type="text"
          placeholder="相册名称"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:outline-none transition-all"
        />
      </div>

      <!-- 封面 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">封面 <span class="text-slate-400">(可选)</span></label>
        <ImageInput
          ref="image_input_ref"
          v-model="form_data.cover"
          placeholder="输入封面URL或选择文件"
          type="cover"
          @file-selected="handle_file_selected"
        />
      </div>

      <!-- 标签 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">标签 <span class="text-slate-400">(可选)</span></label>
        <TagsInput v-model="form_data.tags" tag-source="gallery" placeholder="输入标签，按回车添加" />
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-3 pt-4">
        <button
          @click="go_back"
          class="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          取消
        </button>
        <button
          @click="handle_submit"
          :disabled="submit_loading"
          class="flex-1 px-4 py-3 text-sm rounded-xl bg-[var(--c-primary)] text-white disabled:opacity-50"
        >
          {{ submit_loading ? '提交中...' : is_edit ? '保存' : '添加' }}
        </button>
      </div>
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>