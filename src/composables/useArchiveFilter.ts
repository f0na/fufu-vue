/**
 * 归档筛选状态管理
 */
import { ref } from 'vue'

// 当前选中的年份
const selected_year = ref<number | null>(null)

// 当前选中的标签
const selected_tag = ref('')

// 排序方向（true=倒序最新，false=正序最早）
const sort_desc = ref(true)

// 重置筛选条件
function reset_filters() {
  selected_year.value = null
  selected_tag.value = ''
  sort_desc.value = true
}

export function useArchiveFilter() {
  return {
    selected_year,
    selected_tag,
    sort_desc,
    reset_filters,
  }
}
