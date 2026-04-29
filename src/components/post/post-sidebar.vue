<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PostToc from '@/components/post/post-toc.vue';
import type { TocHeading } from '@/components/post/post-toc.vue';
import { Icon } from '@iconify/vue';
import { cn } from '@/lib/utils';

interface Props {
  cover?: string;
  likes?: number;
  views?: number;
  comments_count?: number;
  excerpt?: string;
  headings?: TocHeading[];
  comments_section_id?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  likes: 0,
  views: 0,
  comments_count: 0,
  headings: () => [],
  comments_section_id: 'comments',
});

const is_liked = ref(false);
const current_likes = ref(props.likes);
const is_animating = ref(false);

function handle_like() {
  if (is_liked.value) return;
  is_animating.value = true;
  is_liked.value = true;
  current_likes.value++;
  setTimeout(() => {
    is_animating.value = false;
  }, 500);
}

function scroll_to_comments() {
  const element = document.getElementById(props.comments_section_id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-4 w-full', props.class)">
    <!-- 封面图 -->
    <div
      v-if="cover"
      class="relative aspect-video w-full overflow-hidden rounded-xl ring-1 ring-foreground/10"
    >
      <img :src="cover" alt="文章封面" class="object-cover w-full h-full" loading="lazy" />
    </div>

    <!-- 统计信息 -->
    <Card size="sm">
      <CardContent class="flex items-center justify-around py-3">
        <!-- 点赞 -->
        <button
          @click="handle_like"
          :disabled="is_liked"
          :class="
            cn(
              'flex flex-col items-center gap-1 transition-all',
              is_liked ? 'cursor-default' : 'hover:scale-105 cursor-pointer'
            )
          "
          :aria-label="is_liked ? '已点赞' : '点击点赞'"
        >
          <Icon
            icon="lucide:heart"
            :class="
              cn(
                'size-5 transition-all',
                is_animating && 'animate-ping',
                is_liked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )
            "
          />
          <span
            :class="cn('text-xs font-medium', is_liked ? 'text-red-500' : 'text-muted-foreground')"
          >
            {{ current_likes }}
          </span>
        </button>

        <Separator orientation="vertical" class="h-8" />

        <!-- 浏览数 -->
        <div class="flex flex-col items-center gap-1">
          <Icon icon="lucide:eye" class="size-5 text-muted-foreground" />
          <span class="text-xs font-medium text-muted-foreground">{{ views }}</span>
        </div>

        <Separator orientation="vertical" class="h-8" />

        <!-- 评论数 -->
        <button
          @click="scroll_to_comments"
          class="flex flex-col items-center gap-1 transition-all hover:scale-105 cursor-pointer"
          aria-label="跳转到评论区"
        >
          <Icon icon="lucide:message-circle" class="size-5 text-muted-foreground" />
          <span class="text-xs font-medium text-muted-foreground">{{ comments_count }}</span>
        </button>
      </CardContent>
    </Card>

    <!-- 文章摘要 -->
    <Card v-if="excerpt" size="sm">
      <CardContent class="py-3">
        <h3 class="text-sm font-medium mb-2 text-foreground">摘要</h3>
        <p class="text-xs text-muted-foreground leading-relaxed line-clamp-5">{{ excerpt }}</p>
      </CardContent>
    </Card>

    <!-- 目录 -->
    <PostToc v-if="headings.length > 0" :headings="headings" />
  </div>
</template>
