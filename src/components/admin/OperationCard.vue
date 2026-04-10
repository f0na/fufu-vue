<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useLinkEdit } from '@/composables/useLinkEdit'
import { useBangumiEdit } from '@/composables/useBangumiEdit'
import { useGalleryEdit } from '@/composables/useGalleryEdit'
import { useFriendEdit } from '@/composables/useFriendEdit'
import { usePostEdit } from '@/composables/usePostEdit'
import {
  User,
  LayoutDashboard,
  Plus,
  Edit,
  Eye,
  FileEdit,
  Pin,
  Trash2,
  CheckCircle,
  LogOut,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { logout, loading, can_add, can_edit, can_delete, can_toggle_visibility, user, is_admin } =
  useAuth()
const { toggle_edit_mode: toggle_link_edit_mode, reset_edit_mode: reset_link_edit_mode } =
  useLinkEdit()
const { toggle_edit_mode: toggle_bangumi_edit_mode, reset_edit_mode: reset_bangumi_edit_mode } =
  useBangumiEdit()
const { toggle_edit_mode: toggle_gallery_edit_mode, reset_edit_mode: reset_gallery_edit_mode } =
  useGalleryEdit()
const { toggle_edit_mode: toggle_friend_edit_mode, reset_edit_mode: reset_friend_edit_mode } =
  useFriendEdit()
const { set_edit_mode: set_post_edit_mode, reset_edit_mode: reset_post_edit_mode } = usePostEdit()

// 角色显示文本
const role_text = computed(() => {
  return user.value?.role === 'admin' ? '管理员' : '用户'
})

// 是否在链接页
const is_links_page = computed(() => route.name === 'links')

// 是否在番剧页（包括列表页和详情页）
const is_bangumi_page = computed(
  () =>
    route.name === 'bangumi' ||
    route.name === 'bangumi-detail' ||
    route.name === 'bangumi-add' ||
    route.name === 'bangumi-edit',
)

// 是否在相册页
const is_gallery_page = computed(
  () =>
    route.name === 'gallery-list' || route.name === 'gallery-add' || route.name === 'gallery-edit',
)

// 是否在友人帐页
const is_friends_page = computed(
  () =>
    route.name === 'friends' ||
    route.name === 'friends-add' ||
    route.name === 'friends-edit' ||
    route.name === 'friends-approve',
)

// 是否在文章页
const is_posts_page = computed(
  () =>
    route.name === 'posts' ||
    route.name === 'posts-add' ||
    route.name === 'posts-edit' ||
    route.name === 'posts-detail',
)

// 是否显示管理按钮
const show_manage_buttons = computed(
  () =>
    is_links_page.value ||
    is_bangumi_page.value ||
    is_gallery_page.value ||
    is_friends_page.value ||
    is_posts_page.value,
)

async function handle_logout() {
  await logout()
  router.push('/home')
}

function handle_panel() {
  router.push('/home/admin')
}

function handle_add() {
  if (is_links_page.value) {
    router.push('/home/links/add')
  } else if (is_bangumi_page.value) {
    // 番剧详情页：设置添加模式，在当前页面添加追番记录
    // 番剧列表页：跳转到添加页面
    if (route.name === 'bangumi-detail') {
      toggle_bangumi_edit_mode('add')
    } else {
      router.push('/home/bangumi/add')
    }
  } else if (is_gallery_page.value) {
    router.push('/home/gallery/add')
  } else if (is_friends_page.value) {
    router.push('/home/friends/add')
  } else if (is_posts_page.value) {
    router.push('/home/posts/add')
  }
}

function handle_edit() {
  if (is_links_page.value) {
    toggle_link_edit_mode('edit')
  } else if (is_bangumi_page.value) {
    toggle_bangumi_edit_mode('edit')
  } else if (is_gallery_page.value) {
    toggle_gallery_edit_mode('edit')
  } else if (is_friends_page.value) {
    toggle_friend_edit_mode('edit')
  } else if (is_posts_page.value) {
    set_post_edit_mode('edit')
  }
}

function handle_toggle_visibility() {
  if (is_links_page.value) {
    toggle_link_edit_mode('visibility')
  } else if (is_bangumi_page.value) {
    toggle_bangumi_edit_mode('visibility')
  } else if (is_gallery_page.value) {
    toggle_gallery_edit_mode('visibility')
  } else if (is_friends_page.value) {
    toggle_friend_edit_mode('visibility')
  } else if (is_posts_page.value) {
    set_post_edit_mode('status')
  }
}

function handle_delete() {
  if (is_links_page.value) {
    toggle_link_edit_mode('delete')
  } else if (is_bangumi_page.value) {
    toggle_bangumi_edit_mode('delete')
  } else if (is_gallery_page.value) {
    toggle_gallery_edit_mode('delete')
  } else if (is_friends_page.value) {
    toggle_friend_edit_mode('delete')
  } else if (is_posts_page.value) {
    set_post_edit_mode('delete')
  }
}

// 置顶（仅文章页）
function handle_top() {
  set_post_edit_mode('top')
}

// 审批（仅友人帐页）
function handle_approve() {
  router.push('/home/friends/approve')
}

// 点击头像跳转个人信息页
function go_to_profile() {
  // TODO: 跳转到个人信息页
}

// 监听路由变化，重置所有操作模式
watch(
  () => route.path,
  () => {
    reset_link_edit_mode()
    reset_bangumi_edit_mode()
    reset_gallery_edit_mode()
    reset_friend_edit_mode()
    reset_post_edit_mode()
  },
)
</script>

<template>
  <div class="p-4 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
    <!-- 用户信息区域 -->
    <div class="flex items-center gap-3 mb-3">
      <!-- 头像（可点击跳转个人信息页） -->
      <button
        @click="go_to_profile"
        class="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--c-border)] hover:border-[var(--c-primary)] transition-colors cursor-pointer flex-shrink-0"
      >
        <img
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user.display_name || user.username"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-[var(--c-primary-bg)] flex items-center justify-center">
          <User class="text-[var(--c-primary)] w-5 h-5" />
        </div>
      </button>

      <!-- 名字 -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-slate-700 truncate">
          {{ user?.display_name || user?.username }}
        </p>
      </div>
    </div>

    <!-- 身份和签名 -->
    <div class="flex items-center gap-2 mb-4 text-xs text-slate-500">
      <span
        class="px-2 py-0.5 rounded bg-[var(--c-primary-bg)] text-[var(--c-primary)] font-medium"
      >
        {{ role_text }}
      </span>
      <span class="truncate flex-1" :class="{ 'text-slate-400': !user?.bio }">
        {{ user?.bio || '暂无签名' }}
      </span>
    </div>

    <!-- 操作按钮 -->
    <div class="space-y-2">
      <!-- 面板（仅管理员） -->
      <button
        v-if="is_admin"
        @click="handle_panel"
        :disabled="loading"
        class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <LayoutDashboard class="w-4 h-4" />
        面板
      </button>

      <!-- 添加 -->
      <button
        v-if="can_add && show_manage_buttons"
        @click="handle_add"
        :disabled="loading"
        class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <Plus class="w-4 h-4" />
        添加
      </button>

      <!-- 编辑 -->
      <button
        v-if="can_edit && show_manage_buttons"
        @click="handle_edit"
        :disabled="loading"
        class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <Edit class="w-4 h-4" />
        编辑
      </button>

      <!-- 显/隐 -->
      <button
        v-if="can_toggle_visibility && show_manage_buttons && !is_posts_page"
        @click="handle_toggle_visibility"
        :disabled="loading"
        class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <Eye class="w-4 h-4" />
        显/隐
      </button>

      <!-- 状态（文章页） -->
      <button
        v-if="can_toggle_visibility && is_posts_page"
        @click="handle_toggle_visibility"
        :disabled="loading"
        class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <FileEdit class="w-4 h-4" />
        状态
      </button>

      <!-- 置顶（文章页） -->
      <button
        v-if="can_edit && is_posts_page"
        @click="handle_top"
        :disabled="loading"
        class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <Pin class="w-4 h-4" />
        置顶
      </button>

      <!-- 删除 -->
      <button
        v-if="can_delete && show_manage_buttons"
        @click="handle_delete"
        :disabled="loading"
        class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <Trash2 class="w-4 h-4" />
        删除
      </button>

      <!-- 审批（仅友人帐页） -->
      <button
        v-if="can_edit && is_friends_page"
        @click="handle_approve"
        :disabled="loading"
        class="w-full px-3 py-2 bg-[var(--c-primary-bg)] border border-[var(--c-border)] text-slate-600 rounded-lg hover:bg-[var(--c-primary)] hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <CheckCircle class="w-4 h-4" />
        审批
      </button>

      <!-- 登出 -->
      <button
        @click="handle_logout"
        :disabled="loading"
        class="w-full px-3 py-2 bg-red-50 border border-red-200 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
      >
        <LogOut class="w-4 h-4" />
        登出
      </button>
    </div>
  </div>
</template>
