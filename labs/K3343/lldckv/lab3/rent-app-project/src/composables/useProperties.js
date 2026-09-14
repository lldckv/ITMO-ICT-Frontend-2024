import { ref } from 'vue';
import { propertyApi } from '@/api';

export function useProperties() {
    const results = ref([]);
    const loading = ref(false);
    const error = ref(null);

    function sortResults(list, sortValue) {
        if (!sortValue) return list;
        const [field, order] = sortValue.split('_');
        return [...list].sort((a, b) => {
            const valA = Number(a[field]);
            const valB = Number(b[field]);
            return order === 'Asc' ? valA - valB : valB - valA;
        });
    }

    async function search(filters) {
        loading.value = true;
        error.value = null;
        try {
            const params = new URLSearchParams();
            if (filters.titleSearch) params.append('title_like', filters.titleSearch);
            if (filters.location) params.append('location_like', filters.location);
            if (filters.propertyType) params.append('propertyType', filters.propertyType);
            if (filters.minPrice) params.append('price_gte', filters.minPrice);
            if (filters.maxPrice) params.append('price_lte', filters.maxPrice);
            if (filters.rooms?.length) {
                filters.rooms.forEach((r) => params.append('roomCount', r));
            }

            const res = await propertyApi.search(params);
            results.value = sortResults(res.data, filters.sortBy);
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }

    return { results, loading, error, search };
}