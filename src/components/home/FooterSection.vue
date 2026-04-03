<script setup lang="ts">
// 页脚配置
const footer_config = {
    copyright: '©2026 fufu all rights reserved',
    icp: '',
    links: [
        { name: '许可证', url: '/license' },
        { name: '隐私政策', url: '/privacy' }
    ]
}
</script>

<template>
    <footer class="py-6 px-4 text-center">
        <!-- 版权信息 -->
        <p class="text-sm text-gray-500 mb-2">
            {{ footer_config.copyright }}
        </p>

        <!-- 链接 -->
        <div class="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>{{ footer_config.icp }}</span>
            <span>|</span>
            <a v-for="link in footer_config.links" :key="link.name" :href="link.url"
                class="hover:text-cyan-500 transition-colors">
                {{ link.name }}
            </a>
        </div>
    </footer>
</template>