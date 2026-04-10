<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import CommentEditor from './CommentEditor.vue'

const props = defineProps<{
  placeholder?: string
  reply_to_name?: string
}>()

const emit = defineEmits<{
  (
    e: 'submit',
    data: {
      content: string
      markdown: boolean
      guest_name?: string
      guest_email?: string
      guest_avatar?: string
    },
  ): void
  (e: 'cancel'): void
}>()

const { is_logged_in } = useAuth()

// 评论内容
const content = ref('')

// 是否使用 Markdown 格式
const is_markdown = ref(false)

// 游客信息
const guest_name = ref('')
const guest_email = ref('')
const guest_avatar = ref('')

// 编辑器引用
const editor_ref = ref<InstanceType<typeof CommentEditor> | null>(null)

// 是否显示游客信息表单
const show_guest_form = computed(() => !is_logged_in.value)

// 是否可以提交
const can_submit = computed(() => {
  if (!content.value.trim()) return false
  if (show_guest_form.value) {
    if (!guest_name.value.trim()) return false
    if (!guest_email.value.trim()) return false
  }
  return true
})

// 提交评论
function handle_submit() {
  if (!can_submit.value) return

  const data: {
    content: string
    markdown: boolean
    guest_name?: string
    guest_email?: string
    guest_avatar?: string
  } = {
    content: content.value.trim(),
    markdown: is_markdown.value,
  }

  if (show_guest_form.value) {
    data.guest_name = guest_name.value.trim()
    data.guest_email = guest_email.value.trim()
    if (guest_avatar.value.trim()) {
      data.guest_avatar = guest_avatar.value.trim()
    }
  }

  emit('submit', data)

  // 重置表单
  content.value = ''
  is_markdown.value = false
  editor_ref.value?.clear()
}

// 取消
function handle_cancel() {
  emit('cancel')
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- 回复提示 -->
    <div v-if="reply_to_name" class="flex items-center gap-2 text-sm text-slate-500">
      <span>回复</span>
      <span class="text-[var(--c-primary)] font-medium">@{{ reply_to_name }}</span>
    </div>

    <!-- 评论编辑器 -->
    <CommentEditor
      ref="editor_ref"
      v-model="content"
      v-model:is_markdown="is_markdown"
      :placeholder="placeholder || '写下你的评论...'"
      :maxlength="500"
    />

    <!-- 游客信息表单 -->
    <div
      v-if="show_guest_form"
      class="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200"
    >
      <div class="text-xs text-slate-500 mb-1">游客信息</div>
      <div class="flex flex-wrap gap-2">
        <div class="flex-1 min-w-[120px] flex flex-col gap-1">
          <input
            v-model="guest_name"
            type="text"
            placeholder="名称 *"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:border-[var(--c-primary)]"
            maxlength="20"
          />
        </div>
        <div class="flex-1 min-w-[150px] flex flex-col gap-1">
          <input
            v-model="guest_email"
            type="email"
            placeholder="邮箱 *"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:border-[var(--c-primary)]"
          />
        </div>
      </div>
      <input
        v-model="guest_avatar"
        type="url"
        placeholder="头像链接（可选）"
        class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--c-primary)]/20 focus:border-[var(--c-primary)]"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center justify-end gap-2">
      <button
        v-if="reply_to_name"
        @click="handle_cancel"
        class="px-4 py-2 text-sm rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        取消
      </button>
      <button
        @click="handle_submit"
        :disabled="!can_submit"
        class="px-4 py-2 text-sm rounded-lg bg-[var(--c-primary)] text-white transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        发表评论
      </button>
    </div>
  </div>
</template>
