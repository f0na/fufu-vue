<script setup lang="ts">
import { RouterLink } from 'vue-router';

const footer_links = [
  { label: '备案号', to: '#' },
  { label: '许可证', to: '/license' },
  { label: '隐私政策', to: '/privacy' },
];

const current_year = new Date().getFullYear();
</script>

<template>
  <footer class="w-full">
    <div class="container mx-auto px-4 py-4">
      <div class="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
        <p class="text-sm text-muted-foreground">©{{ current_year }} fufu all</p>
        <nav class="flex items-center gap-4">
          <RouterLink
            v-for="link in footer_links"
            :key="link.label"
            :to="link.to"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
