import { api } from '@/lib/api-client';
import type { BangumiSubjectInfo } from '@/lib/types/bangumi';

// 条目类型枚举
export const SUBJECT_TYPES = {
  book: 1,
  anime: 2,
  music: 3,
  game: 4,
  real: 6,
};

// 排序类型
export const SORT_TYPES = ['match', 'heat', 'rank', 'score'] as const;
export type SortType = (typeof SORT_TYPES)[number];

export const SORT_LABELS: Record<SortType, string> = {
  match: '匹配度',
  heat: '热度',
  rank: '排名',
  score: '评分',
};

interface SearchSubjectsFilter {
  type?: number[];
  meta_tags?: string[];
  tag?: string[];
  air_date?: string[];
  rating?: string[];
  rating_count?: string[];
  rank?: string[];
  nsfw?: boolean | null;
}

interface SearchSubjectsParams {
  keyword: string;
  sort?: SortType;
  filter?: SearchSubjectsFilter;
  limit?: number;
  offset?: number;
}

interface SearchSubjectsResult {
  data: BangumiSubjectInfo[];
  total: number;
  limit: number;
  offset: number;
}

// 搜索番剧（通过后端代理）
export async function search_bangumi_subjects(
  params: SearchSubjectsParams
): Promise<SearchSubjectsResult> {
  const {
    keyword,
    sort = 'heat',
    filter = { type: [SUBJECT_TYPES.anime] },
    limit = 10,
    offset = 0,
  } = params;

  try {
    return await api.post<SearchSubjectsResult>('/api/bangumi/search', {
      keyword,
      sort,
      filter,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to search bangumi subjects:', error);
    return { data: [], total: 0, limit, offset };
  }
}

// 获取番剧详情（通过后端代理）
export async function fetch_bangumi_subject(id: number): Promise<BangumiSubjectInfo | null> {
  try {
    return await api.get<BangumiSubjectInfo>(`/api/bangumi/subjects/${id}`);
  } catch (error) {
    console.error(`Failed to fetch bangumi subject ${id}:`, error);
    return null;
  }
}

// 获取每周放送番剧（通过后端代理）
export async function fetch_calendar(): Promise<
  Array<{ weekday: number; items: BangumiSubjectInfo[] }>
> {
  try {
    const data = await api.get<Array<{ weekday?: { id: number }; items?: unknown[] }>>(
      '/api/bangumi/calendar'
    );
    if (!Array.isArray(data)) {
      console.warn('Calendar API returned non-array:', data);
      return [];
    }
    return data.map((day) => ({
      weekday: day.weekday?.id ?? 0,
      items: (day.items || []) as BangumiSubjectInfo[],
    }));
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
    return [];
  }
}

// 获取指定星期的番剧
export async function fetch_weekday_bangumi(weekday: number): Promise<BangumiSubjectInfo[]> {
  const calendar = await fetch_calendar();
  const day_data = calendar.find((d) => d.weekday === weekday);
  return day_data?.items || [];
}

// 浏览条目（通过后端代理）
interface BrowseSubjectsParams {
  type: number;
  cat?: number;
  series?: boolean;
  platform?: string;
  sort?: 'date' | 'rank';
  year?: number;
  month?: number;
  limit?: number;
  offset?: number;
}

export async function browse_subjects(
  params: BrowseSubjectsParams
): Promise<{ data: BangumiSubjectInfo[]; total: number }> {
  const { type, cat, series, platform, sort, year, month, limit = 20, offset = 0 } = params;

  try {
    const query_params: Record<string, string> = { type: String(type), limit: String(limit), offset: String(offset) };
    if (cat) query_params.cat = String(cat);
    if (series !== undefined) query_params.series = String(series);
    if (platform) query_params.platform = platform;
    if (sort) query_params.sort = sort;
    if (year) query_params.year = String(year);
    if (month) query_params.month = String(month);

    return await api.get<{ data: BangumiSubjectInfo[]; total: number }>(
      '/api/bangumi/browse',
      query_params
    );
  } catch (error) {
    console.error('Failed to browse subjects:', error);
    return { data: [], total: 0 };
  }
}
