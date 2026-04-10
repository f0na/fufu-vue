<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get_files } from '@/api/admin'
import { useToast } from '@/composables/useToast'
import type { UploadedFile, FileTypeFilter, PaginatedData } from '@/api/types'
import { Loader2, FileImage, ExternalLink } from 'lucide-vue-next'

const { error } = useToast()

// 文件列表
const files = ref<UploadedFile[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const filter_type = ref<FileTypeFilter | ''>('')

// 加载文件列表
async function load() {
  loading.value = true
  try {
    const res: PaginatedData<UploadedFile> = await get_files({
      file_type: filter_type.value || undefined,
      page: page.value,
      per_page: 20,
    })
    files.value = res.items
    total.value = res.pagination.total
  } catch (e) {
    console.error('加载文件列表失败:', e)
    error('加载文件列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选类型
function filter() {
  page.value = 1
  load()
}

// 格式化文件大小
function format_size(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 获取文件类型标签
function get_type_label(type: string): string {
  switch (type) {
    case 'cover':
      return '封面'
    case 'markdown':
      return 'Markdown'
    case 'gallery':
      return '相册'
    default:
      return type
  }
}

// 初始化
onMounted(() => {
  load()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 筛选 -->
    <div class="flex items-center gap-3">
      <select
        v-model="filter_type"
        @change="filter"
        class="px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
      >
        <option value="">全部类型</option>
        <option value="cover">封面</option>
        <option value="markdown">Markdown</option>
        <option value="gallery">相册</option>
      </select>
      <span class="text-xs text-slate-500">共 {{ total }} 个文件</span>
    </div>

    <!-- 文件列表 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <div v-if="loading" class="py-8 text-center">
        <Loader2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>
      <div v-else-if="files.length === 0" class="py-8 text-center text-sm text-slate-400">
        暂无文件
      </div>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="file in files"
          :key="file.id"
          class="group relative rounded-lg border border-[var(--c-border)] overflow-hidden bg-slate-50 hover:border-[var(--c-primary)] transition-colors"
        >
          <!-- 图片预览 -->
          <div class="aspect-square">
            <img
              :src="file.url"
              :alt="file.original_filename"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <!-- 文件信息 -->
          <div class="p-2 border-t border-[var(--c-border)]">
            <p class="text-xs font-medium text-slate-700 truncate" :title="file.original_filename">
              {{ file.original_filename }}
            </p>
            <div class="flex items-center justify-between mt-1">
              <span class="px-1.5 py-0.5 text-xs rounded bg-slate-200 text-slate-600">
                {{ get_type_label(file.file_type) }}
              </span>
              <span class="text-xs text-slate-400">{{ format_size(file.file_size) }}</span>
            </div>
          </div>
          <!-- 操作按钮 -->
          <a
            :href="file.url"
            target="_blank"
            class="absolute top-2 right-2 p-1.5 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-[var(--c-primary)]"
          >
            <ExternalLink class="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
