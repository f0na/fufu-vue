<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import ProfileCard from '@/components/entrance/profile-card.vue';
import LikeButton from '@/components/entrance/like-button.vue';
import ClockWidget from '@/components/entrance/clock-widget.vue';
import WaveDivider from '@/components/ui/wave-divider/WaveDivider.vue';

const router = useRouter();
const state = ref<'idle' | 'exiting'>('idle');
let timer_id: ReturnType<typeof setTimeout> | null = null;

function handle_enter() {
  state.value = 'exiting';
  timer_id = setTimeout(() => {
    router.push('/home');
  }, 800);
}

onUnmounted(() => {
  if (timer_id) clearTimeout(timer_id);
});
</script>

<template>
  <div class="fixed inset-0 w-screen h-screen overflow-hidden cursor-pointer" @click="handle_enter">
    <!-- 背景图 -->
    <div class="absolute inset-0">
      <img src="https://t.alcy.cc/moez" alt="背景" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-background/20" />
    </div>

    <!-- 波浪分割 -->
    <div class="absolute bottom-0 w-full">
      <WaveDivider :height="80" />
    </div>

    <!-- 组件层 -->
    <Transition name="fade">
      <div
        v-if="state === 'idle'"
        class="absolute top-[65%] left-1/2 -translate-x-1/2 flex gap-4 items-end"
      >
        <!-- 左侧：个人信息卡片 -->
        <Transition name="slide-left" appear>
          <div @click.stop>
            <ProfileCard />
          </div>
        </Transition>

        <!-- 右侧：点赞和时钟 -->
        <div class="flex flex-col gap-3 mb-6">
          <Transition name="slide-up" appear>
            <div @click.stop>
              <LikeButton :initial_count="42" />
            </div>
          </Transition>
          <Transition name="slide-down" appear>
            <div @click.stop>
              <ClockWidget />
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- 退出动画 -->
    <Transition name="fade">
      <div
        v-if="state === 'exiting'"
        class="absolute top-[65%] left-1/2 -translate-x-1/2 flex gap-4 items-end"
      >
        <div class="animate-slide-out-left">
          <ProfileCard />
        </div>
        <div class="flex flex-col gap-3 mb-6">
          <div class="animate-slide-out-up">
            <LikeButton :initial_count="42" />
          </div>
          <div class="animate-slide-out-down">
            <ClockWidget />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.8s ease-in-out;
}
.slide-left-enter-from {
  transform: translateX(-100vw);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100vw);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.8s ease-in-out;
}
.slide-up-enter-from {
  transform: translateY(100vh);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(-100vh);
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.8s ease-in-out;
}
.slide-down-enter-from {
  transform: translateY(-100vh);
  opacity: 0;
}
.slide-down-leave-to {
  transform: translateY(100vh);
  opacity: 0;
}

@keyframes slide-out-left {
  to {
    transform: translateX(-100vw);
    opacity: 0;
  }
}
@keyframes slide-out-up {
  to {
    transform: translateY(-100vh);
    opacity: 0;
  }
}
@keyframes slide-out-down {
  to {
    transform: translateY(100vh);
    opacity: 0;
  }
}

.animate-slide-out-left {
  animation: slide-out-left 0.8s ease-in-out forwards;
}
.animate-slide-out-up {
  animation: slide-out-up 0.8s ease-in-out forwards;
}
.animate-slide-out-down {
  animation: slide-out-down 0.8s ease-in-out forwards;
}
</style>
