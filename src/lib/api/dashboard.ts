import { api } from '@/lib/api-client';
import type { DashboardStats } from '@/lib/types/dashboard';

export function get_dashboard() {
  return api.get<DashboardStats>('/api/auth/dashboard');
}
