import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_URL } from '../constants/config';

export const api: AxiosInstance = axios.create({
  baseURL: API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     // Get token from localStorage if available (for client-side)
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('legendary_token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error);
//   }
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       // Handle unauthorized access (client-side only)
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('legendary_token');
//         window.location.href = '/signin';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
