/**
 * 图片处理工具
 * 用于在上传前处理图片，解决 EXIF Orientation 问题
 */

/**
 * 使用 Canvas 将图片的 EXIF 方向"烧平"进像素
 * 浏览器在绘制图片到 canvas 时会自动应用 EXIF Orientation
 * 这样导出的图片就没有旋转信息，是正确的方向
 */
export async function flatten_exif_orientation(file: File): Promise<File> {
  // 只处理图片类型
  if (!file.type.startsWith('image/')) {
    return file
  }

  try {
    // 创建图片对象
    const img = new Image()
    const url = URL.createObjectURL(file)

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = url
    })

    // 创建 canvas，尺寸使用图片的自然尺寸（已应用 EXIF）
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    // 绘制图片到 canvas（浏览器自动处理 EXIF）
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      URL.revokeObjectURL(url)
      return file
    }

    ctx.drawImage(img, 0, 0)

    // 清理 URL
    URL.revokeObjectURL(url)

    // 导出为 blob，保持原始类型
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error('Canvas 导出失败'))
        },
        file.type,
        0.92, // 质量，对于 JPEG 有效
      )
    })

    // 创建新的 File 对象，保持原始文件名
    const processed_file = new File([blob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    })

    return processed_file
  } catch (e) {
    console.error('处理图片 EXIF 失败:', e)
    // 失败时返回原始文件
    return file
  }
}

/**
 * 压缩图片（可选）
 * @param file 原始文件
 * @param max_width 最大宽度
 * @param max_height 最大高度
 * @param quality 质量 (0-1)
 */
export async function compress_image(
  file: File,
  max_width?: number,
  max_height?: number,
  quality: number = 0.85,
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file
  }

  try {
    const img = new Image()
    const url = URL.createObjectURL(file)

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = url
    })

    let width = img.naturalWidth
    let height = img.naturalHeight

    // 计算缩放后的尺寸
    if (max_width && width > max_width) {
      height = height * (max_width / width)
      width = max_width
    }
    if (max_height && height > max_height) {
      width = width * (max_height / height)
      height = max_height
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width)
    canvas.height = Math.round(height)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      URL.revokeObjectURL(url)
      return file
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    URL.revokeObjectURL(url)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error('Canvas 导出失败'))
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality,
      )
    })

    return new File([blob], file.name, {
      type: blob.type,
      lastModified: Date.now(),
    })
  } catch (e) {
    console.error('压缩图片失败:', e)
    return file
  }
}