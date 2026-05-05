import { api } from '@/lib/api-client';
import { CACHE_TTL } from '@/lib/request-cache';
import type { StatsData } from '@/lib/types/stats';

export function get_stats() {
  return api.get<StatsData>('/api/stats', undefined, CACHE_TTL);
}
