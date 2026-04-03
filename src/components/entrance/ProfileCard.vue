<script setup lang="ts">
import { ref } from 'vue'
import EmailEditor from './EmailEditor.vue'

// 个人信息配置
const profile_config = {
    name: 'fufu',
    avatar: 'https://www.loliapi.com/acg/pp/',
    greeting: 'Ciallo～(∠・ω< )⌒★',
    social_links: [
        { name: 'B站', url: 'https://space.bilibili.com/1018561538', icon: 'i-simple-icons-bilibili' },
        { name: 'GitHub', url: 'https://github.com/f0na', icon: 'i-simple-icons-github' },
        { name: 'Email', url: '', icon: 'i-lucide-mail' }
    ]
}

const show_email_editor = ref(false)

function handle_link_click(link: { name: string; url: string }) {
    if (link.name === 'Email') {
        show_email_editor.value = true
    } else if (link.url) {
        window.open(link.url, '_blank', 'noopener,noreferrer')
    }
}
</script>

<template>
    <div
        class="flex flex-col items-center gap-3 p-5 rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 w-45 shrink-0">
        <!-- 头像 -->
        <img :src="profile_config.avatar" :alt="profile_config.name"
            class="w-16 h-16 rounded-full object-cover ring-2 ring-white/30" />

        <!-- 名字 -->
        <h1 class="text-lg font-bold text-white drop-shadow-md">
            {{ profile_config.name }}
        </h1>

        <!-- 欢迎语 -->
        <p class="text-sm text-white/80 text-center max-w-40">
            {{ profile_config.greeting }}
        </p>

        <!-- 社交链接 -->
        <div class="flex gap-2">
            <button v-for="link in profile_config.social_links" :key="link.name" @click="handle_link_click(link)"
                class="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                :title="link.name">
                <div :class="link.icon" class="w-4 h-4 text-white" />
            </button>
        </div>

        <!-- 邮件编辑器弹窗 - 使用Teleport传送到body -->
        <teleport to="body">
            <email-editor v-if="show_email_editor" @close="show_email_editor = false" />
        </teleport>
    </div>
</template>