<script setup lang="ts">
import GalleryCard from '@/components/gallery/gallery-card.vue';
import type { Gallery } from '@/lib/types/gallery';

interface Props {
  galleries: Gallery[];
}

defineProps<Props>();
</script>

<template>
  <div v-if="galleries.length > 0" class="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
    <GalleryCard
      v-for="gallery in galleries"
      :key="gallery.id"
      :gallery="gallery"
      class="break-inside-avoid"
    />
  </div>
  <div v-else class="text-center py-8 text-muted-foreground">暂无相册</div>
</template>
