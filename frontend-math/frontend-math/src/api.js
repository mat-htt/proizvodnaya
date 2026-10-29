// src/api.js
import axios from 'axios';

// По умолчанию бэкенд ищем на том же компьютере, что и сайт: так сайт работает
// и с localhost, и с телефонов по IP в локальной сети (режим конференции)
export const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8000/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Автоматически добавляем токен
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Авто-обновление токена при 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;