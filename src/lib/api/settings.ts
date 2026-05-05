import { api } from '@/lib/api-client';
import type {
  SiteProfile,
  SiteProfileUpdate,
  Footer,
  FooterUpdate,
  FooterLink,
  FooterLinkCreate,
  SocialLink,
  SocialLinkCreate,
  Announcement,
  AnnouncementCreate,
} from '@/lib/types/settings';
import { CACHE_TTL } from '@/lib/request-cache';

export function get_profile() {
  return api.get<{ data: SiteProfile }>('/api/settings/profile', undefined, CACHE_TTL);
}

export function update_profile(data: SiteProfileUpdate) {
  return api.put<{ data: SiteProfile }>('/api/settings/profile', data);
}

export function get_footer() {
  return api.get<{ data: Footer }>('/api/settings/footer', undefined, CACHE_TTL);
}

export function update_footer(data: FooterUpdate) {
  return api.put<{ data: Footer }>('/api/settings/footer', data);
}

export function get_footer_links() {
  return api.get<FooterLink[]>('/api/settings/footer-links', undefined, CACHE_TTL);
}

export function create_footer_link(data: FooterLinkCreate) {
  return api.post<FooterLink>('/api/settings/footer-links', data);
}

export function update_footer_link(id: string, data: FooterLinkCreate) {
  return api.put<FooterLink>(`/api/settings/footer-links/${id}`, data);
}

export function delete_footer_link(id: string) {
  return api.delete(`/api/settings/footer-links/${id}`);
}

export function get_social_links() {
  return api.get<SocialLink[]>('/api/settings/social-links', undefined, CACHE_TTL);
}

export function create_social_link(data: SocialLinkCreate) {
  return api.post<SocialLink>('/api/settings/social-links', data);
}

export function update_social_link(id: string, data: SocialLinkCreate) {
  return api.put<SocialLink>(`/api/settings/social-links/${id}`, data);
}

export function delete_social_link(id: string) {
  return api.delete(`/api/settings/social-links/${id}`);
}

export function get_announcements() {
  return api.get<Announcement[]>('/api/settings/announcements', undefined, CACHE_TTL);
}

export function create_announcement(data: AnnouncementCreate) {
  return api.post<Announcement>('/api/settings/announcements', data);
}

export function update_announcement(id: string, data: AnnouncementCreate) {
  return api.put<Announcement>(`/api/settings/announcements/${id}`, data);
}

export function delete_announcement(id: string) {
  return api.delete(`/api/settings/announcements/${id}`);
}
