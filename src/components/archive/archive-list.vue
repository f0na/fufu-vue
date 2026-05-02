<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { Post } from '@/lib/types/post';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';

interface Props {
  posts?: Post[];
  is_loading?: boolean;
  has_more?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  posts: () => [],
  is_loading: false,
  has_more: true,
});

const { sentinelRef } = useInfiniteScroll({
  has_more: props.has_more,
  onLoadMore: () => {},
  root_margin: '100px',
  disabled: props.is_loading || props.posts.length === 0,
});
void sentinelRef;

interface GroupedPosts {
  [year: string]: Post[];
}

function group_posts_by_year(posts: Post[]): GroupedPosts {
  const grouped: GroupedPosts = {};
  for (const post of posts) {
    const year = new Date(post.date || '').getFullYear().toString();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(post);
  }
  return grouped;
}

function format_date(date_string: string): string {
  const date = new Date(date_string);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

const grouped_posts = computed(() => group_posts_by_year(props.posts));
const years = computed(() =>
  Object.keys(grouped_posts.value).sort((a, b) => Number(b) - Number(a))
);
</script>

<template>
  <div v-if="posts.length === 0 && !is_loading" class="py-8 text-center text-muted-foreground">
    暂无文章
  </div>

  <div v-else class="space-y-8 pb-20">
    <div v-for="year in years" :key="year">
      <h2 class="text-xl font-semibold">{{ year }}年</h2>
      <Separator class="my-3" />
      <ul class="space-y-2">
        <li v-for="post in grouped_posts[year]" :key="post.slug">
          <RouterLink
            :to="`/posts/${post.slug}`"
            :class="cn('flex items-start gap-4 py-2', 'hover:text-primary transition-colors')"
          >
            <time class="text-sm text-muted-foreground shrink-0 tabular-nums">
              {{ format_date(post.date || '') }}
            </time>
            <span class="line-clamp-2">{{ post.title }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <div v-if="has_more" ref="sentinelRef" class="h-20 flex items-center justify-center">
      <Spinner v-if="is_loading" class="size-6" />
    </div>
  </div>
</template>
