<script setup lang="ts">
import PageWrapper from '@/components/layout/page-wrapper.vue'
import HomeLayout from '@/components/home/home-layout.vue'
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
          { id: '1', content: '欢迎来到我的小站！这里是我的个人空间，记录着生活中的点点滴滴。', time: '2026-04-17' },
          { id: '2', content: '网站正在建设中，敬请期待更多内容。', time: '2026-04-16' },
        ],
        max_display: 3,
      }"
    >
      <div class="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-6">
        <h1 class="text-2xl font-semibold text-foreground">网站介绍</h1>
        <p class="text-muted-foreground leading-relaxed">
          这里是可爱芙芙的小窝，欢迎大家^^
        </p>
        <p class="text-muted-foreground leading-relaxed">
          这里是我的个人空间，记录着生活中的点点滴滴。
        </p>
        <p class="text-muted-foreground leading-relaxed">
          网站正在建设中，敬请期待更多内容。
        </p>
      </div>
    </HomeLayout>
  </PageWrapper>
</template>
