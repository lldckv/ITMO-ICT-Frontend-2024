import { ref } from 'vue';
import { userApi, propertyApi, bookingApi } from '@/api';
import { useAuthStore } from '@/stores';

export function useUserProfile() {
    const auth = useAuthStore();
    const profile = ref(null);
    const rentals = ref([]); // enriched with property titles
    const dialogs = ref([]); // enriched with property titles
    const loading = ref(true);

    async function load() {
        loading.value = true;
        const res = await userApi.get(auth.userId);
        profile.value = res.data;

        const rentalHistory = [...(res.data.rentalHistory || [])]
            .sort((a, b) => new Date(a.startOfRent) - new Date(b.startOfRent));

        rentals.value = await Promise.all(
            rentalHistory.map(async (r) => {
                const p = await propertyApi.get(r.propertyId);
                return { ...r, propertyTitle: p.data.title };
            })
        );

        const messages = res.data.messages || [];
        const byProperty = {};
        messages.forEach((m) => {
            if (!byProperty[m.propertyId]) byProperty[m.propertyId] = [];
            byProperty[m.propertyId].push(m);
        });

        dialogs.value = await Promise.all(
            Object.keys(byProperty).map(async (propertyId) => {
                const p = await propertyApi.get(propertyId);
                return { propertyId, propertyTitle: p.data.title };
            })
        );

        loading.value = false;
    }

    async function updateInfo(data) {
        await userApi.patch(auth.userId, data);
        await load();
    }

    async function updatePassword(newPassword) {
        await userApi.patch(auth.userId, { password: newPassword });
    }

    async function deleteBooking(bookingId) {
        await bookingApi.remove(bookingId, auth.userId);
        rentals.value = rentals.value.filter((r) => r.id !== bookingId);
    }

    load();

    return { profile, rentals, dialogs, loading, load, updateInfo, updatePassword, deleteBooking };
}