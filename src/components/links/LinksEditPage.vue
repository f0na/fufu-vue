<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useFormCache } from '@/composables/useFormCache'
import { create_link, update_link, get_link } from '@/api/link'
import type { CreateLinkRequest, UpdateLinkRequest } from '@/api/types'
import BackToTop from '@/components/common/BackToTop.vue'
import TagsInput from '@/components/common/TagsInput.vue'

const router = useRouter()
const route = useRoute()
const { success, error } = useToast()

// 是否为编辑模式
const is_edit = computed(() => !!route.params.id)
const link_id = computed(() => route.params.id as string | undefined)

// 默认表单值
const default_form = {
  title: '',
  url: '',
  description: '',
  tags: '',
}

// 表单数据（带缓存）
const { form_data, reset, clear_cache } = useFormCache('link_edit', default_form)

// 加载状态
const loading = ref(false)
const submit_loading = ref(false)

// 加载链接数据（编辑模式）
async function load_link() {
  if (!link_id.value) return

  loading.value = true
  try {
    const link = await get_link(link_id.value)
    form_data.value = {
      title: link.title,
      url: link.url,
      description: link.description || '',
      tags: link.tags.join(', '),
    }
  } catch (e) {
    console.error('加载链接失败:', e)
    error('加载链接失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 返回
function go_back() {
  router.back()
}

// 提交表单
async function handle_submit() {
  if (!form_data.value.title.trim()) {
    error('请填写网站名称')
    return
  }
  if (!form_data.value.url.trim()) {
    error('请填写网站链接')
    return
  }

  submit_loading.value = true
  try {
    const tags = form_data.value.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t)

    const data: CreateLinkRequest | UpdateLinkRequest = {
      title: form_data.value.title.trim(),
      url: form_data.value.url.trim(),
      description: form_data.value.description.trim() || undefined,
      tags,
    }

    if (is_edit.value && link_id.value) {
      await update_link(link_id.value, data)
      success('更新成功')
    } else {
      await create_link(data as CreateLinkRequest)
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
    load_link()
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
      {{ is_edit ? '编辑链接' : '添加链接' }}
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
          placeholder="网站名称"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
        />
      </div>

      <!-- 链接 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">链接 <span class="text-red-500">*</span></label>
        <input
          v-model="form_data.url"
          type="url"
          placeholder="https://example.com"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
        />
      </div>

      <!-- 描述 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600"
          >描述 <span class="text-slate-400">(可选)</span></label
        >
        <input
          v-model="form_data.description"
          type="text"
          placeholder="网站描述"
          class="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none transition-all"
        />
      </div>

      <!-- 标签 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm text-slate-600">标签</label>
        <TagsInput v-model="form_data.tags" tag-source="link" placeholder="输入标签，按回车添加" />
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
