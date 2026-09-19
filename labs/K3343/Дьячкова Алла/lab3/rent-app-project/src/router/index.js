import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores';

const routes = [
  { path: '/', redirect: '/search' },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { title: 'Вход' } },
  { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { title: 'Регистрация' } },
  { path: '/search', name: 'search', component: () => import('@/views/SearchView.vue'), meta: { title: 'Поиск недвижимости' } },
  { path: '/property/:id', name: 'property', component: () => import('@/views/PropertyView.vue'), props: true, meta: { title: 'Объект недвижимости' } },
  {
    path: '/messages/:propertyId',
    name: 'messages',
    component: () => import('@/views/MessagesView.vue'),
    props: true,
    meta: { requiresAuth: true, title: 'Сообщения' }
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/views/UserView.vue'),
    meta: { requiresAuth: true, title: 'Личный кабинет' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  document.title = to.meta.title ? `${to.meta.title} — Аренда недвижимости` : 'Аренда недвижимости';
});

export default router;