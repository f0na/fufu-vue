<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
import type { Application, Container } from 'pixi.js'

// Live2D 模型类型
interface Live2DModelType {
    anchor: { set: (x: number, y: number) => void }
    x: number
    y: number
    scale: { set: (s: number) => void }
    eventMode?: string
    interactive?: boolean
    expression: (name: string) => void
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

// 预设对话消息
const DIALOG_MESSAGES = [
    '你好呀～',
    '今天也要加油哦！',
    '有什么可以帮你的吗？',
    '记得多喝水～',
    '休息一下吧～',
    'Ciallo～(∠・ω< )⌒★',
    '欢迎来到我的小窝！',
    '希望你有愉快的一天～',
]

// 表情列表（不包含常态表情）
const EXPRESSIONS = ['BuOu', 'HeiLian', 'HaiXiu', 'XingXing', 'WuNai', 'JingYa', 'O']

// 常态表情
const DEFAULT_EXPRESSION = 'O'

// 点击计数相关（连续10次触发登录）
const CLICK_THRESHOLD = 10
const TIME_WINDOW = 10000 // 10秒
const click_times: number[] = []

// 对话相关
const DIALOG_COOLDOWN = 5000 // 5秒冷却
const dialog_visible = ref(false)
const dialog_message = ref('')
let last_dialog_time = 0
let dialog_timer: ReturnType<typeof setTimeout> | null = null

// 表情恢复定时器
let expression_timer: ReturnType<typeof setTimeout> | null = null

// 自动表情定时器
let auto_expression_interval: ReturnType<typeof setInterval> | null = null

// 事件
const emit = defineEmits(['secret-click'])

// 切换表情（临时）
function set_temp_expression(exp_name: string, duration: number = 3000) {
    const model = model_ref.value
    if (!model) return

    // 清除之前的恢复定时器
    if (expression_timer) {
        clearTimeout(expression_timer)
    }

    // 设置新表情
    model.expression(exp_name)

    // 定时恢复常态表情
    expression_timer = setTimeout(() => {
        if (model_ref.value) {
            model_ref.value.expression(DEFAULT_EXPRESSION)
        }
    }, duration)
}

// 随机切换表情
function random_expression() {
    const random_index = Math.floor(Math.random() * EXPRESSIONS.length)
    const exp_name = EXPRESSIONS[random_index]
    if (exp_name) {
        set_temp_expression(exp_name, 3000)
    }
}

// 自动做表情
function auto_expression() {
    const model = model_ref.value
    if (!model) return

    // 随机选择一个表情，持续 2-4 秒
    const random_index = Math.floor(Math.random() * EXPRESSIONS.length)
    const exp_name = EXPRESSIONS[random_index]
    const duration = 2000 + Math.random() * 2000

    if (exp_name) {
        set_temp_expression(exp_name, duration)
    }
}

// 显示对话
function show_dialog() {
    const now = Date.now()
    // 检查冷却时间
    if (now - last_dialog_time < DIALOG_COOLDOWN) {
        return false
    }
    last_dialog_time = now

    // 随机切换表情
    random_expression()

    // 随机选择一条消息
    const random_index = Math.floor(Math.random() * DIALOG_MESSAGES.length)
    dialog_message.value = DIALOG_MESSAGES[random_index]!
    dialog_visible.value = true

    // 3秒后自动隐藏
    if (dialog_timer) {
        clearTimeout(dialog_timer)
    }
    dialog_timer = setTimeout(() => {
        dialog_visible.value = false
    }, 3000)

    return true
}

// 处理点击
function handle_click() {
    const now = Date.now()
    click_times.push(now)

    // 清理超过时间窗口的点击
    while (click_times.length > 0 && click_times[0]! < now - TIME_WINDOW) {
        click_times.shift()
    }

    // 检查是否触发秘密点击
    if (click_times.length >= CLICK_THRESHOLD) {
        click_times.length = 0
        emit('secret-click')
        return
    }

    // 显示对话（如果冷却中则不显示）
    show_dialog()
}

const canvas_container = ref<HTMLDivElement | null>(null)
const app = ref<Application | null>(null)
const model_ref = ref<Live2DModelType | null>(null)

onMounted(async () => {
    if (!canvas_container.value) return

    // 等待 PIXI 加载
    if (!window.PIXI) {
        await new Promise<void>((resolve) => {
            const check_interval = setInterval(() => {
                if (window.PIXI) {
                    clearInterval(check_interval)
                    resolve()
                }
            }, 100)
        })
    }

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

    // 让 canvas 不阻止点击事件
    const canvas = app.value.view as HTMLCanvasElement
    canvas.style.pointerEvents = 'none'

    // 加载 Live2D 模型
    const model = (await Live2DModel.from(
        '/live2d/Furina/Furina.model3.json',
    )) as unknown as Live2DModelType
    model_ref.value = model

    // 设置模型位置和大小
    model.anchor.set(0.5, 0.5)
    model.x = 80
    model.y = 100
    model.scale.set(0.05)

    // 禁用模型交互，避免事件错误
    model.eventMode = 'none'
    model.interactive = false

    // 设置常态表情
    model.expression(DEFAULT_EXPRESSION)

    app.value.stage.addChild(model as unknown as Container)

    // 启动自动表情（每30秒）
    auto_expression_interval = setInterval(auto_expression, 30000)
})

onUnmounted(() => {
    if (dialog_timer) {
        clearTimeout(dialog_timer)
    }
    if (expression_timer) {
        clearTimeout(expression_timer)
    }
    if (auto_expression_interval) {
        clearInterval(auto_expression_interval)
    }
    model_ref.value = null
    app.value?.destroy(true)
})
</script>

<template>
    <div class="w-full h-[200px] cursor-pointer relative" @click="handle_click">
        <div ref="canvas_container" class="w-full h-full" />

        <!-- 对话气泡 -->
        <Transition name="dialog">
            <div v-if="dialog_visible"
                class="absolute -top-12 left-1/2 -translate-x-1/2 bg-white border border-[var(--c-border)] rounded-xl px-4 py-2 shadow-lg whitespace-nowrap text-sm text-slate-700">
                {{ dialog_message }}
                <!-- 小三角 -->
                <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
                <div
                    class="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[var(--c-border)]" />
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
    transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
}
</style>