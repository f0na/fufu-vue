<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { usePostFilter } from '@/composables/usePostFilter'
import { usePostStore } from '@/stores/post'

const { search_query, selected_tag, selected_category } = usePostFilter()
const post_store = usePostStore()

// 加载标签和分类统计
onMounted(async () => {
  await post_store.load_tags()
  await post_store.load_categories()
})

// 标签列表
const tags = computed(() => post_store.tags)

// 分类列表
const categories = computed(() => post_store.categories)

// 选择标签
function select_tag(tag: string) {
  selected_tag.value = selected_tag.value === tag ? '' : tag
}

// 选择分类
function select_category(category: string) {
  selected_category.value = selected_category.value === category ? '' : category
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 搜索框 -->
    <div
      class="rounded-xl bg-white/80 backdrop-blur-sm border border-[var(--c-border)] shadow-sm overflow-hidden"
    >
      <div class="relative">
        <div class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
          <div class="i-lucide-search w-3.5 h-3.5" />
        </div>
        <input
          v-model="search_query"
          type="text"
          placeholder="搜索文章..."
          class="w-full pl-7 pr-2 py-2 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
        />
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

    <!-- 分类筛选 -->
    <div class="p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
      <h3 class="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
        <div class="i-lucide-folder w-3 h-3" />
        分类
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="cat in categories"
          :key="cat.name"
          @click="select_category(cat.name)"
          class="px-2 py-1 text-xs rounded-lg transition-all"
          :class="
            selected_category === cat.name
              ? 'bg-[var(--c-primary)] text-white'
              : 'bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'
          "
        >
          {{ cat.name }}
        </button>
        <button
          v-if="categories.length > 0"
          @click="select_category('')"
          class="px-2 py-1 text-xs rounded-lg transition-all"
          :class="
            selected_category === ''
              ? 'bg-[var(--c-primary)] text-white'
              : 'bg-[var(--c-primary-bg)] text-slate-600 hover:bg-[var(--c-primary-bg)]/70'
          "
        >
          全部
        </button>
      </div>
    </div>
  </div>
</template>