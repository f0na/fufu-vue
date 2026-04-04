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
                { path: '', name: 'home-content', component: () => import('@/components/home/WelcomeSection.vue') },
                { path: 'gallery', name: 'gallery-list', component: () => import('@/components/home/GallerySection.vue') },
                { path: 'login', name: 'login', component: () => import('@/components/admin/LoginPage.vue') },
                { path: 'register', name: 'register', component: () => import('@/components/admin/RegisterPage.vue') },
                { path: 'github-callback', name: 'github-callback', component: () => import('@/components/admin/GitHubCallbackPage.vue') },
                { path: '2fa', name: '2fa', component: () => import('@/components/admin/TwoFactorPage.vue') },
                { path: 'reset-password', name: 'reset-password', component: () => import('@/components/admin/ResetPasswordPage.vue') },
            ],
        },
        { path: '/gallery/:id', name: 'gallery', component: () => import('@/views/GalleryView.vue') },
    ],
})

export default router
