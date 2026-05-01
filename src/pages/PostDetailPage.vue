<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import PageWrapper from '@/components/layout/page-wrapper.vue';
import PostLayout from '@/components/post/post-layout.vue';
import PostSidebar from '@/components/post/post-sidebar.vue';
import PostContent from '@/components/post/post-content.vue';
import PostRecommend from '@/components/post/post-recommend.vue';

const PostComments = defineAsyncComponent(() => import('@/components/post/post-comments.vue'));
import type { Post } from '@/lib/types/post';
import type { TocHeading } from '@/components/post/post-toc.vue';
import * as posts_api from '@/lib/api/posts';

const comments_config = {
  repo: import.meta.env.VITE_GISCUS_REPO || 'f0na/fufu-next',
  repo_id: import.meta.env.VITE_GISCUS_REPO_ID || 'R_kgDOSF1Eww',
  category: import.meta.env.VITE_GISCUS_CATEGORY || 'Announcements',
  category_id: import.meta.env.VITE_GISCUS_CATEGORY_ID || 'DIC_kwDOSF1Ew8C7HmC',
  mapping: 'pathname' as const,
};

const route = useRoute();

const post = ref<Post | null>(null);
const content = ref('');
const recommended_posts = ref<Post[]>([]);
const comments_count = ref(0);
const headings = ref<TocHeading[]>([]);
const error = ref(false);
const comments_ref = ref<HTMLElement | null>(null);
const comments_visible = ref(false);
let comments_observer: IntersectionObserver | null = null;

async function fetch_comments_count(slug: string) {
  try {
    const encoded_path = encodeURIComponent(`/posts/${slug}`);
    const res = await fetch(
      `https://api.github.com/search/issues?q=repo:${comments_config.repo}+type:discussions+${encoded_path}&per_page=1`
    );
    if (!res.ok) return;
    const data = await res.json();
    if (data.total_count > 0 && data.items[0]) {
      comments_count.value = data.items[0].comment_count || data.items[0].comments || 0;
    }
  } catch {
    /* Giscus will update later */
  }
}

async function fetch_post(slug: string) {
  error.value = false;
  post.value = null;
  content.value = '';
  recommended_posts.value = [];
  comments_count.value = 0;

  try {
    const post_data = await posts_api.get_post_by_slug(slug);
    post.value = post_data;

    if (post_data.content) {
      content.value = post_data.content;
    }

    fetch_comments_count(slug);

    // Fetch recommended posts
    if (post_data.tags?.length > 0) {
      nextTick(async () => {
        try {
          const rec = await posts_api.get_posts({ page: 1, page_size: 50 });
          const related = rec.data
            .filter((p) => p.slug !== slug && p.tags?.some((t) => post_data.tags!.includes(t)))
            .slice(0, 3);
          recommended_posts.value = related;
        } catch {
          // ignore recommendation errors
        }
      });
    }
  } catch {
    error.value = true;
  }
}

watch(
  () => route.params.slug,
  (new_slug) => {
    if (new_slug) fetch_post(new_slug as string);
  }
);

onMounted(async () => {
  await nextTick();
  const slug = route.params.slug;
  if (slug) fetch_post(slug as string);

  // 评论区懒加载 — 进入视口前 200px 开始加载
  comments_observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        comments_visible.value = true;
        comments_observer?.disconnect();
        comments_observer = null;
      }
    },
    { rootMargin: '200px' }
  );
  nextTick(() => {
    if (comments_ref.value) {
      comments_observer?.observe(comments_ref.value);
    }
  });
});

onUnmounted(() => {
  comments_observer?.disconnect();
  comments_observer = null;
});

function on_headings_change(new_headings: TocHeading[]) {
  headings.value = new_headings;
}

function on_count_change(count: number) {
  comments_count.value = count;
}
</script>

<template>
  <PageWrapper current_page="archive">
    <!-- 404 提示 -->
    <div v-if="error" class="w-full max-w-[61.8%] px-4 mx-auto py-12 text-center">
      <p class="text-lg text-muted-foreground">文章未找到</p>
    </div>

    <!-- 页面始终渲染，内容就绪后自动填充 -->
    <PostLayout
      v-else
      :profile_props="{
        name: 'Fufu',
        greeting: 'Ciallo～(∠・ω< )⌒★',
      }"
      :announcement_props="{
        title: '公告',
        announcements: [
          {
            id: '1',
            content: '欢迎来到我的小站！这里是我的个人空间，记录着生活中的点点滴滴。',
            time: '2026-04-17',
          },
          {
            id: '2',
            content: '网站正在建设中，敬请期待更多内容。',
            time: '2026-04-16',
          },
        ],
        max_display: 3,
      }"
    >
      <!-- 文章标题 -->
      <div class="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6">
        <template v-if="post">
          <h1 class="text-2xl font-bold text-foreground mb-2">{{ post.title }}</h1>
          <div class="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <time>{{ post.date }}</time>
            <div v-if="post.tags.length > 0" class="flex gap-1">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="px-2 py-0.5 bg-muted rounded text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="h-7 bg-muted rounded animate-pulse mb-2 w-3/4" />
          <div class="h-4 bg-muted rounded animate-pulse w-1/3" />
        </template>
      </div>

      <!-- 文章内容 -->
      <PostContent :content="content" :on_headings_change="on_headings_change" />

      <!-- 右侧边栏 -->
      <template #right_sidebar>
        <PostSidebar
          :cover="post?.cover"
          :likes="0"
          :views="0"
          :comments_count="comments_count"
          :excerpt="post?.excerpt"
          :headings="headings"
          comments_section_id="comments"
        />
      </template>

      <!-- 推荐文章 -->
      <template #recommended_posts>
        <PostRecommend :posts="recommended_posts" />
      </template>

      <!-- 评论区（懒加载） -->
      <template #comments_section>
        <div ref="comments_ref">
          <PostComments
            v-if="comments_visible"
            :repo="comments_config.repo"
            :repo_id="comments_config.repo_id"
            :category="comments_config.category"
            :category_id="comments_config.category_id"
            :mapping="comments_config.mapping"
            section_id="comments"
            :on_count_change="on_count_change"
          />
        </div>
      </template>
    </PostLayout>
  </PageWrapper>
</template>
