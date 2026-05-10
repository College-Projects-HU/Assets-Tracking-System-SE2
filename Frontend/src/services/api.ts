import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Points to Spring Cloud Gateway
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const user = useAuthStore.getState().user;
    const token = user?.accessToken || user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || '');
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/refresh');
    if (error.response?.status === 401 && !isAuthRequest) {
      useAuthStore.getState().logout();
      // Let Protected routes redirect to /login through React Router,
      // avoiding hard reload side-effects on SPA routes.
    }
    return Promise.reject(error);
  }
);

export default api;
