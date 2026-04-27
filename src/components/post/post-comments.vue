<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  repo: string
  repo_id: string
  category: string
  category_id: string
  mapping?: 'pathname' | 'url' | 'title' | 'og:title'
  section_id?: string
  class?: string
  on_count_change?: (count: number) => void
}

const props = withDefaults(defineProps<Props>(), {
  mapping: 'pathname',
  section_id: 'comments',
})

const giscus_ref = ref<HTMLDivElement>()

function get_theme(): string {
  return 'light'
}

let message_handler: ((event: MessageEvent) => void) | null = null

onMounted(() => {
  if (props.repo === 'placeholder/placeholder') return

  // 监听 Giscus 元数据消息
  message_handler = (event: MessageEvent) => {
    if (event.origin !== 'https://giscus.app') return
    const data = event.data
    if (data?.giscus && data.giscus.discussion) {
      const count = data.giscus.discussion.totalCommentCount || 0
      props.on_count_change?.(count)
    }
  }
  window.addEventListener('message', message_handler)

  // 挂载 Giscus
  if (giscus_ref.value) {
    giscus_ref.value.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', props.repo)
    script.setAttribute('data-repo-id', props.repo_id)
    script.setAttribute('data-category', props.category)
    script.setAttribute('data-category-id', props.category_id)
    script.setAttribute('data-mapping', props.mapping)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '1')
    script.setAttribute('data-input-position', 'top')
    script.setAttribute('data-theme', get_theme())
    script.setAttribute('data-lang', 'zh-CN')
    script.setAttribute('data-loading', 'lazy')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true
    giscus_ref.value.appendChild(script)
  }
})

onUnmounted(() => {
  if (message_handler) {
    window.removeEventListener('message', message_handler)
  }
})
</script>

<template>
  <div :id="section_id" :class="cn('w-full', props.class)">
    <!-- 标题 -->
    <h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
      <span class="text-primary">|</span>
      评论区
    </h2>

    <!-- 未配置提示 -->
    <div
      v-if="repo === 'placeholder/placeholder'"
      class="flex items-center justify-center py-12 text-muted-foreground"
    >
      <div class="text-center space-y-2">
        <p>评论功能暂未配置</p>
        <p class="text-sm">请在 GitHub 仓库中启用 Discussions 并配置相关参数</p>
      </div>
    </div>

    <!-- Giscus 评论组件 -->
    <div v-else class="w-full overflow-hidden rounded-lg border border-border bg-card">
      <div ref="giscus_ref" />
    </div>
  </div>
</template>
