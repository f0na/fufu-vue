import { api } from '@/lib/api-client';
import type { PaginatedResponse } from '@/lib/types/api';
import type {
  FriendItem,
  FriendCreate,
  FriendUpdate,
  FriendStatusUpdate,
} from '@/lib/types/friend';
import { CACHE_TTL } from '@/lib/request-cache';

export function get_friends(params?: {
  page?: number;
  page_size?: number;
  status?: string;
}) {
  return api.get<PaginatedResponse<FriendItem>>(
    '/api/friends',
    params as Record<string, string>,
    params?.status ? undefined : CACHE_TTL,
  );
}

export function get_friend_by_id(id: string) {
  return api.get<FriendItem>(`/api/friends/${id}`, undefined, CACHE_TTL);
}

export function create_friend(data: FriendCreate) {
  return api.post<FriendItem>('/api/friends', data);
}

export function update_friend(id: string, data: FriendUpdate) {
  return api.put<FriendItem>(`/api/friends/${id}`, data);
}

export function delete_friend(id: string) {
  return api.delete(`/api/friends/${id}`);
}

export function update_friend_status(id: string, status: FriendStatusUpdate['status']) {
  return api.patch<FriendItem>(`/api/friends/${id}/status`, { status } as FriendStatusUpdate);
}
