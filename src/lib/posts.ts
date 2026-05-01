import type { Post, PostsResponse } from '@/lib/types/post';
import * as posts_api from '@/lib/api/posts';

function map_api_post(post: Post): Post {
  return {
    ...post,
    date: post.published_at || post.created_at?.split('T')[0],
    views: post.view_count,
    comments_count: 0,
    cover: '',
  };
}

function map_api_response(
  res: import('@/lib/types/api').PaginatedResponse<Post>
): PostsResponse {
  return {
    posts: res.data.map(map_api_post),
    page: res.page,
    has_more: res.page < res.total_pages,
  };
}

export function slug_from_filename(filename: string): string {
  return filename.replace(/\.mdx?$/, '');
}

export function generate_excerpt(content: string, length = 150): string {
  const content_without_fm = content.replace(/^---[\s\S]*?---/, '');
  const plain_text = content_without_fm
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain_text.length <= length) return plain_text;
  return plain_text.slice(0, length) + '...';
}

export async function get_posts(
  options: {
    page?: number;
    limit?: number;
    year?: string;
    tag?: string;
    tags?: string[];
  } = {}
): Promise<PostsResponse> {
  const { page = 1, limit = 10 } = options;

  const result = await posts_api.get_posts({
    page,
    page_size: limit,
    tag: options.tag,
    year: options.year,
  });

  return map_api_response(result);
}

export async function get_all_tags(): Promise<Record<string, number>> {
  const result = await posts_api.get_posts({ page: 1, page_size: 200 });
  const tag_counts: Record<string, number> = {};
  for (const post of result.data) {
    for (const tag of post.tags) {
      tag_counts[tag] = (tag_counts[tag] || 0) + 1;
    }
  }
  return tag_counts;
}

export async function get_all_years(): Promise<Record<string, number>> {
  const result = await posts_api.get_posts({ page: 1, page_size: 200 });
  const year_counts: Record<string, number> = {};
  for (const post of result.data) {
    const d = post.published_at || post.created_at;
    if (!d) continue;
    const year = d.split('-')[0];
    if (year) {
      year_counts[year] = (year_counts[year] || 0) + 1;
    }
  }
  return year_counts;
}

export async function get_post_by_slug(slug: string): Promise<Post | null> {
  try {
    const post = await posts_api.get_post_by_slug(slug);
    return map_api_post(post);
  } catch {
    return null;
  }
}

export async function get_post_content(slug: string): Promise<{ content: string } | null> {
  try {
    const post = await posts_api.get_post_by_slug(slug);
    if (post.content) return { content: post.content };
    return null;
  } catch {
    return null;
  }
}

export async function get_recommended_posts(
  current_post: Post,
  max_recommendations = 3
): Promise<Post[]> {
  if (!current_post.tags || current_post.tags.length === 0) return [];

  const result = await posts_api.get_posts({ page: 1, page_size: 200 });

  const posts_with_score = result.data
    .filter((post) => post.slug !== current_post.slug)
    .map((post) => {
      const matching_tags = post.tags.filter((tag) => current_post.tags.includes(tag));
      return { post, score: matching_tags.length };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const da = new Date(a.post.published_at || a.post.created_at).getTime();
      const db = new Date(b.post.published_at || b.post.created_at).getTime();
      return db - da;
    })
    .slice(0, max_recommendations)
    .map((item) => map_api_post(item.post));

  return posts_with_score;
}
