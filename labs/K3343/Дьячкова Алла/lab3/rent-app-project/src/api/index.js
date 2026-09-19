import instance from './instance';

export const authApi = {
    login(email, password) {
        return instance.post('/login', { email, password });
    },
    register(payload) {
        return instance.post('/register', payload);
    }
};

export const userApi = {
    get(id) {
        return instance.get(`/users/${id}`);
    },
    patch(id, data) {
        return instance.patch(`/users/${id}`, data);
    }
};

export const propertyApi = {
    search(params) {
        return instance.get(`/properties?${params.toString()}`);
    },
    get(id) {
        return instance.get(`/properties/${id}`);
    }
};

export const bookingApi = {
    create(payload) {
        return instance.post('/book', payload);
    },
    remove(bookingId, userId) {
        return instance.delete(`/book/${bookingId}?userId=${userId}`);
    }
};