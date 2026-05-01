import { api } from '@/lib/api-client';
import type { PrivacyDocument } from '@/lib/types/legal';

export function get_latest_privacy() {
  return api.get<PrivacyDocument>('/api/privacy');
}

export function get_privacy_versions() {
  return api.get<PrivacyDocument[]>('/api/privacy/versions');
}

export function create_privacy(data: { version: string; date: string; content: string }) {
  return api.post<PrivacyDocument>('/api/privacy', data);
}
