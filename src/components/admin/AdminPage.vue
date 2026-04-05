<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    get_sensitive_words,
    add_sensitive_word,
    delete_sensitive_word,
    get_admin_comments,
    delete_comment,
    update_comment_status
} from '@/api/comment'
import { useToast } from '@/composables/useToast'
import type { SensitiveWord, Comment } from '@/api/types'
import BackToTop from '@/components/common/BackToTop.vue'

const router = useRouter()
const { success, error } = useToast()

// 当前标签页
const active_tab = ref<'words' | 'comments'>('words')

// ========== 敏感词管理 ==========

const words = ref<SensitiveWord[]>([])
const words_loading = ref(false)
const word_input = ref('')
const word_level = ref<'filter' | 'hide'>('filter')
const word_filter_level = ref<'filter' | 'hide' | ''>('')
const word_keyword = ref('')

// 加载敏感词列表
async function load_words() {
    words_loading.value = true
    try {
        const res = await get_sensitive_words({
            level: word_filter_level.value || undefined,
            keyword: word_keyword.value || undefined
        })
        words.value = res || []
    } catch (e) {
        console.error('加载敏感词失败:', e)
        error('加载敏感词失败')
    } finally {
        words_loading.value = false
    }
}

// 添加敏感词
async function handle_add_word() {
    if (!word_input.value.trim()) {
        error('请输入敏感词')
        return
    }

    try {
        await add_sensitive_word(word_input.value.trim(), word_level.value)
        success('添加成功')
        word_input.value = ''
        load_words()
    } catch (e) {
        console.error('添加敏感词失败:', e)
        error('添加失败')
    }
}

// 删除敏感词
async function handle_delete_word(id: string) {
    try {
        await delete_sensitive_word(id)
        success('删除成功')
        load_words()
    } catch (e) {
        console.error('删除敏感词失败:', e)
        error('删除失败')
    }
}

// ========== 评论管理 ==========

const comments = ref<Comment[]>([])
const comments_loading = ref(false)
const comment_page = ref(1)
const comment_total = ref(0)
const comment_filter_status = ref<'normal' | 'hidden' | ''>('')
const comment_keyword = ref('')

// 加载评论列表
async function load_comments() {
    comments_loading.value = true
    try {
        const res = await get_admin_comments({
            status: comment_filter_status.value || undefined,
            keyword: comment_keyword.value || undefined,
            page: comment_page.value,
            per_page: 20
        })
        comments.value = res.items
        comment_total.value = res.pagination.total
    } catch (e) {
        console.error('加载评论失败:', e)
        error('加载评论失败')
    } finally {
        comments_loading.value = false
    }
}

// 删除评论
async function handle_delete_comment(id: string) {
    try {
        await delete_comment(id)
        success('删除成功')
        load_comments()
    } catch (e) {
        console.error('删除评论失败:', e)
        error('删除失败')
    }
}

// 切换评论状态
async function handle_toggle_status(comment: Comment) {
    const new_status = comment.status === 'normal' ? 'hidden' : 'normal'
    try {
        await update_comment_status(comment.id, new_status)
        success('状态更新成功')
        load_comments()
    } catch (e) {
        console.error('更新状态失败:', e)
        error('更新失败')
    }
}

// 返回
function go_back() {
    router.push('/home')
}

// 初始化
onMounted(() => {
    load_words()
    load_comments()
})

// 搜索敏感词
function search_words() {
    load_words()
}

// 搜索评论
function search_comments() {
    comment_page.value = 1
    load_comments()
}

// 筛选敏感词级别
function filter_words() {
    load_words()
}

