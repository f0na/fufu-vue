/**
 * 相册筛选状态管理
 */
import { ref } from 'vue'

// 当前筛选标签
const gallery_filter = ref<string>('all')

// 所有可用标签
const all_tags = ref<string[]>([])

// 搜索关键词
const search_query = ref('')

// 设置筛选
function set_gallery_filter(filter: string) {
    gallery_filter.value = filter
}

// 设置所有标签
function set_all_tags(tags: string[]) {
    all_tags.value = tags
}

// 设置搜索关键词
function set_search_query(query: string) {
    search_query.value = query
}

export function useGalleryFilter() {
    return {
        gallery_filter,
        all_tags,
        search_query,
        set_gallery_filter,
        set_all_tags,
        set_search_query,
    }
}