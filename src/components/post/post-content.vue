<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { render_markdown, post_process_rendered, setup_copy_handler } from '@/lib/markdown'
import type { TocHeading } from '@/components/post/post-toc.vue'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'

interface Props {
  content: string
  on_headings_change?: (headings: TocHeading[]) => void
  class?: string
}

const props = defineProps<Props>()

const content_ref = ref<HTMLElement | null>(null)
const rendered_html = ref('')

async function perform_render(content: string) {
  const { html, headings } = render_markdown(content)
  rendered_html.value = html
  props.on_headings_change?.(headings)

  await nextTick()
  if (content_ref.value) {
    // 确保标题有 id 属性（markdown-it 可能没处理到）
    const heading_elements = content_ref.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
    heading_elements.forEach((el, index) => {
      if (!el.id && headings[index]) {
        el.id = headings[index].id
      }
    })

    // 异步处理代码块高亮和 Mermaid
    await post_process_rendered(content_ref.value)
  }
}

// 监听内容变化
watch(
  () => props.content,
  (new_content) => {
    perform_render(new_content)
  }
)

// 初始化复制函数，延迟 markdown 渲染到首屏完成后
onMounted(() => {
  setup_copy_handler()
  if (props.content) {
    requestAnimationFrame(() => perform_render(props.content))
  }
})
</script>

<template>
  <Card size="sm" :class="cn('overflow-hidden !pt-0 !gap-0', props.class)">
    <CardContent class="p-6 !pt-0 overflow-hidden">
      <div
        ref="content_ref"
        class="markdown-content"
        v-html="rendered_html"
      />
    </CardContent>
  </Card>
</template>

