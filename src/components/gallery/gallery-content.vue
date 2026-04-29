<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { get_galleries } from '@/lib/gallery-data';
import ProfileCard from '@/components/entrance/profile-card.vue';
import Announcement, { type AnnouncementItem } from '@/components/home/announcement.vue';
import GalleryList from '@/components/gallery/gallery-list.vue';
import GallerySidebar from '@/components/gallery/gallery-sidebar.vue';
import type { Gallery } from '@/lib/types/gallery';

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
}

defineProps<Props>();

const selected_tags = ref<string[]>([]);
const galleries = ref<Gallery[]>([]);

onMounted(async () => {
  await nextTick();
  galleries.value = await get_galleries();
});

const all_tags = computed(() => {
  const tag_set = new Set<string>();
  galleries.value.forEach((gallery) => {
    gallery.tags?.forEach((tag) => tag_set.add(tag));
  });
  return Array.from(tag_set);
});

const filtered_galleries = computed(() => {
  if (selected_tags.value.length === 0) return galleries.value;
  return galleries.value.filter((gallery) =>
    gallery.tags?.some((tag) => selected_tags.value.includes(tag))
  );
});
</script>

<template>
  <div class="w-full max-w-[61.8%] px-4">
    <!-- 三栏布局 -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 左侧边栏 -->
      <aside class="hidden lg:flex flex-col gap-4 w-[16%] shrink-0">
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
        />
      </aside>

      <!-- 中间相册列表区 -->
      <main class="flex-1 lg:w-[60%] min-w-0">
        <!-- 移动端筛选栏 -->
        <div class="lg:hidden mb-4">
          <GallerySidebar v-model:tags="selected_tags" :all_tags="all_tags" />
        </div>

        <!-- 相册列表 -->
        <GalleryList :galleries="filtered_galleries" />
      </main>

      <!-- 右侧边栏 -->
      <aside class="hidden lg:block w-[20%] shrink-0">
        <GallerySidebar
          v-model:tags="selected_tags"
          :all_tags="all_tags"
          :is_portal_target="true"
        />
      </aside>
    </div>
  </div>
</template>
