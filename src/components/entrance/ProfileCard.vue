<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { Mail, Github } from 'lucide-vue-next'
import BilibiliIcon from '@/components/icons/BilibiliIcon.vue'
import type { Component } from 'vue'

const { success } = useToast()

interface LocalSocialLink {
  id: string
  name: string
  url: string
  icon_component: Component
  sort_order: number
}

// 个人信息配置
const profile_config = {
  name: 'fufu',
  avatar: 'https://www.loliapi.com/acg/pp/',
  greeting: 'Ciallo～(∠・ω< )⌒★',
  email: 'fufu@example.com',
  social_links: [
    {
      id: '1',
      name: 'B站',
      url: 'https://space.bilibili.com/1018561538',
      icon_component: BilibiliIcon,
      sort_order: 0,
    },
    {
      id: '2',
      name: 'GitHub',
      url: 'https://github.com/f0na',
      icon_component: Github,
      sort_order: 1,
    },
    {
      id: '3',
      name: 'Email',
      url: '',
      icon_component: Mail,
      sort_order: 2,
    },
  ] as const satisfies readonly LocalSocialLink[],
}

async function handle_link_click(link: LocalSocialLink) {
  if (link.name === 'Email') {
    try {
      await navigator.clipboard.writeText(profile_config.email)
      success('已复制邮箱')
    } catch {
      console.error('复制失败')
    }
  } else if (link.url) {
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div
    class="flex flex-col items-center gap-3 p-5 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 w-45 shrink-0"
  >
    <!-- 头像 -->
    <img
      :src="profile_config.avatar"
      :alt="profile_config.name"
      class="w-16 h-16 rounded-full object-cover ring-2 ring-white/30"
    />

    <!-- 名字 -->
    <h1 class="text-lg font-bold text-white drop-shadow-md">
      {{ profile_config.name }}
    </h1>

    <!-- 欢迎语 -->
    <p class="text-sm text-white/80 text-center max-w-40">
      {{ profile_config.greeting }}
    </p>

    <!-- 社交链接 -->
    <div class="flex gap-2">
      <button
        v-for="link in profile_config.social_links"
        :key="link.id"
        @click="handle_link_click(link)"
        class="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
        :title="link.name"
      >
        <component :is="link.icon_component" class="w-4 h-4 text-white" />
      </button>
    </div>
  </div>
</template>