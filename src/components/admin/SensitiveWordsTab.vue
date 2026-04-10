<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get_sensitive_words, add_sensitive_word, delete_sensitive_word } from '@/api/comment'
import { useToast } from '@/composables/useToast'
import type { SensitiveWord } from '@/api/types'
import SimpleSelect from '@/components/common/SimpleSelect.vue'
import { Loader2 } from 'lucide-vue-next'

const { success, error } = useToast()

// 敏感词列表
const words = ref<SensitiveWord[]>([])
const loading = ref(false)
const input = ref('')
const level = ref<'filter' | 'hide'>('filter')
const filter_level = ref<'filter' | 'hide' | ''>('')
const keyword = ref('')

// 级别选项
const level_options = [
  { value: 'filter', label: '替换为 ***' },
  { value: 'hide', label: '自动隐藏评论' },
]

const filter_options = [
  { value: '', label: '全部级别' },
  { value: 'filter', label: '替换为 ***' },
  { value: 'hide', label: '自动隐藏评论' },
]

// 加载敏感词列表
async function load() {
  loading.value = true
  try {
    const res = await get_sensitive_words({
      level: filter_level.value || undefined,
      keyword: keyword.value || undefined,
    })
    words.value = res.items || []
  } catch (e) {
    console.error('加载敏感词失败:', e)
    error('加载敏感词失败')
  } finally {
    loading.value = false
  }
}

// 添加敏感词
async function handle_add() {
  if (!input.value.trim()) {
    error('请输入敏感词')
    return
  }

  try {
    await add_sensitive_word(input.value.trim(), level.value)
    success('添加成功')
    input.value = ''
    load()
  } catch (e) {
    console.error('添加敏感词失败:', e)
    error('添加失败')
  }
}

// 删除敏感词
async function handle_delete(id: string) {
  try {
    await delete_sensitive_word(id)
    success('删除成功')
    load()
  } catch (e) {
    console.error('删除敏感词失败:', e)
    error('删除失败')
  }
}

// 搜索
function search() {
  load()
}

// 筛选级别
function filter() {
  load()
}

// 初始化
onMounted(() => {
  load()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 添加敏感词 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <div class="flex items-center gap-3">
        <input
          v-model="input"
          type="text"
          placeholder="输入敏感词"
          class="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
        />
        <div class="w-40">
          <SimpleSelect v-model="level" :options="level_options" />
        </div>
        <button
          @click="handle_add"
          class="px-4 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all"
        >
          添加
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="flex items-center gap-3">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索敏感词"
        class="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
        @keyup.enter="search"
      />
      <div class="w-32">
        <SimpleSelect
          v-model="filter_level"
          :options="filter_options"
          @update:model-value="filter"
        />
      </div>
    </div>

    <!-- 敏感词列表 -->
    <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <div v-if="loading" class="py-8 text-center">
        <Loader2 class="w-6 h-6 mx-auto animate-spin text-slate-400" />
      </div>
      <div v-else-if="words.length === 0" class="py-8 text-center text-sm text-slate-400">
        暂无敏感词
      </div>
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="word in words"
          :key="word.id"
          class="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50"
        >
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-700">{{ word.word }}</span>
            <span
              class="px-2 py-0.5 text-xs rounded"
              :class="
                word.level === 'hide' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
              "
            >
              {{ word.level === 'hide' ? '隐藏' : '替换' }}
            </span>
          </div>
          <button @click="handle_delete(word.id)" class="text-xs text-red-500 hover:text-red-600">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
