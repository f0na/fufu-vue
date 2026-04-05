<script setup lang="ts">
import { computed } from 'vue'
import MarkdownRender from 'markstream-vue'
import type { Comment } from '@/api/types'
import { preprocess_markdown_image_size } from '@/utils/markdown'

const props = defineProps<{
    comment: Comment
    is_reply?: boolean
}>()

const emit = defineEmits<{
    (e: 'reply', comment: Comment): void
}>()

// 格式化时间
function format_time(date_str: string): string {
    const date = new Date(date_str)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`

    return date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric'
    })
}

// 回复评论
function handle_reply() {
    emit('reply', props.comment)
}

// 预处理后的 Markdown 内容
const processed_content = computed(() => {
    if (props.comment.markdown) {
        return preprocess_markdown_image_size(props.comment.content)
    }
    return props.comment.content
})
</script>

<template>
    <div class="flex gap-3" :class="is_reply ? 'py-2' : 'py-3'">
        <!-- 头像 -->
        <div class="shrink-0">
            <div
                class="rounded-full overflow-hidden bg-[var(--c-primary-bg)]"
                :class="is_reply ? 'w-8 h-8' : 'w-10 h-10'"
            >
                <img
                    v-if="comment.author.avatar"
                    :src="comment.author.avatar"
                    :alt="comment.author.name"
                    class="w-full h-full object-cover"
                />
                <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-[var(--c-primary)]"
                    :class="is_reply ? 'text-sm' : 'text-base'"
                >
                    {{ comment.author.name.charAt(0).toUpperCase() }}
                </div>
            </div>
        </div>

        <!-- 内容 -->
        <div class="flex-1 min-w-0">
            <!-- 用户名和时间 -->
            <div class="flex items-center gap-2">
                <span class="font-medium text-slate-700" :class="is_reply ? 'text-sm' : 'text-sm'">
                    {{ comment.author.name }}
                </span>
                <span v-if="comment.author.admin" class="px-1.5 py-0.5 text-xs rounded bg-[var(--c-primary)] text-white">
                    管理员
                </span>
                <span class="text-xs text-slate-400">{{ format_time(comment.created_at) }}</span>
            </div>

            <!-- 评论内容 -->
            <div class="mt-1 text-sm text-slate-600 break-words comment-content">
                <!-- Markdown 格式渲染 -->
                <MarkdownRender
                    v-if="comment.markdown"
                    :content="processed_content"
                />
                <!-- 普通文本格式 -->
                <div
                    v-else
                    class="whitespace-pre-wrap"
                >
                    {{ comment.content }}
                </div>
            </div>

            <!-- 操作 -->
            <div class="mt-2 flex items-center gap-4">
                <button
                    @click="handle_reply"
                    class="text-xs text-slate-400 hover:text-[var(--c-primary)] transition-colors"
                >
                    回复
                </button>
            </div>

            <!-- 回复列表 -->
            <div v-if="!is_reply && comment.replies.length > 0" class="mt-3 pl-3 border-l-2 border-[var(--c-border)]">
                <CommentItem
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    :comment="reply"
                    :is_reply="true"
                    @reply="$emit('reply', $event)"
                />
            </div>
        </div>
    </div>
</template>

<style>
.comment-content p {
    margin: 0;
    line-height: 1.6;
}

.comment-content a {
    color: var(--c-primary);
    text-decoration: underline;
}

.comment-content a:hover {
    opacity: 0.8;
}

.comment-content strong {
    font-weight: 600;
}

.comment-content em {
    font-style: italic;
}

.comment-content code {
    background: #f1f5f9;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
}

.comment-content pre {
    background: #f1f5f9;
    padding: 0.5rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 0.5rem 0;
}

.comment-content pre code {
    background: none;
    padding: 0;
}

.comment-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
}

.comment-content blockquote {
    border-left: 3px solid var(--c-primary);
    padding-left: 0.75rem;
    margin: 0.5rem 0;
    color: #64748b;
}
</style>