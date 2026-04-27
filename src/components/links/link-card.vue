<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LinkItem } from '@/lib/types/link'

interface Props {
  link: LinkItem
  class?: string
}

const props = defineProps<Props>()

const favicon_error = ref(false)
const copied = ref(false)

const favicon_info = computed(() => {
  try {
    const url_obj = new URL(props.link.url)
    return {
      favicon_url: `${url_obj.origin}/favicon.ico`,
      site_initial: url_obj.hostname.replace(/^www\./, '').charAt(0).toUpperCase(),
    }
  } catch {
    return { favicon_url: null as string | null, site_initial: null as string | null }
  }
})

const show_favicon = computed(() =>
  !!favicon_info.value.favicon_url && !favicon_error.value
)

const show_initial = computed(() =>
  favicon_info.value.site_initial && /^[A-Za-z0-9]$/.test(favicon_info.value.site_initial)
)

const handle_click = () => {
  window.open(props.link.url, '_blank')
}

const handle_copy = async (e: Event) => {
  e.stopPropagation()
  try {
    await navigator.clipboard.writeText(props.link.url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const display_tags = computed(() => props.link.tags.slice(0, 3))
</script>

<template>
  <Card
    :class="cn('cursor-pointer transition-all hover:ring-primary/30 hover:shadow-md', props.class)"
    @click="handle_click"
  >
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <!-- favicon -->
        <img
          v-if="show_favicon"
          :src="favicon_info.favicon_url"
          alt=""
          class="size-5 shrink-0 rounded-sm"
          @error="favicon_error = true"
        />
        <!-- site initial fallback -->
        <div
          v-else-if="show_initial"
          class="flex size-5 shrink-0 items-center justify-center rounded-sm bg-muted text-[10px] font-medium text-muted-foreground"
        >
          {{ favicon_info.site_initial }}
        </div>
        <!-- globe icon fallback -->
        <Icon icon="lucide:globe" v-else class="size-5 shrink-0 text-muted-foreground" />

        <span class="truncate">{{ link.title }}</span>
      </CardTitle>
      <CardAction class="flex items-center gap-1">
        <Icon icon="lucide:star" v-if="link.is_starred" class="size-4 fill-primary text-primary" />
        <Button
          variant="ghost"
          size="icon-sm"
          class="shrink-0"
          @click="handle_copy"
          aria-label="复制链接"
        >
          <Icon icon="lucide:copy-check" v-if="copied" class="size-4 text-primary" />
          <Icon icon="lucide:copy" v-else class="size-4" />
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent class="space-y-3">
      <p v-if="link.description" class="line-clamp-2 text-sm text-muted-foreground">
        {{ link.description }}
      </p>
      <div v-if="display_tags.length > 0" class="flex flex-wrap gap-1.5">
        <Badge v-for="tag in display_tags" :key="tag" variant="secondary">
          {{ tag }}
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>
