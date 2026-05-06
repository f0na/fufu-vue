<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { get_profile } from '@/lib/api/settings';

const icp_beian = ref('');

onMounted(async () => {
  try {
    const res = await get_profile();
    icp_beian.value = res?.data?.icp_beian || '';
  } catch {
    // 忽略
  }
});

const current_year = new Date().getFullYear();
</script>

<template>
  <footer class="w-full">
    <div class="container mx-auto px-4 py-4">
      <div class="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
        <p class="text-sm text-muted-foreground">©{{ current_year }} fufu all</p>
        <nav class="flex items-center gap-4">
          <a
            v-if="icp_beian"
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {{ icp_beian }}
          </a>
          <RouterLink
            :to="'/license'"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            许可证
          </RouterLink>
          <RouterLink
            :to="'/privacy'"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            隐私政策
          </RouterLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
