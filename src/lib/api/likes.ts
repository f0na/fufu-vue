import { api } from '@/lib/api-client';
import type { LikeResponse, LikeTargetType } from '@/lib/types/likes';

export function get_likes(target_type: LikeTargetType, target_id: string) {
  return api.get<LikeResponse>(`/api/likes/${target_type}/${target_id}`);
}

export function toggle_like(target_type: LikeTargetType, target_id: string) {
  return api.post<LikeResponse>(`/api/likes/${target_type}/${target_id}`);
}
