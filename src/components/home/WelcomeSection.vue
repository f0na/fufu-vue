<script setup lang="ts">
const welcome_content = {
  title: '欢迎来到 fufu 的二次元小窝',
  subtitle: 'Ciallo～(∠・ω< )⌒★',
  description: '这里是我的小窝，记录生活、分享创作。希望你能在这里找到喜欢的内容。',
}
</script>

<template>
  <div class="p-6 rounded-xl bg-white border border-[var(--c-border)] shadow-sm">
    <h1 class="text-2xl font-bold text-slate-700 mb-2">
      {{ welcome_content.title }}
    </h1>
    <p class="text-[var(--c-primary)] font-medium mb-4">
      {{ welcome_content.subtitle }}
    </p>
    <p class="text-slate-600 leading-relaxed">
      {{ welcome_content.description }}
    </p>
  </div>
</template>
