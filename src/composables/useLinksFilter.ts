/**
 * 链接筛选状态管理
 */
import { ref } from 'vue'

// 当前筛选标签
const links_filter = ref<string>('all')

// 所有可用标签
const all_tags = ref<string[]>([])

// 设置筛选
function set_links_filter(filter: string) {
    links_filter.value = filter
}

// 设置所有标签
function set_all_tags(tags: string[]) {
    all_tags.value = tags
}

export function useLinksFilter() {
    return {
        links_filter,
        all_tags,
        set_links_filter,
        set_all_tags,
    }
}