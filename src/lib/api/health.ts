import { api } from '@/lib/api-client';

export interface HealthCheck {
  status: string;
  uptime: number;
  checks: Record<string, { status: string; latency_ms: number }>;
}

export function get_health() {
  return api.get<HealthCheck>('/api/health');
}
