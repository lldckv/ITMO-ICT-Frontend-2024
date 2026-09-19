<template>
  <main class="container mt-5 d-flex justify-content-center">
  <section class="form-container-register mx-auto">
    <h2 class="text-center">Регистрация</h2>
    <form id="registrationForm" @submit.prevent="handleRegister">
      <div class="form-group mt-3">
        <label for="firstName">Имя</label>
        <input v-model="form.firstName" class="form-control" id="firstName" required>
      </div>
      <div class="form-group mt-3">
        <label for="lastName">Фамилия</label>
        <input v-model="form.lastName" class="form-control" id="lastName" required>
      </div>
      <div class="form-group mt-3">
        <label for="email">Email</label>
        <input v-model="form.email" type="email" class="form-control" id="email" required>
      </div>
      <div class="form-group mt-3">
        <label for="phone">Телефон</label>
        <input v-model="form.phone" type="tel" pattern="[0-9]{10}" class="form-control" id="phone" required>
      </div>
      <div class="form-group mt-3">
        <label for="password">Пароль</label>
        <input v-model="form.password" type="password" class="form-control" id="password" required>
      </div>
      <div class="form-group mt-3">
        <label for="confirmPassword">Подтверждение пароля</label>
        <input v-model="confirmPassword" type="password" class="form-control" id="confirmPassword" required>
      </div>
      <div class="form-group mt-3">
        <label for="dob">Дата рождения</label>
        <input v-model="form.dob" type="date" class="form-control" id="dob" :max="maxDate" required>
      </div>
      <button type="submit" class="btn btn-primary btn-block mt-3 w-100">Зарегистрироваться</button>
      <router-link to="/login" class="btn btn-custom-secondary btn-block mt-3 w-100 text-center d-block">
        Уже есть аккаунт? Войти
      </router-link>
    </form>
  </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const auth = useAuthStore();
const router = useRouter();
const confirmPassword = ref('');
const maxDate = new Date().toISOString().split('T')[0];

const form = reactive({
    firstName: '', lastName: '', email: '', phone: '', password: '', dob: ''
});

async function handleRegister() {
    if (!/^\d{10}$/.test(form.phone)) return alert('Введите 10 цифр телефона.');
    if (form.password.length < 8) return alert('Пароль должен быть не менее 8 символов.');
    if (form.password !== confirmPassword.value) return alert('Пароли не совпадают.');

    try {
        await auth.register({ ...form, rentalHistory: [], messages: [] });
        router.push('/user');
    } catch (err) {
        alert(err.response?.data?.error || 'Registration failed');
    }
}
</script>