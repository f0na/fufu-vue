<script setup lang="ts">
/**
 * Markdown 渲染组件
 * 配置 markstream-vue 代码高亮
 */
import { computed } from 'vue'
import MarkdownRender from 'markstream-vue'

const props = defineProps<{
    content: string
}>()

// 代码块配置 - 使用 GitHub 主题
const code_block_props = computed(() => ({
    theme: {
        light: 'github-light-default',
        dark: 'github-dark-default'
    },
    showHeader: false,
    showCopyButton: false,
    showExpandButton: false,
    showPreviewButton: false,
    showCollapseButton: false,
    showFontSizeButtons: false,
    showTooltips: false,
}))
</script>

<template>
    <div class="markstream-vue">
        <MarkdownRender
            :content="content"
            :code-block-props="code_block_props"
        />
    </div>
</template>