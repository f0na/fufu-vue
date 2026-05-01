import { api } from '@/lib/api-client';
import type { PaginatedResponse } from '@/lib/types/api';
import type { BangumiRecord, BangumiStatus } from '@/lib/types/bangumi';

export function get_records(params?: {
  page?: number;
  page_size?: number;
  status?: BangumiStatus;
  subject_id?: number;
}) {
  return api.get<PaginatedResponse<BangumiRecord>>(
    '/api/bangumi/records',
    params as Record<string, string>
  );
}

export function create_record(data: {
  subject_id: number;
  title: string;
  status?: BangumiStatus;
  progress?: string;
  cover_url?: string;
  fansub?: string;
}) {
  return api.post<BangumiRecord>('/api/bangumi/records', data);
}

export function update_record(id: string, data: {
  title?: string;
  status?: BangumiStatus;
  progress?: string;
  cover_url?: string;
  fansub?: string;
}) {
  return api.put<BangumiRecord>(`/api/bangumi/records/${id}`, data);
}

export function delete_record(id: string) {
  return api.delete(`/api/bangumi/records/${id}`);
}
