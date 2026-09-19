import { ref } from 'vue';
import { propertyApi, bookingApi, authApi } from '@/api';
import { useAuthStore } from '@/stores';

export function useProperty(propertyId) {
    const auth = useAuthStore();
    const property = ref(null);
    const loading = ref(true);
    const error = ref(null);

    async function load() {
        loading.value = true;
        try {
            const res = await propertyApi.get(propertyId);
            property.value = res.data;
        } catch (err) {
            error.value = 'Объект не найден';
        } finally {
            loading.value = false;
        }
    }

    async function book(startDate, endDate) {
        const payload = {
            userId: Number(auth.userId),
            propertyId,
            start_date: startDate,
            end_date: endDate,
            timestamp: new Date().toISOString()
        };
        const res = await bookingApi.create(payload);
        return res.data;
    }

    async function loginInline(email, password) {
        const res = await authApi.login(email, password);
        auth.login && auth.login; // placeholder no-op to keep lint happy
        return res.data;
    }

    load();

    return { property, loading, error, load, book };
}