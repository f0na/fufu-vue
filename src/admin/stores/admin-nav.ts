export interface AdminNavItem {
  label: string;
  key: string;
  href: string;
  icon: string;
}

export const admin_nav_items: AdminNavItem[] = [
  { label: '仪表盘', key: 'dashboard', href: '/admin/dashboard', icon: 'lucide:layout-dashboard' },
  { label: '文章', key: 'posts', href: '/admin/posts', icon: 'lucide:file-text' },
  { label: '链接', key: 'links', href: '/admin/links', icon: 'lucide:link' },
  { label: '友人帐', key: 'friends', href: '/admin/friends', icon: 'lucide:users' },
  { label: '相册', key: 'gallery', href: '/admin/gallery', icon: 'lucide:image' },
  { label: '垃圾桶', key: 'trash', href: '/admin/trash', icon: 'lucide:trash-2' },
  { label: '设置', key: 'settings', href: '/admin/settings', icon: 'lucide:settings' },
];
