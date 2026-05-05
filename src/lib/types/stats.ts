export interface StatsTimeRange {
  pageviews: number;
  visitors: number;
  visits: number;
}

export interface TimelinePoint {
  date: string;
  pageviews: number;
  sessions: number;
}

export interface DeployInfo {
  deployed_at: string;
  deployed_at_epoch: number;
  uptime_seconds: number;
  uptime_human: string;
}

export interface StatsData {
  active_visitors: number;
  today: StatsTimeRange;
  last_30_days: StatsTimeRange;
  pageviews_timeline: TimelinePoint[];
  deploy_info: DeployInfo;
}
