<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Post } from '@/lib/types/post'
import { cn } from '@/lib/utils'

interface Props {
  posts: Post[]
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  posts: () => [],
})

function format_date(date_string: string): string {
  const date = new Date(date_string)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div v-if="posts.length > 0" :class="cn('space-y-4', props.class)">
    <!-- 标题 -->
    <h2 class="text-xl font-semibold text-foreground flex items-center gap-2">
      <span class="text-primary">|</span>
      相关推荐
    </h2>

    <!-- 推荐文章卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      <RouterLink
        v-for="post in posts"
        :key="post.slug"
        :to="`/posts/${post.slug}`"
        class="group"
      >
        <Card
          size="sm"
          :class="cn(
            'transition-all duration-200',
            'hover:ring-2 hover:ring-primary/30 hover:shadow-md',
            'cursor-pointer overflow-hidden',
            '!pt-0 !gap-0'
          )"
        >
          <!-- 封面图 -->
          <div
            v-if="post.cover"
            class="relative aspect-video w-full overflow-hidden rounded-t-xl"
          >
            <img
              :src="post.cover"
              :alt="post.title"
              class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>

          <CardHeader class="pb-2 pt-3">
            <CardTitle class="text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {{ post.title }}
            </CardTitle>
          </CardHeader>

          <CardContent class="pb-3">
            <p v-if="post.excerpt" class="text-xs text-muted-foreground line-clamp-2">
              {{ post.excerpt }}
            </p>
          </CardContent>

          <!-- 底部时间和标签 -->
          <div class="px-4 pb-3 flex flex-col gap-2">
            <time class="text-xs text-muted-foreground">
              {{ format_date(post.date) }}
            </time>

            <div v-if="post.tags.length > 0" class="flex gap-1 flex-wrap">
              <span
                v-for="tag in post.tags.slice(0, 2)"
                :key="tag"
                class="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
              >
                {{ tag }}
              </span>
              <span v-if="post.tags.length > 2" class="text-xs text-muted-foreground">
                +{{ post.tags.length - 2 }}
              </span>
            </div>
          </div>
        </Card>
      </RouterLink>
    </div>
  </div>
</template>
