<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    title: string
    placeholder?: string
}>()

const emit = defineEmits<{
    (e: 'confirm', value: string): void
    (e: 'cancel'): void
}>()

const input_value = ref('')
</script>

<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black/30 z-[110]" @click.self="emit('cancel')">
        <div class="flex flex-col gap-4 p-5 rounded-2xl backdrop-blur-md bg-white/95 border border-white/30 w-72 animate-in fade-in zoom-in duration-200">
            <!-- 标题 -->
            <h3 class="text-lg font-bold text-gray-800">{{ title }}</h3>

            <!-- 输入框 -->
            <input
                v-model="input_value"
                type="text"
                :placeholder="placeholder || '请输入...'"
                class="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all"
                autofocus
                @keyup.enter="emit('confirm', input_value)"
                @keyup.escape="emit('cancel')"
            />

            <!-- 按钮 -->
            <div class="flex gap-3">
                <button @click="emit('cancel')" class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                    取消
                </button>
                <button @click="emit('confirm', input_value)" class="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-400 text-white font-medium hover:from-cyan-500 hover:to-teal-500 transition-colors">
                    确认
                </button>
            </div>
        </div>
    </div>
</template>