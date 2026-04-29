<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Badge } from '@/components/ui/badge';
import type { Gallery } from '@/lib/types/gallery';

interface Props {
  gallery: Gallery;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
});
</script>

<template>
  <RouterLink :to="`/gallery/${gallery.id}`">
    <div :class="['relative cursor-pointer group pb-2', props.class]">
      <!-- 封面 -->
      <div class="rounded-xl border border-border/50 overflow-hidden">
        <img
          :src="gallery.cover_path"
          :alt="gallery.title"
          class="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <!-- 标题和标签 -->
      <div class="pt-2 px-1">
        <h3 class="font-medium text-sm leading-tight truncate">{{ gallery.title }}</h3>
        <div v-if="gallery.tags && gallery.tags.length > 0" class="flex flex-wrap gap-1 mt-1">
          <Badge
            v-for="tag in gallery.tags.slice(0, 3)"
            :key="tag"
            variant="secondary"
            class="text-xs px-1.5 py-0"
          >
            {{ tag }}
          </Badge>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
