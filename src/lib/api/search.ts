import { api } from '@/lib/api-client';
import type { PaginatedResponse } from '@/lib/types/api';

export interface SearchResult {
  type: 'post' | 'link' | 'gallery' | 'friend' | 'announcement';
  title: string;
  url: string | null;
  snippet: string;
  published_at: string;
}

export interface SearchResponse extends PaginatedResponse<SearchResult> {
  query: string;
}

export function search_content(params: { q: string; page?: number; page_size?: number }) {
  return api.get<SearchResponse>('/api/search', params as Record<string, string>);
}
