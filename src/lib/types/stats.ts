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
  deployed_at_epoch: number;
}

export interface StatsData {
  active_visitors: number;
  today: StatsTimeRange;
  last_30_days: StatsTimeRange;
  pageviews_timeline: TimelinePoint[];
  deploy_info: DeployInfo;
}
