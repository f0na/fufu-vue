import matter from 'gray-matter'
import type { Post, PostsResponse } from '@/lib/types/post'

/**
 * 获取所有文章
 */
async function fetch_all_posts(): Promise<Post[]> {
  try {
    const res = await fetch('/content/posts/_index.json')
    if (!res.ok) return []
    return await res.json()
  } catch {
    // fallback: 手动列出文章
    return []
  }
}

/**
 * 从文件名获取 slug
 */
function slug_from_filename(filename: string): string {
  return filename.replace(/\.mdx?$/, '')
}

/**
 * 从内容生成摘要
 */
function generate_excerpt(content: string, length = 150): string {
  const content_without_fm = content.replace(/^---[\s\S]*?---/, '')
  const plain_text = content_without_fm
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain_text.length <= length) return plain_text
  return plain_text.slice(0, length) + '...'
}

/**
 * 获取文章列表（支持分页和筛选）
 */
export async function get_posts(options: {
  page?: number
  limit?: number
  year?: string
  tag?: string
  tags?: string[]
  sort?: 'asc' | 'desc'
} = {}): Promise<PostsResponse> {
  const {
    page = 1,
    limit = 10,
    year,
    tag,
    tags,
    sort = 'desc',
  } = options

  const posts = await fetch_all_posts()

  let filtered = posts

  if (year) {
    filtered = filtered.filter((post) => post.date.startsWith(year))
  }
  if (tag) {
    filtered = filtered.filter((post) => post.tags.includes(tag))
  }
  if (tags && tags.length > 0) {
    filtered = filtered.filter((post) => tags.every((t) => post.tags.includes(t)))
  }

  filtered.sort((a, b) => {
    const date_a = new Date(a.date).getTime()
    const date_b = new Date(b.date).getTime()
    return sort === 'desc' ? date_b - date_a : date_a - date_b
  })

  const start_index = (page - 1) * limit
  const end_index = start_index + limit
  const paginated_posts = filtered.slice(start_index, end_index)
  const has_more = end_index < filtered.length

  return { posts: paginated_posts, page, has_more }
}

/**
 * 获取所有标签及其文章数量
 */
export async function get_all_tags(): Promise<Record<string, number>> {
  const posts = await fetch_all_posts()
  const tag_counts: Record<string, number> = {}
  for (const post of posts) {
    for (const tag of post.tags) {
      tag_counts[tag] = (tag_counts[tag] || 0) + 1
    }
  }
  return tag_counts
}

/**
 * 获取所有年份及其文章数量
 */
export async function get_all_years(): Promise<Record<string, number>> {
  const posts = await fetch_all_posts()
  const year_counts: Record<string, number> = {}
  for (const post of posts) {
    if (!post.date) continue
    const year = post.date.split('-')[0]
    if (year) {
      year_counts[year] = (year_counts[year] || 0) + 1
    }
  }
  return year_counts
}

/**
 * 根据 slug 获取单篇文章
 */
export async function get_post_by_slug(slug: string): Promise<Post | null> {
  const posts = await fetch_all_posts()
  return posts.find((post) => post.slug === slug) || null
}

/**
 * 获取文章完整内容
 */
export async function get_post_content(slug: string): Promise<{ content: string } | null> {
  try {
    const res = await fetch(`/content/posts/${slug}.md`)
    if (!res.ok) return null
    const text = await res.text()
    const { content } = matter(text)
    return { content }
  } catch {
    return null
  }
}

/**
 * 获取推荐文章（基于标签匹配）
 */
export async function get_recommended_posts(
  current_post: Post,
  max_recommendations = 3
): Promise<Post[]> {
  if (!current_post.tags || current_post.tags.length === 0) return []

  const all_posts = await fetch_all_posts()

  const posts_with_score = all_posts
    .filter((post) => post.slug !== current_post.slug)
    .map((post) => {
      const matching_tags = post.tags.filter((tag) => current_post.tags.includes(tag))
      return { post, score: matching_tags.length }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
    })
    .slice(0, max_recommendations)
    .map((item) => item.post)

  return posts_with_score
}
