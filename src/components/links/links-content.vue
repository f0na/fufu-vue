<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import LinksList from '@/components/links/links-list.vue';
import LinksSidebar from '@/components/links/links-sidebar.vue';
import ProfileCard from '@/components/entrance/profile-card.vue';
import Announcement from '@/components/home/announcement.vue';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import { get_links, get_links_meta } from '@/lib/links';
import type { LinkItem } from '@/lib/types/link';

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

const links = ref<LinkItem[]>([]);
const page = ref(1);
const has_more = ref(true);
const is_loading = ref(false);
const selected_tags = ref<string[]>([]);
const starred = ref(false);
const all_tags = ref<string[]>([]);

const load_links = async (reset = false) => {
  if (is_loading.value) return;
  is_loading.value = true;

  try {
    const result = await get_links({
      page: reset ? 1 : page.value + 1,
      limit: 12,
      tags: selected_tags.value.length > 0 ? selected_tags.value : undefined,
      starred: starred.value || undefined,
    });

    if (reset) {
      links.value = result.links;
      page.value = 1;
    } else {
      links.value = [...links.value, ...result.links];
      page.value = result.page;
    }
    has_more.value = result.has_more;
  } catch (error) {
    console.error('Failed to fetch links:', error);
  } finally {
    is_loading.value = false;
  }
};

const handle_tags_change = (new_tags: string[]) => {
  selected_tags.value = new_tags;
};

const handle_starred_change = (new_starred: boolean) => {
  starred.value = new_starred;
};

const infinite_scroll = useInfiniteScroll({
  has_more: has_more.value,
  onLoadMore: async () => {
    if (!is_loading.value && has_more.value) {
      await load_links();
    }
  },
  root_margin: '100px',
  disabled: is_loading.value || links.value.length === 0,
});

watch(
  [selected_tags, starred],
  () => {
    load_links(true);
  },
  { deep: true }
);

onMounted(async () => {
  await nextTick();
  const meta = await get_links_meta();
  all_tags.value = meta.all_tags;
  await load_links(true);
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
          <LinksSidebar
            :tags="selected_tags"
            @update:tags="handle_tags_change"
            :starred="starred"
            @update:starred="handle_starred_change"
            :all_tags="all_tags"
            :is_portal_target="false"
          />
        </div>

        <LinksList
          :links="links"
          :is_loading="is_loading || infinite_scroll.isLoading.value"
          :has_more="has_more"
        />
      </main>

      <aside class="hidden lg:block w-[20%] shrink-0">
        <LinksSidebar
          :tags="selected_tags"
          @update:tags="handle_tags_change"
          :starred="starred"
          @update:starred="handle_starred_change"
          :all_tags="all_tags"
          :is_portal_target="true"
        />
      </aside>
    </div>
  </div>
</template>
