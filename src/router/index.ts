import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'entrance', component: () => import('@/views/EntranceView.vue') },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      children: [
        {
          path: '',
          name: 'home-content',
          component: () => import('@/components/home/WelcomeSection.vue'),
        },
        {
          path: 'gallery',
          name: 'gallery-list',
          component: () => import('@/components/home/GallerySection.vue'),
        },
        {
          path: 'gallery/add',
          name: 'gallery-add',
          component: () => import('@/components/gallery/GalleryEditPage.vue'),
        },
        {
          path: 'gallery/:id/edit',
          name: 'gallery-edit',
          component: () => import('@/components/gallery/GalleryEditPage.vue'),
        },
        {
          path: 'bangumi',
          name: 'bangumi',
          component: () => import('@/components/bangumi/BangumiSection.vue'),
        },
        {
          path: 'bangumi/add',
          name: 'bangumi-add',
          component: () => import('@/components/bangumi/BangumiEditPage.vue'),
        },
        {
          path: 'bangumi/:id/edit',
          name: 'bangumi-edit',
          component: () => import('@/components/bangumi/BangumiEditPage.vue'),
        },
        {
          path: 'bangumi/:id',
          name: 'bangumi-detail',
          component: () => import('@/components/bangumi/BangumiDetail.vue'),
        },
        {
          path: 'links',
          name: 'links',
          component: () => import('@/components/links/LinksSection.vue'),
        },
        {
          path: 'links/add',
          name: 'links-add',
          component: () => import('@/components/links/LinksEditPage.vue'),
        },
        {
          path: 'links/:id/edit',
          name: 'links-edit',
          component: () => import('@/components/links/LinksEditPage.vue'),
        },
        {
          path: 'friends',
          name: 'friends',
          component: () => import('@/components/friends/FriendsSection.vue'),
        },
        {
          path: 'friends/add',
          name: 'friends-add',
          component: () => import('@/components/friends/FriendsEditPage.vue'),
        },
        {
          path: 'friends/:id/edit',
          name: 'friends-edit',
          component: () => import('@/components/friends/FriendsEditPage.vue'),
        },
        {
          path: 'friends/approve',
          name: 'friends-approve',
          component: () => import('@/components/friends/FriendsApprovePage.vue'),
        },
        {
          path: 'posts',
          name: 'posts',
          component: () => import('@/components/post/PostSection.vue'),
        },
        {
          path: 'posts/add',
          name: 'posts-add',
          component: () => import('@/components/post/PostEditPage.vue'),
        },
        {
          path: 'posts/:id/edit',
          name: 'posts-edit',
          component: () => import('@/components/post/PostEditPage.vue'),
        },
        {
          path: 'posts/:id',
          name: 'posts-detail',
          component: () => import('@/components/post/PostDetail.vue'),
        },
        {
          path: 'archive',
          name: 'archive',
          component: () => import('@/components/post/ArchiveSection.vue'),
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('@/components/admin/AdminPage.vue'),
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/components/admin/LoginPage.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/components/admin/RegisterPage.vue'),
        },
        {
          path: 'github-callback',
          name: 'github-callback',
          component: () => import('@/components/admin/GitHubCallbackPage.vue'),
        },
        {
          path: '2fa',
          name: '2fa',
          component: () => import('@/components/admin/TwoFactorPage.vue'),
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/components/admin/ResetPasswordPage.vue'),
        },
        {
          path: 'markdown-demo',
          name: 'markdown-demo',
          component: () => import('@/views/MarkdownDemo.vue'),
        },
      ],
    },
    { path: '/gallery/:id', name: 'gallery', component: () => import('@/views/GalleryView.vue') },
  ],
})

export default router
