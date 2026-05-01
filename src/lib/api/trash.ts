import { api } from '@/lib/api-client';
import type { PaginatedResponse } from '@/lib/types/api';
import type { TrashItem, TrashResource } from '@/lib/types/trash';

function resource_path(resource: TrashResource): string {
  return `/api/trash/${encodeURIComponent(resource)}`;
}

export function get_trash(resource: TrashResource, params?: {
  page?: number;
  page_size?: number;
}) {
  return api.get<PaginatedResponse<TrashItem>>(
    resource_path(resource),
    params as Record<string, string>
  );
}

export function permanently_delete(resource: TrashResource, id: string) {
  return api.delete(`${resource_path(resource)}/${id}`);
}

export function restore(resource: TrashResource, id: string) {
  return api.post<{ message: string }>(`${resource_path(resource)}/${id}/restore`);
}
