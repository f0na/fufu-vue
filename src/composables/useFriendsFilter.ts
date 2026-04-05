/**
 * 友人帐筛选状态管理
 */
import { ref } from 'vue'

// 搜索关键词
const search_query = ref('')

export function useFriendsFilter() {
    return {
        search_query,
    }
}