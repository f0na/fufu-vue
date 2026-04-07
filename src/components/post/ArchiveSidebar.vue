<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useArchiveFilter } from '@/composables/useArchiveFilter'
import { usePostStore } from '@/stores/post'

const { selected_year, selected_tag, sort_desc } = useArchiveFilter()
const post_store = usePostStore()

// 加载归档数据获取年份列表
onMounted(async () => {
  await post_store.load_archive()
  await post_store.load_tags()
})

// 从归档数据提取年份列表
const years = computed(() => {
  return post_store.archive.map((g) => g.year).sort((a, b) => b - a)
})

// 标签列表
const tags = computed(() => post_store.tags)

// 选择年份
function select_year(year: number | null) {
  selected_year.value = selected_year.value === year ? null : year
}

// 选择标签
function select_tag(tag: string) {
  selected_tag.value = selected_tag.value === tag ? '' : tag
}

// 切换排序
function toggle_sort() {
  sort_desc.value = !sort_desc.value
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 年份筛选 -->
    <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
        <div class="i-lucide-calendar w-3 h-3" />
        年份
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="year in years"
          :key="year"
          @click="select_year(year)"
          class="px-2 py-1 text-xs rounded-lg transition-all"
          :class="
            selected_year === year
              ? 'bg-[var(--c-primary)] text-white'
              : 'bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'
          "
        >
          {{ year }}
        </button>
        <button
          @click="select_year(null)"
          class="px-2 py-1 text-xs rounded-lg transition-all"
          :class="
            selected_year === null
              ? 'bg-[var(--c-primary)] text-white'
              : 'bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'
          "
        >
          全部
        </button>
      </div>
    </div>

    <!-- 标签筛选 -->
    <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
        <div class="i-lucide-tag w-3 h-3" />
        标签
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in tags"
          :key="tag.name"
          @click="select_tag(tag.name)"
          class="px-2 py-1 text-xs rounded-lg transition-all"
          :class="
            selected_tag === tag.name
              ? 'bg-[var(--c-primary)] text-white'
              : 'bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'
          "
        >
          {{ tag.name }}
        </button>
        <button
          v-if="tags.length > 0"
          @click="select_tag('')"
          class="px-2 py-1 text-xs rounded-lg transition-all"
          :class="
            selected_tag === ''
              ? 'bg-[var(--c-primary)] text-white'
              : 'bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'
          "
        >
          全部
        </button>
      </div>
    </div>

    <!-- 排序 -->
    <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
        <div class="i-lucide-arrow-up-down w-3 h-3" />
        排序
      </h3>
      <div class="flex gap-2">
        <button
          @click="sort_desc = true"
          class="px-2 py-1 text-xs rounded-lg transition-all flex items-center gap-1"
          :class="
            sort_desc
              ? 'bg-[var(--c-primary)] text-white'
              : 'bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'
          "
        >
          <div class="i-lucide-arrow-down w-3 h-3" />
          最新
        </button>
        <button
          @click="sort_desc = false"
          class="px-2 py-1 text-xs rounded-lg transition-all flex items-center gap-1"
          :class="
            !sort_desc
              ? 'bg-[var(--c-primary)] text-white'
              : 'bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'
          "
        >
          <div class="i-lucide-arrow-up w-3 h-3" />
          最早
        </button>
      </div>
    </div>
  </div>
</template>