import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment } from '@/api/types'

/**
 * 全局数据缓存 Store
 */
export const useDataCacheStore = defineStore('data_cache', () => {
  // 评论缓存 - 按 target_id 分组
  const comment_cache = ref<Map<string, Comment[]>>(new Map())

  /**
   * 设置评论缓存
   */
  function set_comments(target_id: string, comments: Comment[]) {
    comment_cache.value.set(target_id, [...comments])
  }

  /**
   * 获取评论缓存
   */
  function get_comments(target_id: string): Comment[] | undefined {
    return comment_cache.value.get(target_id)
  }

  /**
   * 添加评论到缓存
   */
  function add_comment(target_id: string, comment: Comment, parent_id?: string) {
    const cached = comment_cache.value.get(target_id)
    if (!cached) return

    if (parent_id) {
      // 添加回复到对应评论
      const parent = cached.find((c) => c.id === parent_id)
      if (parent) {
        parent.replies.push(comment)
        parent.reply_count++
      }
    } else {
      // 添加一级评论到开头
      cached.unshift(comment)
    }
  }

  /**
   * 删除评论（从缓存中移除）
   */
  function delete_comment(comment_id: string) {
    comment_cache.value.forEach((comments) => {
      // 查找并删除一级评论
      const index = comments.findIndex((c) => c.id === comment_id)
      if (index !== -1) {
        comments.splice(index, 1)
        return
      }
      // 查找并删除嵌套回复
      for (const comment of comments) {
        const reply_index = comment.replies.findIndex((r) => r.id === comment_id)
        if (reply_index !== -1) {
          comment.replies.splice(reply_index, 1)
          comment.reply_count--
          return
        }
      }
    })
  }

  /**
   * 更新评论状态
   */
  function update_comment_status(comment_id: string, status: 'normal' | 'hidden') {
    comment_cache.value.forEach((comments) => {
      for (const comment of comments) {
        if (comment.id === comment_id) {
          comment.status = status
          return
        }
        for (const reply of comment.replies) {
          if (reply.id === comment_id) {
            reply.status = status
            return
          }
        }
      }
    })
  }

  return {
    comment_cache,
    set_comments,
    get_comments,
    add_comment,
    delete_comment,
    update_comment_status,
  }
})
