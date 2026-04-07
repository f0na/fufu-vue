/**
 * 番剧筛选状态管理
 */
import { ref } from 'vue'

// 追番状态类型
export type BangumiStatusFilter = 'all' | 'watching' | 'want_to_watch' | 'watched' | 'dropped'

// 当前筛选状态
const bangumi_filter = ref<BangumiStatusFilter>('all')

// 搜索关键词
const search_query = ref('')

// 设置筛选
function set_bangumi_filter(filter: BangumiStatusFilter) {
  bangumi_filter.value = filter
}

// 设置搜索关键词
function set_search_query(query: string) {
  search_query.value = query
}

export function useBangumiFilter() {
  return {
    bangumi_filter,
    search_query,
    set_bangumi_filter,
    set_search_query,
  }
}