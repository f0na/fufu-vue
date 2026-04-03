<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Live2DModel } from 'pixi-live2d-display/cubism4'

// 扩展 Window 类型
declare global {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Window {
        PIXI: any
    }
}

const canvas_container = ref<HTMLDivElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app = ref<any>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const model_ref = ref<any>(null)

onMounted(async () => {
    if (!canvas_container.value) return

    const PIXI = window.PIXI

    // 创建 PIXI 应用
    app.value = new PIXI.Application({
        width: 150,
        height: 200,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    })

    canvas_container.value.appendChild(app.value.view)

    // 加载 Live2D 模型
    const model = await Live2DModel.from('/live2d/mao_pro_zh/runtime/mao_pro.model3.json')
    model_ref.value = model

    // 设置模型位置和大小
    model.anchor.set(0.5, 0.5)
    model.x = 75
    model.y = 100
    model.scale.set(0.02)

    // 禁用模型交互，避免事件错误
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(model as any).eventMode = 'none'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(model as any).interactive = false

    app.value.stage.addChild(model)
})

onUnmounted(() => {
    model_ref.value = null
    app.value?.destroy(true)
})
</script>

<template>
    <div class="sticky top-4">
        <div ref="canvas_container" class="w-full h-[200px]" />
    </div>
</template>