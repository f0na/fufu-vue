/**
 * Markdown 扩展语法预处理
 * 支持图片尺寸调整语法
 */

/**
 * 预处理 Markdown 内容，将扩展图片语法转换为 HTML
 *
 * 支持格式：
 * - ![alt|200](url) → <img src="url" alt="alt" width="200">
 * - ![alt|200x150](url) → <img src="url" alt="alt" width="200" height="150">
 * - ![alt|50%](url) → <img src="url" alt="alt" width="50%">
 *
 * @param content Markdown 内容
 * @returns 处理后的内容
 */
export function preprocess_markdown_image_size(content: string): string {
  // 匹配 ![alt|size](url) 格式
  // size 可以是: 200, 200x150, 50%
  const image_size_pattern = /!\[([^\]]*)\|([^\]]+)\]\(([^)]+)\)/g

  return content.replace(image_size_pattern, (match, alt: string, size: string, url: string) => {
    // 解析尺寸
    let width: string | undefined
    let height: string | undefined

    if (size.includes('x')) {
      // 格式: 200x150
      const [w, h] = size.split('x')
      width = w
      height = h
    } else if (size.endsWith('%')) {
      // 格式: 50%
      width = size
    } else {
      // 格式: 200 (纯数字，单位 px)
      width = size
    }

    // 构建 img 标签
    const attrs: string[] = [`src="${url}"`, `alt="${alt}"`]
    if (width) attrs.push(`width="${width}"`)
    if (height) attrs.push(`height="${height}"`)

    return `<img ${attrs.join(' ')} />`
  })
}
