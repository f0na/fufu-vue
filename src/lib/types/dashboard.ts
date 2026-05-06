export interface AnalyticsTimeRange {
  pageviews: number;
  visitors: number;
  visits: number;
}

export interface TimelineEntry {
  date: string;
  pageviews: number;
  sessions: number;
}

export interface NameCount {
  name: string;
  count: number;
}

export interface HealthStatus {
  status: string;
  instance_started_at_epoch: number;
  version: string;
  kv: { status: string };
}

export interface ContentStats {
  posts: number;
  friends: number;
  links: number;
  galleries: number;
  bangumi_records: number;
}

export interface DeployInfo {
  deployed_at_epoch: number;
}

export interface ExternalApiStatus {
  name: string;
  status: string;
  latency_ms: number | null;
}

export interface DatabaseStatus {
  name: string;
  binding: string;
  status: string;
  latency_ms: number;
}

export interface DashboardStats {
  analytics: {
    active_visitors: number;
    today: AnalyticsTimeRange;
    this_month: AnalyticsTimeRange;
    last_30_days: AnalyticsTimeRange;
    pageviews_timeline: TimelineEntry[];
    top_pages: NameCount[];
    top_referrers: NameCount[];
    browsers: NameCount[];
    os: NameCount[];
    devices: NameCount[];
    countries: NameCount[];
  };
  health: HealthStatus;
  stats: ContentStats;
  deploy_info: DeployInfo;
  external_apis: ExternalApiStatus[];
  databases: DatabaseStatus[];
}
