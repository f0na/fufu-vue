<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
import type { Application, Container } from 'pixi.js'

// Live2D 模型类型
interface Live2DModelType extends Container {
    anchor: { set: (x: number, y: number) => void }
    x: number
    y: number
    scale: { set: (s: number) => void }
    eventMode?: string
    interactive?: boolean
}

// 扩展 Window 类型
declare global {
    interface Window {
        PIXI: {
            Application: new (options: {
                width: number
                height: number
                backgroundAlpha: number
                resolution: number
                autoDensity: boolean
            }) => Application
        }
    }
}

const canvas_container = ref<HTMLDivElement | null>(null)
const app = ref<Application | null>(null)
const model_ref = ref<Live2DModelType | null>(null)

onMounted(async () => {
    if (!canvas_container.value) return

    const PIXI = window.PIXI

    // 创建 PIXI 应用
    app.value = new PIXI.Application({
        width: 160,
        height: 200,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    })

    canvas_container.value.appendChild(app.value.view as HTMLCanvasElement)

    // 加载 Live2D 模型
    const model = await Live2DModel.from('/live2d/mao_pro_zh/runtime/mao_pro.model3.json') as Live2DModelType
    model_ref.value = model

    // 设置模型位置和大小
    model.anchor.set(0.5, 0.5)
    model.x = 80
    model.y = 100
    model.scale.set(0.02)

    // 禁用模型交互，避免事件错误
    model.eventMode = 'none'
    model.interactive = false

    app.value.stage.addChild(model)
})

onUnmounted(() => {
    model_ref.value = null
    app.value?.destroy(true)
})
</script>

<template>
    <div>
        <div ref="canvas_container" class="w-full h-[200px]" />
    </div>
</template>