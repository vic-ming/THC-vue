import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'launch',
            component: () => import('../views/LaunchView.vue')
        },
        {
            path: '/home',
            name: 'home',
            component: () => import('../views/HomeView.vue')
        },
        {
            path: '/filter',
            name: 'filter',
            component: () => import('../views/FilterView.vue')
        },
        {
            path: '/detail',
            name: 'detail',
            component: () => import('../views/DetailView.vue')
        }
    ]
})

export default router
