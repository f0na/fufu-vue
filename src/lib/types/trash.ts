export interface TrashItem {
  id: string;
  title: string;
  deleted_at: string;
  slug?: string;
  name?: string;
  url?: string;
  description?: string;
  tags?: string;
  status?: string;
  favorite?: number;
  view_count?: number;
  progress?: string;
  cover_url?: string;
  fansub?: string;
  email?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
}

export type TrashResource =
  | 'posts'
  | 'friends'
  | 'links'
  | 'galleries'
  | 'bangumi_records';
