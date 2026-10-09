import axios from 'axios';
import { clearToken, getToken } from '../utils/storage';

// Production: set VITE_API_URL in Vercel (e.g. https://your-api.onrender.com/api).
// Development: falls back to /api, which Vite proxies to the local Express server.
const baseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({ baseURL, timeout: 70000 }); // generous: free-tier ML hosts can cold-start

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isCredentialCall = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/change-password') || url.includes('/auth/me') && error.config?.method === 'delete';
    if (error.response?.status === 401 && !isCredentialCall) {
      clearToken();
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
