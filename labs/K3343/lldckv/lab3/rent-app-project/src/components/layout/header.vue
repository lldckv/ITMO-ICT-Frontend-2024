<template>
  <header class="bg-light p-3">
    <div class="container d-flex justify-content-between align-items-center">
      <h1 class="h4 mb-0">Сервис Аренды Недвижимости</h1>
      <nav>
        <ul class="nav">
          <li class="nav-item">
            <router-link class="nav-link" to="/search"><svg height="25" width="25" fill="currentColor" style="color: #333;"><use href="/assets.svg#search"></use></svg>Поиск недвижимости</router-link>
          </li>
          <template v-if="!auth.isLoggedIn">
            <li class="nav-item">
              <router-link class="nav-link" to="/login"><svg height="25" width="25"><use href="/assets.svg#profile"></use></svg>Вход</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register"><svg><use href="/assets.svg#profile-reg"></use></svg>Регистрация</router-link>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/user"><svg height="25" width="25" fill="currentColor" style="color: #333;"><use href="/assets.svg#profile"></use></svg>
                Личный кабинет</router-link>
            </li>
            <li class="nav-item">
              <button class="btn btn-link nav-link" @click="handleLogout"><svg height="25" width="25"><use href="/assets.svg#exit"></use></svg>Выход</button>
            </li>
          </template>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
    auth.logout();
    router.push('/login');
}
</script>