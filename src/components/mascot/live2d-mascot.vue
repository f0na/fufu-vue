<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as PIXI from 'pixi.js';
import type { Live2DModel } from 'pixi-live2d-display/cubism4';
import { useAuthStore } from '@/stores/auth';

const CUBISM4_SDK_LOADED = (): boolean =>
  typeof window !== 'undefined' &&
  !!(window as unknown as { Live2DCubismCore: boolean }).Live2DCubismCore;

const DIALOG_MESSAGES = [
  '你好呀~',
  '今天想听什么歌？',
  '芙宁娜在这里等你很久了呢~',
  '有什么有趣的事情吗？',
  '累了就休息一下吧~',
  '要一起来看演出吗？',
  '希望你今天过得愉快！',
  '我为你准备了一首曲子~',
];

const EXPRESSIONS = ['BuOu', 'HeiLian', 'HaiXiu', 'XingXing', 'O'];
const DEFAULT_EXPRESSION = 'O';

interface Props {
  model_path?: string;
}

withDefaults(defineProps<Props>(), {
  model_path: '/live2d/Furina/Furina.model3.json',
});

const router = useRouter();
const canvas_ref = ref<HTMLCanvasElement | null>(null);

const is_loaded = ref(false);
const show_dialog = ref(false);
const dialog_message = ref('');

let app_ref: PIXI.Application | null = null;

let model_ref: Live2DModel | null = null;
let click_timer: ReturnType<typeof setTimeout> | null = null;
let click_count = 0;
let last_click_time = 0;
let is_mounted = false;
let secret_count = 0;
let secret_start = 0;

function trigger_dialog() {
  const now = Date.now();
  if (now - last_click_time < 5000) return;
  last_click_time = now;

  const model = model_ref;
  if (model) {
    const random_exp = EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)];
    model.expression?.(random_exp)?.catch(() => {});
    setTimeout(() => {
      if (model_ref) {
        model_ref.expression?.(DEFAULT_EXPRESSION)?.catch(() => {});
      }
    }, 3000);
  }

  const random_index = Math.floor(Math.random() * DIALOG_MESSAGES.length);
  dialog_message.value = DIALOG_MESSAGES[random_index] ?? '';
  show_dialog.value = true;
  setTimeout(() => {
    show_dialog.value = false;
  }, 3000);

  click_count += 1;
  if (click_timer) clearTimeout(click_timer);
  click_timer = setTimeout(() => {
    click_count = 0;
  }, 10000);

  if (click_count >= 10) {
    click_count = 0;
    if (click_timer) clearTimeout(click_timer);
    router.push('/admin');
  }
}

function handle_click() {
  if (!model_ref || !is_loaded.value) return;

  // 秘密入口：4 秒内连击 10 次跳转管理登录页
  const now = Date.now();
  if (now - secret_start > 4000) {
    secret_count = 0;
    secret_start = now;
  }
  secret_count++;
  if (secret_count >= 10) {
    secret_count = 0;
    const auth = useAuthStore();
    if (auth.is_authenticated) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
    return;
  }

  const canvas = canvas_ref.value;
  if (!canvas) return;

  const model = model_ref;
  const center_x = model.x;
  const center_y = model.y;
  const half_width = ((model.width || 100) / 2) * 0.6;
  const half_height = ((model.height || 100) / 2) * 0.6;

  const rect = canvas.getBoundingClientRect();
  const css_x = rect.width / 2;
  const css_y = rect.height / 2;

  if (Math.abs(css_x - center_x) <= half_width && Math.abs(css_y - center_y) <= half_height) {
    trigger_dialog();
  }
}

onMounted(async () => {
  is_mounted = true;
  const canvas = canvas_ref.value;
  if (!canvas) return;

  try {
    // Wait for Cubism SDK to load
    let retries = 0;
    while (!CUBISM4_SDK_LOADED() && retries < 50) {
      await new Promise((r) => setTimeout(r, 100));
      retries++;
    }

    if (!is_mounted) return;
    (window as unknown as { PIXI: typeof PIXI }).PIXI = PIXI;

    const { Live2DModel } = await import('pixi-live2d-display/cubism4');

    if (!is_mounted) return;

    const app = new PIXI.Application({
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      width: 160,
      height: 200,
      view: canvas,
    });
    app_ref = app;

    if (!is_mounted) {
      app.destroy();
      app_ref = null;
      return;
    }

    Live2DModel.registerTicker(PIXI.Ticker);

    const model = await Live2DModel.from('/live2d/Furina/Furina.model3.json');
    if (!is_mounted) {
      model.destroy();
      return;
    }

    model_ref = model;

    model.anchor.set(0.5, 0.5);
    model.scale.set(0.05);
    model.x = 80;
    model.y = 100;

    app.stage.addChild(model);
    model.autoUpdate = true;

    is_loaded.value = true;
  } catch (error) {
    console.error('Failed to initialize Live2D:', error);
  }
});

onUnmounted(() => {
  is_mounted = false;
  if (click_timer) clearTimeout(click_timer);
  if (model_ref) {
    model_ref.destroy();
    model_ref = null;
  }
  if (app_ref) {
    app_ref.destroy(false);
    app_ref = null;
  }
});
</script>

<template>
  <div class="w-full h-[200px] relative">
    <canvas
      ref="canvas_ref"
      class="w-full h-full cursor-pointer transition-opacity duration-500"
      :class="is_loaded ? 'opacity-100' : 'opacity-0'"
      width="160"
      height="200"
      @click="handle_click"
    />

    <Transition name="fade">
      <div
        v-if="show_dialog"
        class="absolute -top-12 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-border text-sm text-foreground whitespace-nowrap shadow-lg"
      >
        {{ dialog_message }}
        <div
          class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-card"
        />
      </div>
    </Transition>

    <div
      v-if="!is_loaded"
      class="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm pointer-events-none"
    >
      Loading...
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
