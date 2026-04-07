/**
 * 文章筛选状态管理
 */
import { ref } from 'vue'

// 搜索关键词
const search_query = ref('')

// 当前选中的标签
const selected_tag = ref('')

// 当前选中的分类
const selected_category = ref('')

// 重置筛选条件
function reset_filters() {
  search_query.value = ''
  selected_tag.value = ''
  selected_category.value = ''
}

export function usePostFilter() {
  return {
    search_query,
    selected_tag,
    selected_category,
    reset_filters,
  }
}