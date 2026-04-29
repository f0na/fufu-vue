<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import ArchiveList from '@/components/archive/archive-list.vue';
import ArchiveSidebar from '@/components/archive/archive-sidebar.vue';
import ProfileCard from '@/components/entrance/profile-card.vue';
import Announcement from '@/components/home/announcement.vue';
import { get_posts, get_all_tags, get_all_years } from '@/lib/posts';
import type { Post } from '@/lib/types/post';

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

const posts = ref<Post[]>([]);
const page = ref(1);
const has_more = ref(true);
const is_loading = ref(false);
const sort = ref<'asc' | 'desc'>('desc');
const year = ref<string | undefined>(undefined);
const selected_tags = ref<string[]>([]);
const years = ref<string[]>([]);
const all_tags = ref<string[]>([]);

const load_posts = async (reset = false) => {
  if (is_loading.value) return;
  is_loading.value = true;

  try {
    const params: Record<string, unknown> = {
      page: reset ? 1 : page.value + 1,
      limit: 10,
      sort: sort.value,
    };
    if (year.value) params.year = year.value;
    if (selected_tags.value.length > 0) params.tags = selected_tags.value;

    const result = await get_posts(params);

    if (reset) {
      posts.value = result.posts;
      page.value = 1;
    } else {
      posts.value = [...posts.value, ...result.posts];
      page.value = result.page;
    }
    has_more.value = result.has_more;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
  } finally {
    is_loading.value = false;
  }
};

const handle_sort_change = (new_sort: 'asc' | 'desc') => {
  sort.value = new_sort;
};

const handle_year_change = (new_year: string | undefined) => {
  year.value = new_year;
};

const handle_tags_change = (new_tags: string[]) => {
  selected_tags.value = new_tags;
};

watch(
  [year, selected_tags, sort],
  () => {
    load_posts(true);
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  const [tags_result, years_result] = await Promise.all([get_all_tags(), get_all_years()]);
  all_tags.value = Object.keys(tags_result).sort();
  years.value = Object.keys(years_result).sort((a, b) => Number(b) - Number(a));

  await load_posts(true);
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
          <ArchiveSidebar
            :sort="sort"
            @update:sort="handle_sort_change"
            :year="year"
            @update:year="handle_year_change"
            :years="years"
            :tags="selected_tags"
            @update:tags="handle_tags_change"
            :all_tags="all_tags"
            :is_portal_target="false"
          />
        </div>

        <ArchiveList :posts="posts" :is_loading="is_loading || false" :has_more="has_more" />
      </main>

      <aside class="hidden lg:block w-[20%] shrink-0">
        <ArchiveSidebar
          :sort="sort"
          @update:sort="handle_sort_change"
          :year="year"
          @update:year="handle_year_change"
          :years="years"
          :tags="selected_tags"
          @update:tags="handle_tags_change"
          :all_tags="all_tags"
          :is_portal_target="true"
        />
      </aside>
    </div>
  </div>
</template>
