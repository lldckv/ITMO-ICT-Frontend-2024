import { ref } from 'vue';
import { userApi } from '@/api';
import { useAuthStore } from '@/stores';

export function useMessages(propertyId) {
    const auth = useAuthStore();
    const messages = ref([]);
    const loading = ref(false);

    async function load() {
        loading.value = true;
        try {
            const res = await userApi.get(auth.userId);
            messages.value = (res.data.messages || []).filter(
                (m) => String(m.propertyId) === String(propertyId)
            );
        } finally {
            loading.value = false;
        }
    }

    async function send(text) {
        const res = await userApi.get(auth.userId);
        const existing = res.data.messages || [];
        const newMessage = {
            propertyId,
            content: text,
            timestamp: new Date().toISOString(),
            sender: auth.userId
        };
        await userApi.patch(auth.userId, { messages: [...existing, newMessage] });
        await load();
    }

    return { messages, loading, load, send };
}