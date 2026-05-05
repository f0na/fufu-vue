import { api } from '@/lib/api-client';
import { CACHE_TTL } from '@/lib/request-cache';

export interface HealthCheck {
  status: string;
  uptime: number;
  checks: Record<string, { status: string; latency_ms?: number }>;
}

export function get_health() {
  return api.get<HealthCheck>('/api/health', undefined, CACHE_TTL);
}
