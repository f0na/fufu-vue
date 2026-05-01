import type { Gallery } from '@/lib/types/gallery';
import * as galleries_api from '@/lib/api/galleries';

function map_api_gallery(g: Gallery): Gallery {
  return {
    ...g,
    tags: typeof g.tags === 'string' ? JSON.parse(g.tags as string) : g.tags,
    photos: Array.isArray(g.photos)
      ? g.photos.map((p) => (typeof p === 'object' && p !== null ? (p as { path: string }).path : p))
      : [],
  };
}

export async function get_galleries(): Promise<Gallery[]> {
  const result = await galleries_api.get_galleries({ page: 1, page_size: 100 });
  return result.data.map(map_api_gallery);
}

export async function get_gallery_by_id(id: string): Promise<Gallery | null> {
  try {
    const gallery = await galleries_api.get_gallery_by_id(id);
    return map_api_gallery(gallery);
  } catch {
    return null;
  }
}
