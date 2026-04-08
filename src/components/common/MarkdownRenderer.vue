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
    showHeader: true,           // 显示代码块头部（语言标签）
    showCopyButton: true,       // 显示复制按钮
    showExpandButton: false,    // 隐藏展开按钮
    showPreviewButton: false,   // 隐藏预览按钮
    showCollapseButton: false,  // 隐藏折叠按钮
    showFontSizeButtons: false, // 隐藏字体大小按钮
    showTooltips: true,         // 显示工具提示
    monacoOptions: {
        revealStrategy: 'bottom' as const, // 默认滚动到底部（最后一行）
    },
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