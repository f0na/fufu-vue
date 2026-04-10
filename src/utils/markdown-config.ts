/**
 * Markdown 渲染配置
 * 配置 markstream-vue 使用 GitHub 主题进行代码高亮
 */

import type { CodeBlockMonacoTheme } from 'markstream-vue'

// GitHub 浅色主题配置
export const github_light_theme: CodeBlockMonacoTheme = 'github-light-default'

// GitHub 深色主题配置
export const github_dark_theme: CodeBlockMonacoTheme = 'github-dark-default'

// Monaco 编辑器配置
export const monaco_options = {
  fontSize: 14,
  lineHeight: 22,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Consolas, monospace",
  tabSize: 2,
  wordWrap: 'on',
  readOnly: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  scrollbar: {
    vertical: 'hidden',
    horizontal: 'auto',
    handleMouseWheel: true,
  },
}

// 根据当前主题获取代码块主题
export function get_code_theme(is_dark: boolean): CodeBlockMonacoTheme {
  return is_dark ? github_dark_theme : github_light_theme
}
