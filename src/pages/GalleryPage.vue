<script setup lang="ts">
import PageWrapper from '@/components/layout/page-wrapper.vue'
import GalleryContent from '@/components/gallery/gallery-content.vue'
</script>

<template>
  <PageWrapper current_page="gallery">
    <GalleryContent
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
          {
            id: '2',
            content: '网站正在建设中，敬请期待更多内容。',
            time: '2026-04-16',
          },
        ],
      }"
    />
  </PageWrapper>
</template>
