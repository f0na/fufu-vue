<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/vue'
interface Props {
  name?: string
  avatar_url?: string
  greeting?: string
  social_links?: {
    bilibili?: string
    github?: string
    email?: string
  }
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  name: 'Fufu',
  avatar_url: 'https://www.loliapi.com/acg/pp/',
  greeting: 'Ciallo～(∠・ω< )⌒★',
  social_links: () => ({
    bilibili: 'https://space.bilibili.com/',
    github: 'https://github.com/',
    email: 'mailto:example@email.com',
  }),
})
</script>

<template>
  <Card size="sm" :class="cn('flex flex-col items-center max-w-[9.888vw]', props.class)">
    <CardContent class="flex flex-col items-center gap-1 w-full">
      <div class="w-full aspect-square rounded-lg overflow-hidden">
        <img
          :src="avatar_url"
          alt="头像"
          class="object-cover w-full h-full"
        />
      </div>
      <span class="font-medium text-sm">{{ name }}</span>
      <span class="text-muted-foreground text-xs text-center">{{ greeting }}</span>
      <div class="flex gap-2">
        <a
          v-if="social_links.bilibili"
          :href="social_links.bilibili"
          target="_blank"
          rel="noopener noreferrer"
          class="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
        >
          <Icon icon="lucide:gamepad-2" class="w-3.5 h-3.5" />
        </a>
        <a
          v-if="social_links.github"
          :href="social_links.github"
          target="_blank"
          rel="noopener noreferrer"
          class="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
        >
          <Icon icon="lucide:github" class="w-3.5 h-3.5" />
        </a>
        <a
          v-if="social_links.email"
          :href="social_links.email"
          class="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
        >
          <Icon icon="lucide:mail" class="w-3.5 h-3.5" />
        </a>
      </div>
    </CardContent>
  </Card>
</template>
