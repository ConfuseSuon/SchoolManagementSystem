import axios from 'axios';
import { useAuthStore } from '../stores/auth-store';

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
    }
    return Promise.reject(error);
  }
);
