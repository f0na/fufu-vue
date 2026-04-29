<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { render_markdown, post_process_rendered, setup_copy_handler } from '@/lib/markdown';

const props = defineProps<{ content: string }>();

const html = ref('');
const preview_ref = ref<HTMLElement | null>(null);

async function perform_render(content: string) {
  try {
    const { html: rendered } = render_markdown(content);
    html.value = rendered;

    await nextTick();
    if (preview_ref.value) {
      await post_process_rendered(preview_ref.value);
    }
  } catch {
    html.value = '<p style="color:#e06c75;">渲染失败</p>';
  }
}

watch(
  () => props.content,
  (val) => perform_render(val)
);

onMounted(() => {
  setup_copy_handler();
  if (props.content) {
    requestAnimationFrame(() => perform_render(props.content));
  }
});
</script>

<template>
  <div ref="preview_ref" class="markdown-content" v-html="html"></div>
</template>

<style scoped>
.markdown-content {
  height: 100%;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

.markdown-content::-webkit-scrollbar {
  width: 7px;
}
.markdown-content::-webkit-scrollbar-track {
  background: transparent;
}
.markdown-content::-webkit-scrollbar-thumb {
  background: var(--color-border-light);
  border-radius: 3px;
}
.markdown-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-dim);
}
</style>
