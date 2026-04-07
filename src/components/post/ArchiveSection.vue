<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { ArchiveGroup } from '@/api/types'
import { useArchiveFilter } from '@/composables/useArchiveFilter'
import { usePostStore } from '@/stores/post'
import BackToTop from '@/components/common/BackToTop.vue'
import { Loader2, Archive } from 'lucide-vue-next'

const router = useRouter()
const { selected_year, selected_tag, sort_desc, reset_filters } = useArchiveFilter()
const post_store = usePostStore()

// 加载状态
const loading = ref(false)

// 加载归档数据
async function load_archive() {
  loading.value = true
  try {
    await post_store.load_archive()
  } finally {
    loading.value = false
  }
}

// 格式化日期
function format_date(date_str: string | null): string {
  if (!date_str) return ''
  const date = new Date(date_str)
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 筛选后的归档数据
const filtered_archive = computed(() => {
  let archive = [...post_store.archive]

  // 按年份筛选
  if (selected_year.value !== null) {
    archive = archive.filter((g) => g.year === selected_year.value)
  }

  // 按标签筛选（需要过滤每个月份的文章）
  if (selected_tag.value) {
    archive = archive.map((group) => ({
      ...group,
      months: group.months.map((month) => ({
        ...month,
        posts: month.posts.filter((post) => {
          // 需要从 posts 列表中获取文章详情来判断标签
          // 由于归档数据不包含标签，这里需要简化处理或从 store 中查找
          const full_post = post_store.posts.find((p) => p.id === post.id)
          return full_post?.tags.includes(selected_tag.value) ?? false
        }),
      })).filter((month) => month.posts.length > 0),
    })).filter((group) => group.months.length > 0)
  }

  // 排序
  if (sort_desc.value) {
    // 按年份倒序、月份倒序
    archive.sort((a, b) => b.year - a.year)
    archive.forEach((group) => {
      group.months.sort((a, b) => b.month - a.month)
    })
  } else {
    // 按年份正序、月份正序
    archive.sort((a, b) => a.year - b.year)
    archive.forEach((group) => {
      group.months.sort((a, b) => a.month - b.month)
    })
  }

  return archive
})

// 点击文章
function handle_post_click(slug: string, id: string) {
  router.push(`/home/posts/${slug || id}`)
}

// 组件挂载
onMounted(() => {
  load_archive()
  // 同时加载文章列表（用于标签筛选）
  post_store.load_posts(false)
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 加载中 -->
    <div v-if="loading" class="py-12 text-center text-slate-400">
      <Loader2 class="w-8 h-8 animate-spin mx-auto mb-3" />
      <p class="text-sm">加载中...</p>
    </div>

    <!-- 归档时间线 -->
    <template v-else>
      <div v-for="group in filtered_archive" :key="group.year" class="flex flex-col gap-4">
        <!-- 年份标题 -->
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-medium text-slate-700">{{ group.year }}年</h2>
          <span class="text-sm text-slate-400">({{ group.total }}篇)</span>
        </div>

        <!-- 分隔线 -->
        <div class="h-px bg-[var(--c-border)]"></div>

        <!-- 月份时间线 -->
        <div v-for="month in group.months" :key="month.month" class="flex flex-col gap-2 ml-4">
          <!-- 月份标题 -->
          <h3 class="text-sm text-slate-500">{{ String(month.month).padStart(2, '0') }}月</h3>

          <!-- 文章列表 -->
          <div class="flex flex-col gap-2 ml-4">
            <div
              v-for="post in month.posts"
              :key="post.id"
              @click="handle_post_click(post.slug, post.id)"
              class="cursor-pointer group flex items-start gap-2 py-1"
            >
              <!-- 时间线标记 -->
              <div class="flex flex-col items-center pt-1">
                <div class="w-2 h-2 rounded-full bg-[var(--c-primary)]"></div>
                <div class="w-px h-full bg-[var(--c-border)]"></div>
              </div>

              <!-- 文章信息 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-400">{{ format_date(post.published_at) }}</span>
                  <span class="text-sm text-slate-700 group-hover:text-[var(--c-primary)] transition-colors">
                    {{ post.title }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filtered_archive.length === 0" class="py-12 text-center text-slate-400">
        <Archive class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p class="text-sm">暂无文章</p>
      </div>
    </template>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>