<script setup lang="ts">
const welcome_content = {
    title: '欢迎来到 fufu 的二次元小窝',
    subtitle: 'Ciallo～(∠・ω< )⌒★',
    description: '这里是我的个人空间，记录生活、分享创作。希望你能在这里找到喜欢的内容。'
}
</script>

<template>
    <div class="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">
            {{ welcome_content.title }}
        </h1>
        <p class="text-cyan-500 font-medium mb-4">
            {{ welcome_content.subtitle }}
        </p>
        <p class="text-gray-600 leading-relaxed">
            {{ welcome_content.description }}
        </p>
    </div>
</template>