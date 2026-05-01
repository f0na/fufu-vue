import { api } from '@/lib/api-client';
import type { PaginatedResponse } from '@/lib/types/api';
import type {
  Gallery,
  GalleryCreate,
  GalleryUpdate,
  GalleryPhoto,
  PhotosCreate,
} from '@/lib/types/gallery';

export function get_galleries(params?: {
  page?: number;
  page_size?: number;
  tag?: string;
}) {
  return api.get<PaginatedResponse<Gallery>>(
    '/api/galleries',
    params as Record<string, string>
  );
}

export function get_gallery_by_id(id: string) {
  return api.get<Gallery>(`/api/galleries/${id}`);
}

export function create_gallery(data: GalleryCreate) {
  return api.post<Gallery>('/api/galleries', data);
}

export function update_gallery(id: string, data: GalleryUpdate) {
  return api.put<Gallery>(`/api/galleries/${id}`, data);
}

export function delete_gallery(id: string) {
  return api.delete(`/api/galleries/${id}`);
}

export function add_photos(gallery_id: string, paths: string[]) {
  const data: PhotosCreate = { paths };
  return api.post<GalleryPhoto[]>(`/api/galleries/${gallery_id}/photos`, data);
}

export function delete_photo(photo_id: string) {
  return api.delete(`/api/photos/${photo_id}`);
}
