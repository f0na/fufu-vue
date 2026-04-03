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
            ],
        },
        { path: '/gallery/:id', name: 'gallery', component: () => import('@/views/GalleryView.vue') },
    ],
})

export default router
