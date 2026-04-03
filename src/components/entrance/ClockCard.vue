<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const current_time = ref('')
const current_date = ref('')
let timer: ReturnType<typeof setInterval> | null = null

function update_time() {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    current_time.value = `${hours}:${minutes}:${seconds}`

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekday = weekdays[now.getDay()]
    current_date.value = `${year}-${month}-${day} ${weekday}`
}

onMounted(() => {
    update_time()
    timer = setInterval(update_time, 1000)
})

onUnmounted(() => {
    if (timer) {
        clearInterval(timer)
    }
})
</script>

<template>
    <div
        class="flex flex-col items-center gap-1 p-3 rounded-xl backdrop-blur-md bg-white/10 border border-rose-200/30 w-32 shrink-0"
    >
        <!-- 时间 -->
        <div class="text-2xl font-mono font-bold text-white tracking-wider">
            {{ current_time }}
        </div>

        <!-- 日期 -->
        <div class="text-xs text-rose-100/80">
            {{ current_date }}
        </div>
    </div>
</template>