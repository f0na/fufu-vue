<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { Mail, Github } from 'lucide-vue-next'
import BilibiliIcon from '@/components/icons/BilibiliIcon.vue'

const { success } = useToast()

const profile_config = {
  name: 'fufu',
  avatar: 'https://www.loliapi.com/acg/pp/',
  greeting: 'Ciallo～(∠・ω< )⌒★',
  email: 'fufu@example.com',
  social_links: [
    { name: 'B站', url: 'https://space.bilibili.com/1018561538', icon_component: BilibiliIcon },
    { name: 'GitHub', url: 'https://github.com/f0na', icon_component: Github },
    { name: 'Email', url: '', icon_component: Mail },
  ],
}

async function handle_link_click(link: { name: string; url: string }) {
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
    class="flex flex-col items-center gap-1 p-3 rounded-xl bg-white border border-[var(--c-border)] shadow-sm"
  >
    <!-- 头像 -->
    <img
      :src="profile_config.avatar"
      :alt="profile_config.name"
      class="w-full aspect-square rounded-lg object-cover"
    />

    <!-- 名字 -->
    <h1 class="text-sm font-bold text-slate-700">
      {{ profile_config.name }}
    </h1>

    <!-- 欢迎语 -->
    <p class="text-xs text-[var(--c-primary)] text-center">
      {{ profile_config.greeting }}
    </p>

    <!-- 社交链接 -->
    <div class="flex gap-1.5">
      <button
        v-for="link in profile_config.social_links"
        :key="link.name"
        @click="handle_link_click(link)"
        class="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--c-primary-bg)] hover:text-[var(--c-primary)] hover:bg-[var(--c-primary-light)]/30 transition-colors cursor-pointer"
        :title="link.name"
      >
        <component :is="link.icon_component" class="w-3.5 h-3.5 text-slate-500" />
      </button>
    </div>
  </div>
</template>
