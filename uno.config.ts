import { defineConfig, presetAttributify, presetIcons, presetTypography, presetWind4 } from 'unocss'
import { presetExtra } from 'unocss-preset-extra';



export default defineConfig({
    presets: [
        presetAttributify({ /* preset options */ }),
        presetWind4(),  // 取代presetUno
        presetExtra(), // 隐藏滚动条预设
        presetTypography(),
        presetIcons(),  // 图标
    ],
})