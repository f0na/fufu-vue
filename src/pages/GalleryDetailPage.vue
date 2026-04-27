<script setup lang="ts">
import { useRoute } from 'vue-router'
import GallerySpace from '@/components/gallery/gallery-space.vue'

const route = useRoute()
</script>

<template>
  <GallerySpace :gallery_id="route.params.id as string" />
</template>
