<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import FriendsList from '@/components/friends/friends-list.vue';
import FriendsSidebar from '@/components/friends/friends-sidebar.vue';
import ProfileCard from '@/components/entrance/profile-card.vue';
import Announcement from '@/components/home/announcement.vue';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import { get_friends } from '@/lib/friends';
import type { FriendItem } from '@/lib/types/friend';

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
    announcements?: Array<{ id: string; content: string; time: string }>;
    max_display?: number;
  };
}

withDefaults(defineProps<Props>(), {
  profile_props: () => ({}),
  announcement_props: () => ({}),
});

const friends = ref<FriendItem[]>([]);
const page = ref(1);
const has_more = ref(true);
const is_loading = ref(false);

const load_friends = async (reset = false) => {
  if (is_loading.value) return;
  is_loading.value = true;

  try {
    const result = await get_friends({
      page: reset ? 1 : page.value + 1,
      limit: 12,
    });

    if (reset) {
      friends.value = result.friends;
      page.value = 1;
    } else {
      friends.value = [...friends.value, ...result.friends];
      page.value = result.page;
    }
    has_more.value = result.has_more;
  } catch (error) {
    console.error('Failed to fetch friends:', error);
  } finally {
    is_loading.value = false;
  }
};

const infinite_scroll = useInfiniteScroll({
  has_more: has_more.value,
  onLoadMore: async () => {
    if (!is_loading.value && has_more.value) {
      await load_friends();
    }
  },
  root_margin: '100px',
  disabled: is_loading.value || friends.value.length === 0,
});

onMounted(async () => {
  await nextTick();
  await load_friends(true);
});
</script>

<template>
  <div>
    <div class="flex flex-col lg:flex-row gap-6">
      <aside class="hidden lg:flex flex-col gap-4 w-[16%] shrink-0">
        <ProfileCard v-bind="profile_props" class="w-full" />
        <Announcement
          :title="announcement_props?.title"
          :announcements="announcement_props?.announcements"
        />
      </aside>

      <main class="flex-1 lg:w-[60%] min-w-0">
        <div class="lg:hidden mb-4">
          <FriendsSidebar :is_portal_target="false" />
        </div>

        <FriendsList
          :friends="friends"
          :is_loading="is_loading || infinite_scroll.isLoading.value"
          :has_more="has_more"
        />
      </main>

      <aside class="hidden lg:block w-[20%] shrink-0">
        <FriendsSidebar :is_portal_target="true" />
      </aside>
    </div>
  </div>
</template>
