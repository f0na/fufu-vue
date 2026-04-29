<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import PageWrapper from '@/components/layout/page-wrapper.vue';
import HomeLayout from '@/components/home/home-layout.vue';
import { render_markdown, post_process_rendered, setup_copy_handler } from '@/lib/markdown';

const description_html = ref('');
const loading = ref(true);

onMounted(async () => {
  setup_copy_handler();
  try {
    const res = await fetch('/content/settings.json');
    if (res.ok) {
      const data = await res.json();
      const desc = data?.site?.description || '';
      const { html } = render_markdown(desc);
      description_html.value = html;
    } else {
      const { html } = render_markdown('这里是可爱芙芙的小窝，欢迎大家^^');
      description_html.value = html;
    }
  } catch {
    const { html } = render_markdown('这里是可爱芙芙的小窝，欢迎大家^^');
    description_html.value = html;
  } finally {
    loading.value = false;
    await nextTick();
    const el = document.querySelector('.home-description');
    if (el) post_process_rendered(el);
  }
});
</script>

<template>
  <PageWrapper>
    <HomeLayout
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
          { id: '2', content: '网站正在建设中，敬请期待更多内容。', time: '2026-04-16' },
        ],
        max_display: 3,
      }"
    >
      <div class="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6">
        <h1 class="text-2xl font-semibold text-foreground mb-4">网站介绍</h1>
        <div
          v-if="loading"
          class="text-muted-foreground text-sm"
        >加载中...</div>
        <div
          v-else
          class="home-description markdown-content prose prose-sm max-w-none text-muted-foreground leading-relaxed"
          v-html="description_html"
        />
      </div>
    </HomeLayout>
  </PageWrapper>
</template>
