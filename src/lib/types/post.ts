export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  tags: string[];
  status: 'draft' | 'published';
  view_count: number;
  github_discussion_number?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  // Legacy fields kept for backward compatibility
  date?: string;
  cover?: string;
  views?: number;
  likes?: number;
  comments_count?: number;
}

export interface PostCreate {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  cover?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  github_discussion_number?: number;
}

export interface PostUpdate {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  cover?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  published_at?: string;
  github_discussion_number?: number;
}

// Legacy type for backward compatibility with existing pages
export interface LegacyPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  cover?: string;
  excerpt?: string;
  content?: string;
  views?: number;
  likes?: number;
  comments_count?: number;
}

export interface PostsResponse {
  posts: Post[];
  page: number;
  has_more: boolean;
}

export interface LegacyPostsResponse {
  posts: LegacyPost[];
  page: number;
  has_more: boolean;
}
