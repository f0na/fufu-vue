import type { LinkItem, LinksResponse, LinksMeta } from '@/lib/types/link';
import * as links_api from '@/lib/api/links';

function map_api_link(item: LinkItem): LinkItem {
  return {
    ...item,
    is_starred: item.favorite === 1,
  };
}

export async function get_links(
  options: {
    page?: number;
    limit?: number;
    tags?: string[];
    starred?: boolean;
    sort?: 'asc' | 'desc';
  } = {}
): Promise<LinksResponse> {
  const { page = 1, limit = 10, starred, sort = 'desc' } = options;

  const result = await links_api.get_links({
    page,
    page_size: limit,
    favorite: starred !== undefined ? (starred ? 1 : 0) : undefined,
  });

  let items = result.data.map(map_api_link);

  if (options.tags && options.tags.length > 0) {
    items = items.filter((link) =>
      options.tags!.every((t) => link.tags.includes(t))
    );
  }

  items.sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sort === 'desc' ? db - da : da - db;
  });

  return {
    links: items,
    page,
    has_more: result.page < result.total_pages,
  };
}

export async function get_links_meta(): Promise<LinksMeta> {
  const meta = await links_api.get_links_meta();
  if (meta.tags) {
    return { all_tags: meta.tags.map((t) => t.tag) };
  }
  return { all_tags: [] };
}

export async function get_link_by_id(id: string): Promise<LinkItem | null> {
  try {
    const link = await links_api.get_link_by_id(id);
    return map_api_link(link);
  } catch {
    return null;
  }
}

export async function get_starred_links(limit?: number): Promise<LinkItem[]> {
  const result = await links_api.get_links({ page: 1, page_size: 100, favorite: 1 });
  return result.data.map(map_api_link).slice(0, limit);
}
