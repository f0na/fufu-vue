<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import ProfileCard from '@/components/entrance/profile-card.vue'
import Announcement from '@/components/home/announcement.vue'
import type { AnnouncementItem } from '@/components/home/announcement.vue'
import { cn } from '@/lib/utils'

interface ProfileProps {
  name?: string
  avatar_url?: string
  greeting?: string
  social_links?: {
    bilibili?: string
    github?: string
    email?: string
  }
}

interface Props {
  children?: any
  profile_props?: ProfileProps
  announcement_props?: {
    title?: string
    announcements?: AnnouncementItem[]
    max_display?: number
  }
  class?: string
}

const props = defineProps<Props>()

const portal_target_ref = ref<HTMLDivElement | null>(null)

// 注册 portal target
onMounted(() => {
  const portal = inject<any>('rightSidebarPortal')
  if (portal && portal_target_ref.value) {
    portal.set_portal_target(portal_target_ref.value)
  }
})

onUnmounted(() => {
  const portal = inject<any>('rightSidebarPortal')
  if (portal) {
    portal.set_portal_target(null)
  }
})
</script>

<template>
  <div :class="cn('w-full flex justify-center', props.class)">
    <div class="w-full max-w-[61.8%] px-4 py-8">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧栏 -->
        <aside class="flex flex-col gap-4 lg:w-[16%] shrink-0 order-1">
          <ProfileCard v-bind="profile_props" class="w-full" />
          <Announcement
            :title="announcement_props?.title"
            :announcements="announcement_props?.announcements"
          />
        </aside>

        <!-- 中间内容区 -->
        <main class="flex-1 min-w-0 order-2 lg:order-2">
          <slot />
        </main>

        <!-- 右侧看板娘区域 -->
        <aside class="hidden lg:block lg:w-[20%] shrink-0 order-3">
          <div ref="portal_target_ref" />
        </aside>
      </div>
    </div>
  </div>
</template>
