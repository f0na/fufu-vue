import type { Gallery } from '@/lib/types/gallery'

/**
 * 从 public/content/gallery.json 读取相册数据
 */
async function read_gallery_from_file(): Promise<Gallery[]> {
  try {
    const res = await fetch('/content/gallery.json')
    if (!res.ok) return []
    const data = await res.json()
    return data.galleries || []
  } catch {
    return []
  }
}

/**
 * 获取所有相册
 */
export async function get_galleries(): Promise<Gallery[]> {
  return read_gallery_from_file()
}

/**
 * 根据 ID 获取单个相册
 */
export async function get_gallery_by_id(id: string): Promise<Gallery | null> {
  const galleries = await get_galleries()
  return galleries.find((g) => g.id === id) || null
}
