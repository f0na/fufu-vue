<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get_admin_comments, delete_comment, update_comment_status } from '@/api/comment'
import { useToast } from '@/composables/useToast'
import { useDataCacheStore } from '@/stores/dataCache'
import type { Comment } from '@/api/types'
import SimpleSelect from '@/components/common/SimpleSelect.vue'
import { Loader2 } from 'lucide-vue-next'

const { success, error } = useToast()
const cache_store = useDataCacheStore()

// 评论列表
const comments = ref<Comment[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const filter_status = ref<'normal' | 'hidden' | ''>('')
const keyword = ref('')

// 状态选项
const status_options = [
  { value: '', label: '全部状态' },
  { value: 'normal', label: '正常' },
  { value: 'hidden', label: '已隐藏' },
]

// 加载评论列表
async function load() {
  loading.value = true
  try {
    const res = await get_admin_comments({
      status: filter_status.value || undefined,
      keyword: keyword.value || undefined,
      page: page.value,
      per_page: 20,
    })
    comments.value = res.items
    total.value = res.pagination.total
  } catch (e) {
    console.error('加载评论失败:', e)
    error('加载评论失败')
  } finally {
    loading.value = false
  }
}

// 删除评论
async function handle_delete(id: string) {
  try {
    await delete_comment(id)
    success('删除成功')
    cache_store.delete_comment(id)
    load()
  } catch (e) {
    console.error('删除评论失败:', e)
    error('删除失败')
  }
}

// 切换评论状态
async function handle_toggle_status(comment: Comment) {
  const new_status = comment.status === 'normal' ? 'hidden' : 'normal'
  try {
    await update_comment_status(comment.id, new_status)
    success('状态更新成功')
    cache_store.update_comment_status(comment.id, new_status)
    load()
  } catch (e) {
    console.error('更新状态失败:', e)
    error('更新失败')
  }
}

// 搜索
function search() {
  page.value = 1
  load()
}

// 筛选状态
function filter() {
  page.value = 1
  load()
}

// 初始化
onMounted(() => {
  load()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 搜索和筛选 -->
    <div class="flex items-center gap-3">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索评论内容"
        class="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
        @keyup.enter="search"
      />
      <div class="w-32">
        <SimpleSelect
          v-model="filter_status"
          :options="status_options"
          @update:model-value="filter"
        />
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <div v-if="loading" class="py-8 text-center">
        <Loader2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>
      <div v-else-if="comments.length === 0" class="py-8 text-center text-sm text-slate-400">
        暂无评论
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="p-4 rounded-lg bg-slate-50 border border-[var(--c-border)]"
        >
          <!-- 作者信息 -->
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium text-slate-700">{{ comment.author.name }}</span>
            <span
              v-if="comment.author.admin"
              class="px-1.5 py-0.5 text-xs rounded bg-[var(--c-primary)] text-white"
            >
              管理员
            </span>
            <span
              class="px-1.5 py-0.5 text-xs rounded"
              :class="
                comment.status === 'hidden'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
              "
            >
              {{ comment.status === 'hidden' ? '已隐藏' : '正常' }}
            </span>
            <span class="text-xs text-slate-400">
              {{
                comment.target_type === 'gallery'
                  ? '相册'
                  : comment.target_type === 'bangumi'
                    ? '番剧'
                    : '文章'
              }}
            </span>
          </div>

          <!-- 评论内容 -->
          <div class="text-sm text-slate-600 mb-3 line-clamp-2">
            {{ comment.content }}
          </div>

          <!-- 操作 -->
          <div class="flex items-center gap-2">
            <button
              @click="handle_toggle_status(comment)"
              class="px-3 py-1 text-xs rounded border border-[var(--c-border)] text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {{ comment.status === 'normal' ? '隐藏' : '显示' }}
            </button>
            <button
              @click="handle_delete(comment.id)"
              class="px-3 py-1 text-xs rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
