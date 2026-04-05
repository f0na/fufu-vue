<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { get_comments, create_comment, create_guest_comment } from '@/api/comment'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import type { Comment, CommentTarget } from '@/api/types'
import CommentItem from './CommentItem.vue'
import CommentForm from './CommentForm.vue'
import BackToTop from '@/components/common/BackToTop.vue'

const props = defineProps<{
    target_type: CommentTarget
    target_id: string
}>()

const { is_logged_in, user } = useAuth()
const { success, error } = useToast()

// 评论列表
const comments = ref<Comment[]>([])

// 加载状态
const loading = ref(false)

// 分页信息
const page = ref(1)
const per_page = 20
const total = ref(0)
const total_pages = ref(0)

// 是否有更多
const has_more = computed(() => page.value < total_pages.value)

// 回复状态
const reply_to = ref<Comment | null>(null)

// 加载评论
async function load_comments(is_load_more = false) {
    if (loading.value) return

    loading.value = true
    try {
        const res = await get_comments({
            target_type: props.target_type,
            target_id: props.target_id,
            page: page.value,
            per_page
        })

        if (is_load_more) {
            comments.value = [...comments.value, ...res.items]
        } else {
            comments.value = res.items
        }
        total.value = res.pagination.total
        total_pages.value = res.pagination.total_pages
    } catch (e) {
        console.error('加载评论失败:', e)
        error('加载评论失败')
    } finally {
        loading.value = false
    }
}

// 加载更多
async function load_more() {
    if (!has_more.value) return
    page.value++
    await load_comments(true)
}

// 提交评论
async function handle_submit(data: {
    content: string
    markdown: boolean
    guest_name?: string
    guest_email?: string
    guest_avatar?: string
}) {
    try {
        const request_data: {
            target_type: CommentTarget
            target_id: string
            parent_id?: string | null
            reply_to_user_id?: string | null
            reply_to_guest_name?: string | null
            content: string
            markdown: boolean
            guest_name?: string
            guest_email?: string
            guest_avatar?: string
        } = {
            target_type: props.target_type,
            target_id: props.target_id,
            content: data.content,
            markdown: data.markdown
        }

        // 回复信息
        if (reply_to.value) {
            request_data.parent_id = reply_to.value.parent_id || reply_to.value.id
            if (reply_to.value.author.user_id) {
                request_data.reply_to_user_id = reply_to.value.author.user_id
            } else {
                request_data.reply_to_guest_name = reply_to.value.author.name
            }
        }

        // 游客信息
        if (!is_logged_in.value) {
            request_data.guest_name = data.guest_name
            request_data.guest_email = data.guest_email
            request_data.guest_avatar = data.guest_avatar
        }

        const new_comment = is_logged_in.value
            ? await create_comment(request_data)
            : await create_guest_comment(request_data as Parameters<typeof create_guest_comment>[0])

        // 添加到列表
        if (reply_to.value) {
            // 回复：添加到对应评论的 replies 中
            const parent = comments.value.find(c => c.id === request_data.parent_id)
            if (parent) {
                parent.replies.push(new_comment)
                parent.reply_count++
            }
        } else {
            // 一级评论：添加到列表开头
            comments.value.unshift(new_comment)
        }

        // 重置回复状态
        reply_to.value = null
        success('评论发表成功')
    } catch (e) {
        console.error('发表评论失败:', e)
        error('发表评论失败')
    }
}

// 回复评论
function handle_reply(comment: Comment) {
    reply_to.value = comment
}

// 取消回复
function handle_cancel_reply() {
    reply_to.value = null
}

// 评论数量
const comment_count = computed(() => {
    let count = comments.value.length
    comments.value.forEach(c => {
        count += c.replies.length
    })
    return count
})

// 初始化
onMounted(() => {
    load_comments()
})
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- 标题 -->
        <div class="flex items-center justify-between">
            <h3 class="text-base font-medium text-slate-700">
                评论 <span class="text-slate-400">{{ comment_count }}</span>
            </h3>
        </div>

        <!-- 评论表单 -->
        <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
            <CommentForm
                v-if="!reply_to"
                @submit="handle_submit"
            />
            <CommentForm
                v-else
                :reply_to_name="reply_to.author.name"
                @submit="handle_submit"
                @cancel="handle_cancel_reply"
            />
        </div>

        <!-- 回复提示 -->
        <div
            v-if="reply_to"
            class="flex items-center justify-between px-4 py-2 rounded-lg bg-[var(--c-primary-bg)] text-sm"
        >
            <span>
                回复 <span class="font-medium text-[var(--c-primary)]">@{{ reply_to.author.name }}</span>
            </span>
            <button
                @click="handle_cancel_reply"
                class="text-slate-500 hover:text-slate-700"
            >
                取消
            </button>
        </div>

        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="flex flex-col divide-y divide-[var(--c-border)]">
            <CommentItem
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment"
                @reply="handle_reply"
            />
        </div>

        <!-- 加载更多 -->
        <div v-if="has_more" class="flex justify-center py-4">
            <button
                @click="load_more"
                :disabled="loading"
                class="px-4 py-2 text-sm text-[var(--c-primary)] hover:bg-[var(--c-primary-bg)] rounded-lg transition-colors disabled:opacity-50"
            >
                {{ loading ? '加载中...' : '加载更多' }}
            </button>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && comments.length === 0" class="py-12 text-center">
            <div class="i-lucide-message-circle w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p class="text-sm text-slate-400">暂无评论，来说点什么吧~</p>
        </div>

        <!-- 加载中 -->
        <div v-if="loading && comments.length === 0" class="py-8 text-center">
            <div class="i-lucide-loader-2 w-6 h-6 mx-auto animate-spin text-slate-400" />
        </div>

        <!-- 回到顶部 -->
        <BackToTop />
    </div>
</template>