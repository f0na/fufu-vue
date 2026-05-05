import { api } from '@/lib/api-client';
import type { LegalDocument } from '@/lib/types/legal';
import { CACHE_TTL_LONG } from '@/lib/request-cache';

export function get_latest_license() {
  return api.get<LegalDocument>('/api/license', undefined, CACHE_TTL_LONG);
}

export function get_license_versions() {
  return api.get<LegalDocument[]>('/api/license/versions', undefined, CACHE_TTL_LONG);
}

export function create_license(data: { version: string; content: string }) {
  return api.post<LegalDocument>('/api/license', data);
}
