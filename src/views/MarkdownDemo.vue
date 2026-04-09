<script setup lang="ts">
import { ref } from 'vue'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import { useTheme } from '@/composables/useTheme'

const { current_theme, themes, set_theme } = useTheme()

const demo_content = ref(`
# 欢迎来到乐队主题博客

这是一篇演示文章，展示美少女乐队风格的 Markdown 渲染样式。

## 关于主题设计

本主题灵感来源于二次元少女乐队，融合了青春、音乐、梦想等元素。

**设计特点：**

- 温暖明亮的配色方案
- 音乐元素装饰细节
- 高对比度，对色弱友好
- 响应式设计适配

> 歌词示例：即使在迷途中也要前进，因为那是属于我们的旋律

### 代码示例

\`\`\`typescript
// 乐队主题配色
const themes = {
  mygo: {
    pink: '#ff8899',
    blue: '#77bbdd',
    green: '#77dd77',
  },
  mujica: {
    lightblue: '#5a8fa8',
    green: '#2f6f4f',
    gold: '#b8860b',
  }
}
\`\`\`

行内代码示例：使用 \`MarkdownRenderer\` 组件进行渲染。

### 数据展示

| 主题名称 | 主色调 | 风格特点 |
|----------|--------|----------|
| MyGO!!!!! | 珊瑚粉 | 阳光活力 |
| Ave Mujica | 浅青色 | 神秘优雅 |

---

## 技术实现

1. 基于 markstream-vue 渲染引擎
2. 自定义 CSS 变量主题系统
3. 响应式布局适配
4. 无障碍设计支持

### 任务清单

- [x]完成基础样式
- [x]实现主题切换
- [ ]添加更多功能
- [ ]优化移动端体验

访问 [GitHub](https://github.com) 了解更多技术细节。
`)
</script>

<template>
  <div class="min-h-screen bg-[var(--c-bg)] transition-colors duration-300">
    <!-- 主题选择 -->
    <div class="fixed top-4 right-4 z-50 flex gap-2">
      <button
        v-for="theme in themes"
        :key="theme.name"
        @click="set_theme(theme.name)"
        class="px-3 py-1.5 rounded-lg text-sm font-medium shadow-md transition-all duration-300"
        :class="current_theme.name === theme.name
          ? 'ring-2 ring-offset-2'
          : 'opacity-70 hover:opacity-100'"
        :style="{
          backgroundColor: theme.colors.primary,
          color: theme.colors.bg,
        }"
      >
        {{ theme.label }}
      </button>
    </div>

    <!-- 内容区 -->
    <div class="max-w-4xl mx-auto py-8 px-4">
      <div class="bg-white rounded-xl p-6 shadow-lg border border-[var(--c-border)] transition-all duration-300">
        <div class="band-markdown prose max-w-none">
          <markdown-renderer :content="demo_content" />
        </div>
      </div>
    </div>
  </div>
</template>