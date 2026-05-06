import { api } from '@/lib/api-client';
import { CACHE_TTL } from '@/lib/request-cache';

export interface HealthData {
  status: string;
  instance_started_at_epoch: number;
  checks: Record<string, { status: string; latency_ms?: number }>;
}

export function get_health() {
  return api.get<HealthData>('/api/health', undefined, CACHE_TTL);
}
