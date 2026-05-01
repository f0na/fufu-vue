export interface SiteProfile {
  id: string;
  site_name: string;
  subtitle: string;
  logo_url: string;
  description: string;
  keywords: string;
  icp_beian: string;
  created_at: string;
  updated_at: string;
}

export interface SiteProfileUpdate {
  site_name?: string;
  subtitle?: string;
  logo_url?: string;
  description?: string;
  keywords?: string;
  icp_beian?: string;
}

export interface Footer {
  id: string;
  content: string;
  copyright_text: string;
  created_at: string;
  updated_at: string;
}

export interface FooterUpdate {
  content?: string;
  copyright_text?: string;
}

export interface FooterLink {
  id: string;
  name: string;
  url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FooterLinkCreate {
  name: string;
  url: string;
  sort_order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SocialLinkCreate {
  platform: string;
  label: string;
  url: string;
  icon?: string;
  sort_order: number;
}

export interface Announcement {
  id: string;
  content: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AnnouncementCreate {
  content: string;
  active: boolean;
  sort_order: number;
}
