/**
 * 文章全局缓存 Store
 * 用于跨组件共享文章数据，避免重复请求
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Post, PostDetail, ArchiveGroup, TagCount, CategoryCount } from '@/api/types'
import { get_posts, get_admin_posts, get_archive, get_tags, get_categories, get_post } from '@/api/post'

export const usePostStore = defineStore('post', () => {
  // 文章列表缓存
  const posts = ref<Post[]>([])

  // 是否已加载
  const loaded = ref(false)

  // 加载状态
  const loading = ref(false)

  // 是否为管理员数据（含隐藏文章）
  const is_admin_data = ref(false)

  // 归档缓存
  const archive = ref<ArchiveGroup[]>([])
  const archive_loaded = ref(false)

  // 标签统计缓存
  const tags = ref<TagCount[]>([])
  const tags_loaded = ref(false)

  // 分类统计缓存
  const categories = ref<CategoryCount[]>([])
  const categories_loaded = ref(false)

  /**
   * 加载文章列表
   * @param admin 是否使用管理员接口
   * @param force 是否强制刷新
   */
  async function load_posts(admin = false, force = false) {
    if (loaded.value && !force && is_admin_data.value === admin) {
      return posts.value
    }

    loading.value = true
    try {
      const res = admin
        ? await get_admin_posts({ per_page: 50 })
        : await get_posts({ per_page: 50 })
      posts.value = res.items
      is_admin_data.value = admin
      loaded.value = true
      return posts.value
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载归档数据
   */
  async function load_archive(force = false) {
    if (archive_loaded.value && !force) {
      return archive.value
    }

    const res = await get_archive()
    archive.value = res
    archive_loaded.value = true
    return archive.value
  }

  /**
   * 加载标签统计
   */
  async function load_tags(force = false) {
    if (tags_loaded.value && !force) {
      return tags.value
    }

    const res = await get_tags()
    tags.value = res
    tags_loaded.value = true
    return tags.value
  }

  /**
   * 加载分类统计
   */
  async function load_categories(force = false) {
    if (categories_loaded.value && !force) {
      return categories.value
    }

    const res = await get_categories()
    categories.value = res
    categories_loaded.value = true
    return categories.value
  }

  /**
   * 更新单个文章（本地更新）
   */
  function update_post_local(id: string, data: Partial<Post>) {
    const post = posts.value.find((p) => p.id === id)
    if (post) {
      Object.assign(post, data)
    }
  }

  /**
   * 添加或更新文章
   */
  function upsert_post_local(post: Post) {
    const existing = posts.value.find((p) => p.id === post.id)
    if (existing) {
      Object.assign(existing, post)
    } else {
      posts.value.unshift(post)
    }
  }

  /**
   * 从缓存删除文章
   */
  function remove_post_local(id: string) {
    posts.value = posts.value.filter((p) => p.id !== id)
  }

  /**
   * 清空缓存
   */
  function clear_cache() {
    posts.value = []
    loaded.value = false
    is_admin_data.value = false
    archive.value = []
    archive_loaded.value = false
    tags.value = []
    tags_loaded.value = false
    categories.value = []
    categories_loaded.value = false
  }

  return {
    posts,
    loaded,
    loading,
    is_admin_data,
    archive,
    archive_loaded,
    tags,
    tags_loaded,
    categories,
    categories_loaded,
    load_posts,
    load_archive,
    load_tags,
    load_categories,
    update_post_local,
    upsert_post_local,
    remove_post_local,
    clear_cache,
  }
})