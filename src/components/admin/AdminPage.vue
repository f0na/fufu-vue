<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BackToTop from '@/components/common/BackToTop.vue'
import {
  ArrowLeft,
  User,
  Bell,
  Menu,
  Users,
  FolderOpen,
  Settings,
  MessageSquare,
  Shield,
} from 'lucide-vue-next'

// 导入标签页组件
import UserSettingsTab from './UserSettingsTab.vue'
import AnnouncementTab from './AnnouncementTab.vue'
import MenuTab from './MenuTab.vue'
import ManagerTab from './ManagerTab.vue'
import FilesTab from './FilesTab.vue'
import SettingsTab from './SettingsTab.vue'
import SensitiveWordsTab from './SensitiveWordsTab.vue'
import CommentsTab from './CommentsTab.vue'

const router = useRouter()

// 当前标签页
const active_tab = ref<string>('user')

// 标签页配置
const tabs = [
  { key: 'user', label: '用户管理', icon: User },
  { key: 'announcement', label: '公告管理', icon: Bell },
  { key: 'menu', label: '菜单管理', icon: Menu },
  { key: 'manager', label: '管理员管理', icon: Users },
  { key: 'files', label: '文件管理', icon: FolderOpen },
  { key: 'settings', label: '设置', icon: Settings },
  { key: 'words', label: '敏感词管理', icon: Shield },
  { key: 'comments', label: '评论管理', icon: MessageSquare },
]

// 返回
function go_back() {
  router.push({ name: 'home-content' })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 返回按钮 -->
    <button
      @click="go_back"
      class="flex items-center gap-1 text-sm text-slate-500 hover:text-[var(--c-primary)] transition-colors self-start"
    >
      <ArrowLeft class="w-4 h-4" />
      返回首页
    </button>

    <!-- 标签页导航 -->
    <div
      class="flex flex-wrap gap-2 p-2 rounded-xl bg-white border border-[var(--c-border)] shadow-sm"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="active_tab = tab.key"
        class="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors"
        :class="
          active_tab === tab.key
            ? 'bg-[var(--c-primary)] text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100'
        "
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- 标签页内容 -->
    <div class="min-h-[400px]">
      <UserSettingsTab v-if="active_tab === 'user'" />
      <AnnouncementTab v-else-if="active_tab === 'announcement'" />
      <MenuTab v-else-if="active_tab === 'menu'" />
      <ManagerTab v-else-if="active_tab === 'manager'" />
      <FilesTab v-else-if="active_tab === 'files'" />
      <SettingsTab v-else-if="active_tab === 'settings'" />
      <SensitiveWordsTab v-else-if="active_tab === 'words'" />
      <CommentsTab v-else-if="active_tab === 'comments'" />
    </div>

    <!-- 回到顶部 -->
    <BackToTop />
  </div>
</template>
