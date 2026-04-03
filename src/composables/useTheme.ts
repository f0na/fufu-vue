import { ref } from 'vue'
import { generate_tag_colors } from '@/utils/colorContrast'

// 主题配置
export interface ThemeConfig {
    name: string
    label: string
    colors: {
        bg: string
        primary: string
        primaryLight: string
        primaryBg: string
        border: string
        secondary: string
        tagBg: string
        tagText: string
    }
}

// 可用主题列表
export const themes: ThemeConfig[] = [
    {
        name: 'rose',
        label: '粉色少女风',
        colors: {
            bg: '#fff1f2',
            primary: '#fb7185',
            primaryLight: '#fda4af',
            primaryBg: '#ffe4e6',
            border: '#fecdd3',
            secondary: '#2dd4bf',
            ...generate_tag_colors('#fb7185', 4.5),
        }
    },
    {
        name: 'cyan',
        label: '蓝色少女风',
        colors: {
            bg: '#f8fafc',
            primary: '#22d3ee',
            primaryLight: '#67e8f9',
            primaryBg: '#cffafe',
            border: '#e2e8f0',
            secondary: '#2dd4bf',
            ...generate_tag_colors('#22d3ee', 4.5),
        }
    }
]

// 当前主题索引
function get_initial_theme_index(): number {
    const saved = localStorage.getItem('theme')
    const index = themes.findIndex(t => t.name === saved)
    return index >= 0 ? index : 0
}

// 单例：当前主题索引
const current_theme_index = ref<number>(get_initial_theme_index())

// 单例：当前主题配置
export const current_theme = ref<ThemeConfig>(themes[current_theme_index.value]!)

function apply_theme(theme: ThemeConfig) {
    const root = document.documentElement
    root.setAttribute('data-theme', theme.name)
    root.style.setProperty('--c-bg', theme.colors.bg)
    root.style.setProperty('--c-primary', theme.colors.primary)
    root.style.setProperty('--c-primary-light', theme.colors.primaryLight)
    root.style.setProperty('--c-primary-bg', theme.colors.primaryBg)
    root.style.setProperty('--c-border', theme.colors.border)
    root.style.setProperty('--c-secondary', theme.colors.secondary)
    root.style.setProperty('--c-tag-bg', theme.colors.tagBg)
    root.style.setProperty('--c-tag-text', theme.colors.tagText)
    localStorage.setItem('theme', theme.name)
}

// 初始化主题
if (typeof document !== 'undefined') {
    apply_theme(themes[current_theme_index.value]!)
}

export function useTheme() {
    function next_theme() {
        current_theme_index.value = (current_theme_index.value + 1) % themes.length
        current_theme.value = themes[current_theme_index.value]!
        apply_theme(current_theme.value)
    }

    function set_theme(theme_name: string) {
        const index = themes.findIndex(t => t.name === theme_name)
        if (index !== -1) {
            current_theme_index.value = index
            current_theme.value = themes[index]!
            apply_theme(current_theme.value)
        }
    }

    return {
        current_theme,
        themes,
        next_theme,
        set_theme
    }
}