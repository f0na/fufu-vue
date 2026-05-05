import { api } from '@/lib/api-client';
import type { PrivacyDocument } from '@/lib/types/legal';
import { CACHE_TTL_LONG } from '@/lib/request-cache';

export function get_latest_privacy() {
  return api.get<PrivacyDocument>('/api/privacy', undefined, CACHE_TTL_LONG);
}

export function get_privacy_versions() {
  return api.get<PrivacyDocument[]>('/api/privacy/versions', undefined, CACHE_TTL_LONG);
}

export function create_privacy(data: { version: string; date: string; content: string }) {
  return api.post<PrivacyDocument>('/api/privacy', data);
}
