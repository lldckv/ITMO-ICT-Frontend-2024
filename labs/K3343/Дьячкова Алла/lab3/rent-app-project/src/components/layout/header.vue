<template>
  <header class="p-3">
    <div class="container d-flex justify-content-between align-items-center">
      <h1 class="h4 mb-0">Сервис Аренды Недвижимости</h1>
      <nav>
        <ul class="nav align-items-center">
          <li class="nav-item">
            <router-link class="nav-link d-flex align-items-center gap-1" to="/search">
              <svg height="20" width="20" fill="currentColor"><use href="#search"></use></svg>
              Поиск недвижимости
            </router-link>
          </li>
          <template v-if="!auth.isLoggedIn">
            <li class="nav-item">
              <router-link class="nav-link d-flex align-items-center gap-1" to="/login">
                <svg height="20" width="20" fill="currentColor"><use href="#enter"></use></svg>
                Вход
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link d-flex align-items-center gap-1" to="/register">
                <svg height="20" width="20" fill="currentColor"><use href="#profile-reg"></use></svg>
                Регистрация
              </router-link>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link d-flex align-items-center gap-1" to="/user">
                <svg height="20" width="20" fill="currentColor"><use href="#profile"></use></svg>
                Личный кабинет
              </router-link>
            </li>
            <li class="nav-item">
              <button class="btn btn-link nav-link d-flex align-items-center gap-1" @click="handleLogout">
                <svg height="20" width="20" fill="currentColor"><use href="#exit"></use></svg>
                Выход
              </button>
            </li>
          </template>
          <li class="nav-item">
            <button
              class="theme-toggle ms-3"
              :aria-label="theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'"
              @click="toggleTheme"
            >
              {{ theme === 'dark' ? '☀️' : '🌙' }}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme';
import { useAuthStore } from '@/stores';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const { theme, toggleTheme } = useTheme();

function handleLogout() {
    auth.logout();
    router.push('/login');
}
</script>
