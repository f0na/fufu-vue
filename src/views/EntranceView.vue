<script setup lang="ts">
import BackgroundImage from '@/components/entrance/BackgroundImage.vue'
import ProfileCard from '@/components/entrance/ProfileCard.vue'
import ClockCard from '@/components/entrance/ClockCard.vue'
import EnterButton from '@/components/entrance/EnterButton.vue'
import RandomGallery from '@/components/entrance/RandomGallery.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const is_entering = ref(false)

function handle_enter() {
  is_entering.value = true
  setTimeout(() => {
    router.push('/home')
  }, 800)
}
</script>

<template>
  <div class="relative w-full h-full overflow-hidden md:w-screen md:h-screen">
    <background-image />

    <!-- 内容层 -->
    <div
      class="relative min-h-screen md:absolute md:inset-0 flex items-center justify-center p-6 overflow-y-auto md:overflow-hidden"
      :class="{ 'pointer-events-none': is_entering }"
    >
      <!--  移动端：垂直排列，可滚动 -->
      <div class="flex flex-col items-center justify-center gap-6 py-8 md:hidden">
        <div
          class="transition-all duration-700"
          :class="is_entering ? '-translate-y-[120%] opacity-0' : 'translate-y-0 opacity-100'"
        >
          <profile-card />
        </div>
        <div
          class="transition-all duration-700 delay-100"
          :class="is_entering ? 'scale-0 opacity-0' : 'scale-100 opacity-100'"
        >
          <random-gallery />
        </div>
        <div
          class="transition-all duration-700 delay-200"
          :class="is_entering ? 'scale-0 opacity-0' : 'scale-100 opacity-100'"
        >
          <clock-card />
        </div>
        <div
          class="transition-all duration-700 delay-300"
          :class="is_entering ? 'translate-y-[120%] opacity-0' : 'translate-y-0 opacity-100'"
        >
          <enter-button @click="handle_enter" />
        </div>
      </div>

      <!--  桌面端：中间偏下 + Grid错位布局 -->
      <!-- 外层容器：精准固定在屏幕中下部水平居中 -->
      <div class="hidden md:block absolute bottom-[20%] left-1/2 -translate-x-1/2">
        <!-- 核心修复：w-fit 强制网格收缩，gap 才会精确控制组件物理间距 -->
        <div class="w-fit grid grid-cols-2 gap-[18px]">
          <!-- 左上：个人信息 -->
          <div class="translate-x-[3px] -translate-y-[3px]">
            <div
              class="transition-all duration-700 ease-out"
              :class="
                is_entering
                  ? '-translate-x-[150%] -translate-y-[40%] opacity-0'
                  : 'translate-x-0 translate-y-0 opacity-100'
              "
            >
              <profile-card />
            </div>
          </div>

          <!-- 右上：随机相册 -->
          <div class="-translate-x-[3px] -translate-y-[-40px]">
            <div
              class="transition-all duration-700 delay-100 ease-out"
              :class="
                is_entering
                  ? 'translate-x-[150%] -translate-y-[40%] opacity-0'
                  : 'translate-x-0 translate-y-0 opacity-100'
              "
            >
              <random-gallery />
            </div>
          </div>

          <!-- 左下：进入按钮 -->
          <div class="translate-x-[10px] translate-y-[-10px]">
            <div
              class="transition-all duration-700 delay-300 ease-out"
              :class="
                is_entering
                  ? '-translate-x-[150%] translate-y-[40%] opacity-0'
                  : 'translate-x-0 translate-y-0 opacity-100'
              "
            >
              <enter-button @click="handle_enter" />
            </div>
          </div>

          <!-- 右下：时钟 -->
          <div class="-translate-x-[3px] translate-y-[-60px]">
            <div
              class="transition-all duration-700 delay-200 ease-out"
              :class="
                is_entering
                  ? 'translate-x-[150%] translate-y-[40%] opacity-0'
                  : 'translate-x-0 translate-y-0 opacity-100'
              "
            >
              <clock-card />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
