import { api } from '@/lib/api-client';
import type { LikeResponse, LikeTargetType } from '@/lib/types/likes';
import { CACHE_TTL } from '@/lib/request-cache';

export function get_likes(target_type: LikeTargetType, target_id: string) {
  return api.get<LikeResponse>(`/api/likes/${target_type}/${target_id}`, undefined, CACHE_TTL);
}

export function toggle_like(target_type: LikeTargetType, target_id: string) {
  return api.post<LikeResponse>(`/api/likes/${target_type}/${target_id}`);
}
