import axios from 'axios';
import { useAuthStore } from '../stores/auth-store';
import { useUiStore } from '../stores/ui-store';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
    const cleanData = { ...config.data };
    Object.keys(cleanData).forEach((key) => {
      if (cleanData[key] === '' || cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });
    config.data = cleanData;
  }
  return config;
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    } else {
      const msg = error.response?.data?.message || error.message || 'An unexpected error occurred';
      useUiStore.getState().showToast(msg, 'error');
    }
    return Promise.reject(error);
  }
);

