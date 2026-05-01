import { api } from '@/lib/api-client';
import type { PaginatedResponse } from '@/lib/types/api';
import type { LinkItem, LinkCreate, LinkUpdate, LinksMeta } from '@/lib/types/link';

export function get_links(params?: {
  page?: number;
  page_size?: number;
  tag?: string;
  favorite?: number;
}) {
  return api.get<PaginatedResponse<LinkItem>>(
    '/api/links',
    params as Record<string, string>
  );
}

export function get_links_meta() {
  return api.get<LinksMeta>('/api/links/meta');
}

export function get_link_by_id(id: string) {
  return api.get<LinkItem>(`/api/links/${id}`);
}

export function create_link(data: LinkCreate) {
  return api.post<LinkItem>('/api/links', data);
}

export function update_link(id: string, data: LinkUpdate) {
  return api.put<LinkItem>(`/api/links/${id}`, data);
}

export function delete_link(id: string) {
  return api.delete(`/api/links/${id}`);
}