// 筛选评论状态
function filter_comments() {
    comment_page.value = 1
    load_comments()
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- 返回按钮 -->
        <button
            @click="go_back"
            class="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--c-primary)] transition-colors self-start"
        >
            <div class="i-lucide-arrow-left w-4 h-4" />
            返回首页
        </button>

        <!-- 标签页 -->
        <div class="flex border-b border-[var(--c-border)]">
            <button
                @click="active_tab = 'words'"
                class="px-6 py-3 text-sm font-medium transition-colors"
                :class="active_tab === 'words' ? 'text-[var(--c-primary)] border-b-2 border-[var(--c-primary)]' : 'text-slate-500 hover:text-slate-700'"
            >
                敏感词管理
            </button>
            <button
                @click="active_tab = 'comments'"
                class="px-6 py-3 text-sm font-medium transition-colors"
                :class="active_tab === 'comments' ? 'text-[var(--c-primary)] border-b-2 border-[var(--c-primary)]' : 'text-slate-500 hover:text-slate-700'"
            >
                评论管理
            </button>
        </div>

        <!-- 敏感词管理 -->
        <div v-if="active_tab === 'words'" class="flex flex-col gap-4">
            <!-- 添加敏感词 -->
            <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
                <div class="flex items-center gap-3">
                    <input
                        v-model="word_input"
                        type="text"
                        placeholder="输入敏感词"
                        class="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
                    />
                    <select
                        v-model="word_level"
                        class="px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:outline-none"
                    >
                        <option value="filter">替换为 ***</option>
                        <option value="hide">自动隐藏评论</option>
                    </select>
                    <button
                        @click="handle_add_word"
                        class="px-4 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white hover:shadow-md transition-all"
                    >
                        添加
                    </button>
                </div>
            </div>

            <!-- 搜索和筛选 -->
            <div class="flex items-center gap-3">
                <input
                    v-model="word_keyword"
                    type="text"
                    placeholder="搜索敏感词"
                    class="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
                    @keyup.enter="search_words"
                />
                <select
                    v-model="word_filter_level"
                    @change="filter_words"
                    class="px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:outline-none"
                >
                    <option value="">全部级别</option>
                    <option value="filter">替换为 ***</option>
                    <option value="hide">自动隐藏评论</option>
                </select>
            </div>

            <!-- 敏感词列表 -->
            <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
                <div v-if="words_loading" class="py-8 text-center">
                    <div class="i-lucide-loader-2 w-6 h-6 mx-auto animate-spin text-slate-400" />
                </div>
                <div v-else-if="words.length === 0" class="py-8 text-center text-sm text-slate-400">
                    暂无敏感词
                </div>
                <div v-else class="flex flex-col gap-2">
                    <div
                        v-for="word in words"
                        :key="word.id"
                        class="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50"
                    >
                        <div class="flex items-center gap-3">
                            <span class="text-sm text-slate-700">{{ word.word }}</span>
                            <span
                                class="px-2 py-0.5 text-xs rounded"
                                :class="word.level === 'hide' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'"
                            >
                                {{ word.level === 'hide' ? '隐藏' : '替换' }}
                            </span>
                        </div>
                        <button
                            @click="handle_delete_word(word.id)"
                            class="text-xs text-red-500 hover:text-red-600"
                        >
                            删除
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 评论管理 -->
        <div v-if="active_tab === 'comments'" class="flex flex-col gap-4">
            <!-- 搜索和筛选 -->
            <div class="flex items-center gap-3">
                <input
                    v-model="comment_keyword"
                    type="text"
                    placeholder="搜索评论内容"
                    class="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:outline-none"
                    @keyup.enter="search_comments"
                />
                <select
                    v-model="comment_filter_status"
                    @change="filter_comments"
                    class="px-3 py-2 text-sm rounded-lg border border-[var(--c-border)] focus:border-[var(--c-primary)] focus:outline-none"
                >
                    <option value="">全部状态</option>
                    <option value="normal">正常</option>
                    <option value="hidden">已隐藏</option>
                </select>
            </div>

            <!-- 评论列表 -->
            <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
                <div v-if="comments_loading" class="py-8 text-center">
                    <div class="i-lucide-loader-2 w-6 h-6 mx-auto animate-spin text-slate-400" />
                </div>
                <div v-else-if="comments.length === 0" class="py-8 text-center text-sm text-slate-400">
                    暂无评论
                </div>
                <div v-else class="flex flex-col gap-3">
                    <div
                        v-for="comment in comments"
                        :key="comment.id"
                        class="p-4 rounded-lg bg-slate-50 border border-[var(--c-border)]"
                    >
                        <!-- 作者信息 -->
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-sm font-medium text-slate-700">{{ comment.author.name }}</span>
                            <span v-if="comment.author.admin" class="px-1.5 py-0.5 text-xs rounded bg-[var(--c-primary)] text-white">
                                管理员
                            </span>
                            <span
                                class="px-1.5 py-0.5 text-xs rounded"
                                :class="comment.status === 'hidden' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'"
                            >
                                {{ comment.status === 'hidden' ? '已隐藏' : '正常' }}
                            </span>
                            <span class="text-xs text-slate-400">
                                {{ comment.target_type === 'gallery' ? '相册' : '番剧' }}
                            </span>
                        </div>

                        <!-- 评论内容 -->
                        <div class="text-sm text-slate-600 mb-3 line-clamp-2">
                            {{ comment.content }}
                        </div>

                        <!-- 操作 -->
                        <div class="flex items-center gap-2">
                            <button
                                @click="handle_toggle_status(comment)"
                                class="px-3 py-1 text-xs rounded border border-[var(--c-border)] text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                {{ comment.status === 'normal' ? '隐藏' : '显示' }}
                            </button>
                            <button
                                @click="handle_delete_comment(comment.id)"
                                class="px-3 py-1 text-xs rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                            >
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 回到顶部 -->
        <BackToTop />
    </div>
</template>