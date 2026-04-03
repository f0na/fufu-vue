import { defineConfig, presetAttributify, presetIcons, presetTypography, presetWind4 } from 'unocss'
import { presetExtra } from 'unocss-preset-extra'

export default defineConfig({
    presets: [
        presetAttributify({ /* preset options */ }),
        presetWind4(),
        presetExtra(),
        presetTypography(),
        presetIcons(),
    ],
})