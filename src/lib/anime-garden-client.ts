import type { AnimeResource } from '@/lib/types/bangumi';
import { api_request } from '@/lib/api-client';

export interface AnimeGardenSearchParams {
  page?: number;
  pageSize?: number;
  search?: string | string[];
  include?: string | string[];
  keywords?: string | string[];
  exclude?: string | string[];
  type?: string;
  types?: string[];
  fansub?: string;
  fansubs?: string[];
  publisher?: string;
  publishers?: string[];
  subject?: number;
  subjects?: number[];
  after?: Date;
  before?: Date;
  provider?: 'dmhy' | 'moe' | 'ani';
  duplicate?: boolean;
  metadata?: boolean;
  tracker?: boolean;
}

interface FetchResourcesResult {
  resources: AnimeResource[];
  complete: boolean;
  page: number;
  pageSize: number;
}

interface AnimeGardenApiResponse {
  status: string;
  complete: boolean;
  resources: Array<{
    id: number;
    provider: string;
    providerId: string;
    title: string;
    href: string;
    type: string;
    magnet: string;
    size: number;
    createdAt: string;
    fetchedAt: string;
    publisher: { id: number; name: string; avatar?: string | null };
    fansub?: { id: number; name: string; avatar?: string | null } | null;
    subjectId?: number | null;
    metadata?: Record<string, unknown>;
  }>;
  pagination: { page: number; pageSize: number; complete: boolean };
  filter: Record<string, unknown>;
}

export async function fetch_resources(
  params: AnimeGardenSearchParams = {}
): Promise<FetchResourcesResult> {
  const {
    page = 1,
    pageSize = 20,
    search,
    include,
    keywords,
    exclude,
    type,
    types,
    fansub,
    fansubs,
    publisher,
    publishers,
    subject,
    subjects,
    after,
    before,
    provider,
    duplicate,
    metadata = false,
    tracker = false,
  } = params;

  try {
    const url_params = new URLSearchParams();
    url_params.set('page', String(page));
    url_params.set('pageSize', String(pageSize));

    if (search) {
      if (Array.isArray(search)) {
        search.forEach((s) => url_params.append('search', s));
      } else {
        url_params.set('search', search);
      }
    }
    if (include) {
      if (Array.isArray(include)) {
        include.forEach((i) => url_params.append('include', i));
      } else {
        url_params.set('include', include);
      }
    }
    if (keywords) {
      if (Array.isArray(keywords)) {
        keywords.forEach((k) => url_params.append('keywords', k));
      } else {
        url_params.set('keywords', keywords);
      }
    }
    if (exclude) {
      if (Array.isArray(exclude)) {
        exclude.forEach((e) => url_params.append('exclude', e));
      } else {
        url_params.set('exclude', exclude);
      }
    }

    if (type) {
      url_params.set('type', type);
    } else if (types && types.length > 0) {
      types.forEach((t) => url_params.append('type', t));
    }

    if (fansub) {
      url_params.set('fansub', fansub);
    } else if (fansubs && fansubs.length > 0) {
      fansubs.forEach((f) => url_params.append('fansub', f));
    }

    if (publisher) {
      url_params.set('publisher', publisher);
    } else if (publishers && publishers.length > 0) {
      publishers.forEach((p) => url_params.append('publisher', p));
    }

    if (subject) {
      url_params.set('subject', String(subject));
    } else if (subjects && subjects.length > 0) {
      subjects.forEach((s) => url_params.append('subject', String(s)));
    }

    if (after) {
      url_params.set('after', after.toISOString());
    }
    if (before) {
      url_params.set('before', before.toISOString());
    }

    if (provider) {
      url_params.set('provider', provider);
    }

    if (duplicate) {
      url_params.set('duplicate', 'true');
    }
    if (metadata) {
      url_params.set('metadata', 'true');
    }
    if (tracker) {
      url_params.set('tracker', 'true');
    }

    const data = await api_request<AnimeGardenApiResponse>(`/api/anime-garden/resources?${url_params.toString()}`);

    if (data.status !== 'OK') {
      throw new Error(`API returned error status: ${data.status}`);
    }

    const resources: AnimeResource[] = data.resources.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      magnet: r.magnet,
      size: r.size,
      created_at: new Date(r.createdAt),
      fetched_at: new Date(r.fetchedAt),
      fansub: r.fansub,
      publisher: r.publisher,
      subject_id: r.subjectId,
      metadata: r.metadata,
    }));

    return {
      resources,
      complete: data.pagination.complete ?? true,
      page: data.pagination.page ?? page,
      pageSize: data.pagination.pageSize ?? pageSize,
    };
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    throw error;
  }
}

export function format_size(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)}GB`;
}

export async function fetch_popular_fansubs(
  limit: number = 20
): Promise<{ id: number; name: string; count: number }[]> {
  const result = await fetch_resources({ pageSize: 500 });
  const fansub_counts = new Map<number, { name: string; count: number }>();

  for (const r of result.resources) {
    if (r.fansub) {
      const existing = fansub_counts.get(r.fansub.id);
      if (existing) {
        existing.count++;
      } else {
        fansub_counts.set(r.fansub.id, { name: r.fansub.name, count: 1 });
      }
    }
  }

  return [...fansub_counts.entries()]
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function fetch_popular_publishers(
  limit: number = 20
): Promise<{ id: number; name: string; count: number }[]> {
  const result = await fetch_resources({ pageSize: 500 });
  const publisher_counts = new Map<number, { name: string; count: number }>();

  for (const r of result.resources) {
    const existing = publisher_counts.get(r.publisher.id);
    if (existing) {
      existing.count++;
    } else {
      publisher_counts.set(r.publisher.id, { name: r.publisher.name, count: 1 });
    }
  }

  return [...publisher_counts.entries()]
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
