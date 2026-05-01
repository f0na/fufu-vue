import { api } from '@/lib/api-client';
import type { PaginatedResponse } from '@/lib/types/api';
import type { Post, PostCreate, PostUpdate } from '@/lib/types/post';

export function get_posts(params?: {
  page?: number;
  page_size?: number;
  tag?: string;
  year?: string;
  status?: string;
}) {
  return api.get<PaginatedResponse<Post>>('/api/posts', params as Record<string, string>);
}

export function get_post_by_slug(slug: string) {
  return api.get<Post>(`/api/posts/${slug}`);
}

export function create_post(data: PostCreate) {
  return api.post<Post>('/api/posts', data);
}

export function update_post(slug: string, data: PostUpdate) {
  return api.put<Post>(`/api/posts/${slug}`, data);
}

export function delete_post(slug: string) {
  return api.delete(`/api/posts/${slug}`);
}

export function increment_views(slug: string) {
  return api.post<{ message: string }>(`/api/posts/${slug}/views`);
}

export function get_comments_count(slug: string) {
  return api.get<{ count: number }>(`/api/posts/${slug}/comments-count`);
}
