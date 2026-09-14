// import { persist } from 'pinia-persists'
// import { createPinia } from 'pinia'


// const pinia = createPinia()


// pinia.use(persist())


// export default pinia
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, userApi } from '@/api';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null);
    const userId = ref(localStorage.getItem('loggedInUserId') || null);
    const user = ref(null);

    const isLoggedIn = computed(() =>
        Boolean(token.value && userId.value && userId.value !== 'undefined')
    );

    function setSession(data) {
        token.value = data.accessToken;
        userId.value = data.user.id;
        user.value = data.user;
        localStorage.setItem('token', token.value);
        localStorage.setItem('loggedInUserId', userId.value);
    }

    async function login(email, password) {
        const res = await authApi.login(email, password);
        setSession(res.data);
    }

    async function register(payload) {
        const res = await authApi.register(payload);
        setSession(res.data);
    }

    async function fetchCurrentUser() {
        if (!userId.value) return null;
        const res = await userApi.get(userId.value);
        user.value = res.data;
        return res.data;
    }

    function logout() {
        token.value = null;
        userId.value = null;
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUserId');
    }

    return { token, userId, user, isLoggedIn, login, register, fetchCurrentUser, logout };
});