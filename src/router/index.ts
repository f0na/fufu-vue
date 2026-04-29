import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Entrance', component: () => import('@/pages/EntrancePage.vue') },
  { path: '/home', name: 'Home', component: () => import('@/pages/HomePage.vue') },
  { path: '/archive', name: 'Archive', component: () => import('@/pages/ArchivePage.vue') },
  {
    path: '/posts/:slug',
    name: 'PostDetail',
    component: () => import('@/pages/PostDetailPage.vue'),
  },
  { path: '/links', name: 'Links', component: () => import('@/pages/LinksPage.vue') },
  { path: '/anime', name: 'Anime', component: () => import('@/pages/AnimePage.vue') },
  {
    path: '/anime/:id',
    name: 'AnimeDetail',
    component: () => import('@/pages/AnimeDetailPage.vue'),
  },
  { path: '/gallery', name: 'Gallery', component: () => import('@/pages/GalleryPage.vue') },
  {
    path: '/gallery/:id',
    name: 'GalleryDetail',
    component: () => import('@/pages/GalleryDetailPage.vue'),
  },
  { path: '/friends', name: 'Friends', component: () => import('@/pages/FriendsPage.vue') },
  { path: '/status', name: 'Status', component: () => import('@/pages/StatusPage.vue') },
  { path: '/license', name: 'License', component: () => import('@/pages/LicensePage.vue') },
  { path: '/privacy', name: 'Privacy', component: () => import('@/pages/PrivacyPage.vue') },
  {
    path: '/placeholder',
    name: 'Placeholder',
    component: () => import('@/pages/PlaceholderPage.vue'),
  },
  {
    path: '/admin',
    component: () => import('@/admin/layouts/admin-layout.vue'),
    children: [
      { path: '', redirect: '/admin/dashboard' },
      {
        path: 'dashboard',
        name: 'admin.dashboard',
        component: () => import('@/admin/pages/dashboard.vue'),
      },
      {
        path: 'posts',
        name: 'admin.posts',
        component: () => import('@/admin/pages/post-list.vue'),
      },
      {
        path: 'posts/new',
        name: 'admin.posts.new',
        component: () => import('@/admin/pages/post-editor.vue'),
      },
      {
        path: 'posts/:slug/edit',
        name: 'admin.posts.edit',
        component: () => import('@/admin/pages/post-editor.vue'),
      },
      {
        path: 'links',
        name: 'admin.links',
        component: () => import('@/admin/pages/links.vue'),
      },
      {
        path: 'friends',
        name: 'admin.friends',
        component: () => import('@/admin/pages/placeholder.vue'),
      },
      {
        path: 'gallery',
        name: 'admin.gallery',
        component: () => import('@/admin/pages/placeholder.vue'),
      },
      {
        path: 'settings',
        name: 'admin.settings',
        component: () => import('@/admin/pages/placeholder.vue'),
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];
