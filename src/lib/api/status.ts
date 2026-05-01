import { api } from '@/lib/api-client';

export interface SiteStatus {
  api: {
    status: string;
    uptime: number;
    version: string;
    d1: { status: string; latency_ms: number };
    kv: { status: string; latency_ms: number };
  };
  site: {
    site_name: string;
    subtitle: string;
    description: string;
    logo_url: string;
  };
  stats: {
    posts: number;
    friends: number;
    links: number;
    galleries: number;
    bangumi_records: number;
  };
}

export function get_status() {
  return api.get<SiteStatus>('/api/status');
}
