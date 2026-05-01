import { api } from '@/lib/api-client';
import type { LegalDocument } from '@/lib/types/legal';

export function get_latest_license() {
  return api.get<LegalDocument>('/api/license');
}

export function get_license_versions() {
  return api.get<LegalDocument[]>('/api/license/versions');
}

export function create_license(data: { version: string; content: string }) {
  return api.post<LegalDocument>('/api/license', data);
}
