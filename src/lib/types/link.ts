export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags: string[];
  favorite: number;
  is_starred?: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LinkCreate {
  title: string;
  url: string;
  description?: string;
  favicon_url?: string;
  tags?: string[];
  favorite?: number;
  sort_order?: number;
}

export interface LinkUpdate {
  title?: string;
  url?: string;
  description?: string;
  favicon_url?: string;
  tags?: string[];
  favorite?: number;
  sort_order?: number;
}

export interface LinksResponse {
  links: LinkItem[];
  page: number;
  has_more: boolean;
}

export interface LinksMeta {
  all_tags: string[];
  tags?: Array<{ tag: string; count: number }>;
}
