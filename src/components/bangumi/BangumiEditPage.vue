<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useFormCache } from '@/composables/useFormCache'
import {
  get_bangumi_info_detail,
  create_bangumi_info,
  update_bangumi_info,
} from '@/api/bangumi'
import { post } from '@/api/request'
import type { CreateBangumiInfoRequest, UpdateBangumiInfoRequest, WatchStatus } from '@/api/types'
import BackToTop from '@/components/common/BackToTop.vue'
import SimpleNumberInput from '@/components/common/SimpleNumberInput.vue'
import SimpleTagsInput from '@/components/common/SimpleTagsInput.vue'
import SimpleSelect from '@/components/common/SimpleSelect.vue'
import ImageInput from '@/components/common/ImageInput.vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'

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

// 是否为编辑模式（通过路由参数或 query 参数判断）
const route_id = computed(() => route.params.id as string | undefined)
const query_id = computed(() => route.query.bangumi_info_id as string | undefined)
const bangumi_info_id = computed(() => route_id.value || query_id.value)
const is_edit = computed(() => !!bangumi_info_id.value)

// 默认表单值（仅番剧信息）
const default_form = {
  title: '',
  cover: '',
  episodes: 0,
  description: '',
  tags: '',
  status: 'want_to_watch' as WatchStatus,
  visible: true,
}

// 状态选项
const status_options = [
  { value: 'want_to_watch', label: '想看' },
  { value: 'watching', label: '在看' },
  { value: 'watched', label: '看过' },
  { value: 'dropped', label: '抛弃' },
]

// 表单数据（带缓存）
const { form_data, reset, clear_cache } = useFormCache('bangumi_info_edit', default_form)

// 加载状态
const loading = ref(false)
const submit_loading = ref(false)

// 图片输入组件 ref
const image_input_ref = ref<InstanceType<typeof ImageInput> | null>(null)
// 待上传文件
const pending_file = ref<File | null>(null)

// 加载番剧信息数据（编辑模式）
async function load_bangumi_info() {
  if (!bangumi_info_id.value) return

  loading.value = true
  try {
    const bangumi_info = await get_bangumi_info_detail(bangumi_info_id.value)

    form_data.value = {
      title: bangumi_info.title,
      cover: bangumi_info.cover || '',
      episodes: bangumi_info.episodes || 0,
      description: bangumi_info.description || '',
      tags: bangumi_info.tags.join(', '),
      status: bangumi_info.status,
      visible: bangumi_info.visible,
    }
  } catch (e) {
    console.error('加载番剧信息失败:', e)
    error('加载番剧信息失败')
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

  // 使用带签名的 download_url
  return token_data.download_url
}

// 返回
function go_back() {
  router.back()
}

// 提交表单
async function handle_submit() {
  if (!form_data.value.title.trim()) {
    error('请填写番剧名称')
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

    // 番剧信息数据
    const info_data: CreateBangumiInfoRequest | UpdateBangumiInfoRequest = {
      title: form_data.value.title.trim(),
      cover: cover_url || undefined,
      episodes: form_data.value.episodes || undefined,
      description: form_data.value.description.trim() || undefined,
      tags,
      status: form_data.value.status,
      visible: form_data.value.visible,
    }

    if (is_edit.value && bangumi_info_id.value) {
      // 编辑模式：更新番剧信息
      await update_bangumi_info(bangumi_info_id.value, info_data)
      success('更新成功')
    } else {
      // 新建模式：创建番剧信息
      await create_bangumi_info(info_data as CreateBangumiInfoRequest)
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
    load_bangumi_info()
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
      <ArrowLeft class="w-4 h-4" />
      返回
    </button>

    <!-- 标题 -->
    <h1 class="text-xl font-medium text-slate-700">
      {{ is_edit ? '编辑番剧' : '添加番剧' }}
    </h1>

    <!-- 加载中 -->
    <div v-if="loading" class="py-12 flex justify-center">
      <Loader2 class="w-8 h-8 animate-spin text-slate-400" />
    </div>

    <!-- 表单 -->
    <div v-else class="flex flex-col gap-6">
      <!-- 名称 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">名称 <span class="text-red-500">*</span></label>
        <input
          v-model="form_data.title"
          type="text"
          placeholder="番剧名称"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
        />
      </div>

      <!-- 封面 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600"
          >封面 <span class="text-slate-400">(可选)</span></label
        >
        <ImageInput
          ref="image_input_ref"
          v-model="form_data.cover"
          placeholder="输入封面URL或选择文件"
          type="cover"
          @file-selected="handle_file_selected"
        />
      </div>

      <!-- 集数 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">集数 <span class="text-slate-400">(可选，新番可留空)</span></label>
        <SimpleNumberInput v-model="form_data.episodes" :min="0" :step="1" placeholder="集数" />
      </div>

      <!-- 简介 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600"
          >简介 <span class="text-slate-400">(可选)</span></label
        >
        <textarea
          v-model="form_data.description"
          placeholder="番剧简介"
          rows="4"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all resize-none"
        />
      </div>

      <!-- 标签 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">标签 <span class="text-slate-400">(可选)</span></label>
        <SimpleTagsInput v-model="form_data.tags" tag-source="bangumi" placeholder="输入标签，按回车添加" />
      </div>

      <!-- 追番状态 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">追番状态</label>
        <SimpleSelect v-model="form_data.status" :options="status_options" />
      </div>

      <!-- 可见性 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">可见性</label>
        <button
          type="button"
          @click="form_data.visible = !form_data.visible"
          class="relative w-12 h-6 rounded-full transition-colors self-start"
          :class="form_data.visible ? 'bg-[var(--c-primary)]' : 'bg-slate-300'"
        >
          <span
            class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
            :class="form_data.visible ? 'translate-x-6' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-3 pt-4">
        <button
          @click="go_back"
          class="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-colors"
        >
          取消
        </button>
        <button
          @click="handle_submit"
          :disabled="submit_loading"
          class="flex-1 px-4 py-3 text-sm rounded-xl bg-[var(--c-primary)] text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submit_loading ? '提交中...' : is_edit ? '保存' : '添加' }}
        </button>
      </div>
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>