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

    const messageBackend = error.response?.data?.message;
    const laTaiKhoanBiKhoa =
      error.response?.status === 403 &&
      error.response?.data?.code === 'TAI_KHOAN_BI_KHOA' &&
      coTokenDangLuu;

    if (laTaiKhoanBiKhoa) {
      clearAuth();

      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: {
            message:
              messageBackend ||
              'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
          },
        })
      );
    }

    if (error.response?.status === 401 && coTokenDangLuu) {
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
