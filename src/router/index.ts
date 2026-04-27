import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Entrance', component: () => import('@/pages/EntrancePage.vue') },
  { path: '/home', name: 'Home', component: () => import('@/pages/HomePage.vue') },
  { path: '/archive', name: 'Archive', component: () => import('@/pages/ArchivePage.vue') },
  { path: '/posts/:slug', name: 'PostDetail', component: () => import('@/pages/PostDetailPage.vue') },
  { path: '/links', name: 'Links', component: () => import('@/pages/LinksPage.vue') },
  { path: '/anime', name: 'Anime', component: () => import('@/pages/AnimePage.vue') },
  { path: '/anime/:id', name: 'AnimeDetail', component: () => import('@/pages/AnimeDetailPage.vue') },
  { path: '/gallery', name: 'Gallery', component: () => import('@/pages/GalleryPage.vue') },
  { path: '/gallery/:id', name: 'GalleryDetail', component: () => import('@/pages/GalleryDetailPage.vue') },
  { path: '/friends', name: 'Friends', component: () => import('@/pages/FriendsPage.vue') },
  { path: '/status', name: 'Status', component: () => import('@/pages/StatusPage.vue') },
  { path: '/placeholder', name: 'Placeholder', component: () => import('@/pages/PlaceholderPage.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]
