/**
 * 颜色对比度计算工具
 * 基于 WCAG 2.0 标准
 */

/**
 * 将十六进制颜色转换为 RGB
 */
function hex_to_rgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) {
        return { r: 0, g: 0, b: 0 }
    }
    return {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
    }
}

/**
 * 将 RGB 转换为十六进制
 */
function rgb_to_hex(r: number, g: number, b: number): string {
    const to_hex = (n: number) => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }
    return `#${to_hex(r)}${to_hex(g)}${to_hex(b)}`
}

/**
 * 将 sRGB 值转换为线性 RGB
 */
function srgb_to_linear(value: number): number {
    const normalized = value / 255
    if (normalized <= 0.03928) {
        return normalized / 12.92
    }
    return Math.pow((normalized + 0.055) / 1.055, 2.4)
}

/**
 * 计算颜色的相对亮度 (WCAG 定义)
 * L = 0.2126 × R + 0.7152 × G + 0.0722 × B
 */
export function get_relative_luminance(hex: string): number {
    const { r, g, b } = hex_to_rgb(hex)
    const r_linear = srgb_to_linear(r)
    const g_linear = srgb_to_linear(g)
    const b_linear = srgb_to_linear(b)
    return 0.2126 * r_linear + 0.7152 * g_linear + 0.0722 * b_linear
}

/**
 * 计算两个颜色之间的对比度
 * Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)
 */
export function get_contrast_ratio(color1: string, color2: string): number {
    const l1 = get_relative_luminance(color1)
    const l2 = get_relative_luminance(color2)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 判断对比度是否满足要求
 * @param color1 第一个颜色
 * @param color2 第二个颜色
 * @param min_ratio 最小对比度要求（默认 3.9）
 */
export function meets_contrast_requirement(
    color1: string,
    color2: string,
    min_ratio: number = 3.9
): boolean {
    return get_contrast_ratio(color1, color2) >= min_ratio
}

/**
 * 根据背景颜色生成满足对比度要求的文字颜色
 * @param bg_color 背景颜色（十六进制）
 * @param min_ratio 最小对比度要求（默认 3.9）
 * @returns 返回 '#000000'（深色）或 '#ffffff'（浅色）
 */
export function get_text_color_for_bg(bg_color: string, min_ratio: number = 3.9): string {
    const black = '#000000'
    const white = '#ffffff'

    const contrast_black = get_contrast_ratio(bg_color, black)
    const contrast_white = get_contrast_ratio(bg_color, white)

    // 选择对比度更高的颜色
    if (contrast_black >= min_ratio && contrast_black >= contrast_white) {
        return black
    }
    if (contrast_white >= min_ratio) {
        return white
    }

    // 如果都不满足，返回对比度较高的那个
    return contrast_black > contrast_white ? black : white
}

/**
 * 生成满足对比度要求的标签颜色
 * @param primary_color 主题色
 * @param min_ratio 最小对比度要求（默认 4.5）
 * @returns 标签背景色和文字色
 */
export function generate_tag_colors(primary_color: string, min_ratio: number = 4.5): { tagBg: string; tagText: string } {
    const { r, g, b } = hex_to_rgb(primary_color)

    // 方案1：主题色浅色背景 + 深色文字
    // 混合比例从 30% 开始，保证背景有足够颜色
    const dark_text = '#333333'

    for (let mix_ratio = 0.3; mix_ratio <= 0.7; mix_ratio += 0.1) {
        const bg_r = 255 - (255 - r) * mix_ratio
        const bg_g = 255 - (255 - g) * mix_ratio
        const bg_b = 255 - (255 - b) * mix_ratio
        const bg_color = rgb_to_hex(bg_r, bg_g, bg_b)

        if (get_contrast_ratio(bg_color, dark_text) >= min_ratio) {
            return { tagBg: bg_color, tagText: dark_text }
        }
    }

    // 方案2：主题色背景 + 白色文字
    const white_text = '#ffffff'
    if (get_contrast_ratio(primary_color, white_text) >= min_ratio) {
        return { tagBg: primary_color, tagText: white_text }
    }

    // 方案3：加深主题色背景 + 白色文字
    for (let darken = 0.1; darken <= 0.4; darken += 0.1) {
        const bg_r = r * (1 - darken)
        const bg_g = g * (1 - darken)
        const bg_b = b * (1 - darken)
        const bg_color = rgb_to_hex(bg_r, bg_g, bg_b)

        if (get_contrast_ratio(bg_color, white_text) >= min_ratio) {
            return { tagBg: bg_color, tagText: white_text }
        }
    }

    // 无法满足时，选择对比度最高的组合
    const light_bg_30 = rgb_to_hex(255 - (255 - r) * 0.3, 255 - (255 - g) * 0.3, 255 - (255 - b) * 0.3)
    const contrast_light = get_contrast_ratio(light_bg_30, dark_text)
    const contrast_dark = get_contrast_ratio(primary_color, white_text)

    if (contrast_light > contrast_dark) {
        return { tagBg: light_bg_30, tagText: dark_text }
    }
    return { tagBg: primary_color, tagText: white_text }
}