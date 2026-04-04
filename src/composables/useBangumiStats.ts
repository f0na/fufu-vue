/**
 * 番剧筛选状态管理
 */
import { ref } from 'vue'

// 当前筛选状态
const bangumi_filter = ref<'all' | 'watching' | 'want_to_watch' | 'watched' | 'dropped'>('all')

// 设置筛选
function set_bangumi_filter(filter: typeof bangumi_filter.value) {
    bangumi_filter.value = filter
}

export function useBangumiFilter() {
    return {
        bangumi_filter,
        set_bangumi_filter,
    }
}