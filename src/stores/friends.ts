/**
 * 友链全局缓存 Store
 * 用于跨组件共享友链数据，避免重复请求
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Friend } from '@/api/types'
import { get_friends, get_admin_friends } from '@/api/friend'

export const useFriendsStore = defineStore('friends', () => {
  // 友链列表缓存
  const friends = ref<Friend[]>([])

  // 是否已加载
  const loaded = ref(false)

  // 加载状态
  const loading = ref(false)

  // 是否为管理员数据（含隐藏友链）
  const is_admin_data = ref(false)

  /**
   * 加载友链列表
   * @param admin 是否使用管理员接口（含隐藏友链）
   * @param force 是否强制刷新
   */
  async function load_friends(admin = false, force = false) {
    // 已加载且非强制刷新，直接返回
    if (loaded.value && !force && is_admin_data.value === admin) {
      return friends.value
    }

    loading.value = true
    try {
      const res = admin
        ? await get_admin_friends({ per_page: 100 })
        : await get_friends({ per_page: 100 })
      friends.value = res.items
      is_admin_data.value = admin
      loaded.value = true
      return friends.value
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新单个友链（本地更新）
   */
  function update_friend_local(id: string, data: Partial<Friend>) {
    const friend = friends.value.find((f) => f.id === id)
    if (friend) {
      Object.assign(friend, data)
    }
  }

  /**
   * 添加或更新友链（不存在则添加，存在则更新）
   */
  function upsert_friend_local(friend: Friend) {
    const existing = friends.value.find((f) => f.id === friend.id)
    if (existing) {
      Object.assign(existing, friend)
    } else {
      friends.value.push(friend)
    }
  }

  /**
   * 添加友链到缓存
   */
  function add_friend_local(friend: Friend) {
    friends.value.push(friend)
  }

  /**
   * 从缓存删除友链
   */
  function remove_friend_local(id: string) {
    friends.value = friends.value.filter((f) => f.id !== id)
  }

  /**
   * 清空缓存
   */
  function clear_cache() {
    friends.value = []
    loaded.value = false
    is_admin_data.value = false
  }

  return {
    friends,
    loaded,
    loading,
    is_admin_data,
    load_friends,
    update_friend_local,
    upsert_friend_local,
    add_friend_local,
    remove_friend_local,
    clear_cache,
  }
})