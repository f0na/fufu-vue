<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
    <RouterView />
</template>

<style>
/* 主题变量由 JS 动态设置，这里只定义默认值 */
:root {
    --c-bg: #fff1f2;
    --c-primary: #fb7185;
    --c-primary-light: #fda4af;
    --c-primary-bg: #ffe4e6;
    --c-border: #fecdd3;
    --c-secondary: #2dd4bf;
}

/* 自定义动画 */
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
}
</style>
