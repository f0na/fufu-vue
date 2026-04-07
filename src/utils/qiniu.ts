/**
 * 七牛云图片处理工具
 */

/**
 * 添加自动校正 EXIF 方向参数
 * 七牛云 imageMogr2/auto-orient 会根据 EXIF Orientation 自动旋转图片
 *
 * 注意：
 * 1. 新上传的图片已在前端通过 canvas 处理了 EXIF，不需要此参数
 * 2. 带签名的 URL（包含 token=）添加处理参数可能导致签名失效，因此不处理
 */
export function add_auto_orient(url: string): string {
  if (!url) {
    return ''
  }

  // 带签名的 URL 不添加处理参数，避免破坏签名
  if (url.includes('token=')) {
    return url
  }

  // 检查是否是七牛云 URL
  const is_qiniu = url.includes('qiniu') || url.includes('clouddn') || url.includes('qiniucdn')

  if (!is_qiniu) {
    return url
  }

  // 检查是否已经有处理参数
  if (url.includes('imageMogr2')) return url

  // 添加 auto-orient 参数
  const separator = url.includes('?') ? '|' : '?'
  return `${url}${separator}imageMogr2/auto-orient`
}

/**
 * 获取带所有处理参数的图片 URL
 */
export function process_image_url(url: string, options?: {
  auto_orient?: boolean
  width?: number
  height?: number
  quality?: number
}): string {
  if (!url) return url

  const is_qiniu = url.includes('qiniu') || url.includes('clouddn') || url.includes('qiniucdn')
  if (!is_qiniu) return url

  const params: string[] = []

  if (options?.auto_orient !== false) {
    params.push('auto-orient')
  }

  if (options?.width || options?.height) {
    const w = options?.width ? `/thumbnail/${options.width}x` : ''
    const h = options?.height ? `${options.height}` : ''
    if (w || h) {
      params.push(`thumbnail/${options.width || ''}x${options.height || ''}`)
    }
  }

  if (options?.quality) {
    params.push(`quality/${options.quality}`)
  }

  if (params.length === 0) return url

  // 检查是否已经有 imageMogr2 参数
  if (url.includes('imageMogr2')) {
    // 已有参数，追加
    return url
  }

  const separator = url.includes('?') ? '|' : '?'
  return `${url}${separator}imageMogr2/${params.join('/')}`
}