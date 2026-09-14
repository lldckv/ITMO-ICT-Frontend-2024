<template>
  <section class="form-container mx-auto" style="max-width: 300px;">
    <h1 class="text-center">Вход</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group mt-3">
        <label for="email">Email</label>
        <input v-model="email" type="email" class="form-control" id="email" required>
      </div>
      <div class="form-group mt-3">
        <label for="password">Пароль</label>
        <input v-model="password" type="password" class="form-control" id="password" required>
      </div>
      <button type="submit" class="btn btn-primary btn-block mt-3 w-100">Войти</button>
      <router-link to="/register" class="btn btn-custom-secondary btn-block mt-2 w-100">Регистрация</router-link>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores';

const email = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function handleLogin() {
    try {
        await auth.login(email.value, password.value);
        router.push(route.query.redirect || '/user');
    } catch (err) {
        alert(err.response?.data?.error || 'Login failed');
    }
}
</script>