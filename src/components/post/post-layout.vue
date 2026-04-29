<script setup lang="ts">
import { ref } from 'vue';
import ProfileCard from '@/components/entrance/profile-card.vue';
import Announcement, { type AnnouncementItem } from '@/components/home/announcement.vue';
import { cn } from '@/lib/utils';

interface Props {
  profile_props?: {
    name?: string;
    avatar_url?: string;
    greeting?: string;
    social_links?: {
      bilibili?: string;
      github?: string;
      email?: string;
    };
  };
  announcement_props?: {
    title?: string;
    announcements?: AnnouncementItem[];
    max_display?: number;
  };
  class?: string;
}

const props = defineProps<Props>();

const portal_target_ref = ref<HTMLDivElement | null>(null);
</script>

<template>
  <div :class="cn('w-full flex justify-center', props.class)">
    <!-- 三栏容器 - 黄金比例宽度 61.8% -->
    <div class="w-full max-w-[61.8%] px-4">
      <!-- 桌面端三栏布局，移动端单栏 -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧栏 -->
        <aside class="flex flex-col gap-4 lg:w-[16%] shrink-0 order-1">
          <ProfileCard
            :name="profile_props?.name"
            :avatar_url="profile_props?.avatar_url"
            :greeting="profile_props?.greeting"
            :social_links="profile_props?.social_links"
            class="w-full"
          />
          <Announcement
            :title="announcement_props?.title"
            :announcements="announcement_props?.announcements"
            :max_display="announcement_props?.max_display"
          />
        </aside>

        <!-- 中间内容区 -->
        <main class="flex-1 min-w-0 order-2 lg:order-2 space-y-6">
          <!-- 文章内容 -->
          <slot />

          <!-- 推荐文章区域 -->
          <div v-if="$slots.recommended_posts" class="mt-8">
            <slot name="recommended_posts" />
          </div>
        </main>

        <!-- 右侧栏 - 文章信息 -->
        <aside class="hidden lg:flex lg:w-[20%] shrink-0 order-3 flex-col gap-4">
          <!-- Portal target - Live2D 会渲染到这里（顶部） -->
          <div ref="portal_target_ref" />
          <slot v-if="$slots.right_sidebar" name="right_sidebar" />
        </aside>
      </div>

      <!-- 评论区 - 三栏下方全宽显示 -->
      <div v-if="$slots.comments_section" class="mt-8 w-full">
        <slot name="comments_section" />
      </div>
    </div>
  </div>
</template>
