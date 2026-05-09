import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptador: Pega o JWT do Cookie e injeta na requisição
api.interceptors.request.use((config) => {
    const token = Cookies.get('accessToken');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});