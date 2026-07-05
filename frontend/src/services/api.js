import axios from 'axios';
import { getToken, clearAuth } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const coTokenDangLuu = Boolean(getToken());

    if (error.response?.status === 401 && coTokenDangLuu) {
      const messageBackend = error.response?.data?.message;
      const messageHienThi =
        !messageBackend || messageBackend === 'Unauthenticated.'
          ? 'Tài khoản đã bị khóa hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          : messageBackend;

      clearAuth();

      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: {
            message: messageHienThi,
          },
        })
      );
    }
    return Promise.reject(error);
  }
);

export default api;
