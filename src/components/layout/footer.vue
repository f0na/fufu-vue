<script setup lang="ts">
const footer_links = [
  { label: '备案号', href: '#' },
  { label: '许可证', href: '#' },
  { label: '隐私政策', href: '#' },
]

const current_year = new Date().getFullYear()
</script>

<template>
  <footer class="w-full">
    <div class="container mx-auto px-4 py-4">
      <div class="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
        <p class="text-sm text-muted-foreground">
          ©{{ current_year }} fufu all
        </p>
        <nav class="flex items-center gap-4">
          <a
            v-for="link in footer_links"
            :key="link.label"
            :href="link.href"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {{ link.label }}
          </a>
        </nav>
      </div>
    </div>
  </footer>
</template>
