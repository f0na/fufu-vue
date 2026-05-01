export interface DashboardStats {
  today: {
    requests: number;
    bandwidth: string;
    avg_duration_ms: number;
  };
  this_month: {
    requests: number;
    bandwidth: string;
  };
  total: {
    requests: number;
    bandwidth: string;
  };
  status_codes: {
    '2xx': number;
    '4xx': number;
    '5xx': number;
  };
  health: {
    status: string;
    uptime: number;
    version: string;
    d1: { status: string; latency_ms: number };
    kv: { status: string; latency_ms: number };
  };
  stats: {
    posts: number;
    friends: number;
    links: number;
    galleries: number;
    bangumi_records: number;
  };
}
