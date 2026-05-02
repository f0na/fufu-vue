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

export async function search_content(params: {
  q: string;
  page?: number;
  page_size?: number;
}): Promise<SearchResponse> {
  const q = params.q?.trim() || '';
  const page = params.page || 1;
  const page_size = params.page_size || 10;

  if (!q || q.length < 2) {
    return {
      data: [],
      total: 0,
      page,
      page_size,
      total_pages: 0,
      query: q,
    };
  }

  return api.get<SearchResponse>('/api/search', {
    q,
    page: String(page),
    page_size: String(page_size),
  });
}
