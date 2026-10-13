import axios from 'axios';
import { API_BASE } from '../constants';
import { getToken, getRefreshToken, setToken, removeToken } from '../auth';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Auth and Tenant headers
api.interceptors.request.use((config) => {
  const token = getToken();
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }

  return config;
});

let refreshInFlight: Promise<void> | null = null;

// Response interceptor for handling errors and refreshing tokens
api.interceptors.response.use(
  (response) => {
    // Wrap response data if it's already in { status, message, error, data } format
    // as per project requirements for APIs.
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !/\/auth\/(login|register|refresh|forgot-password|reset-password|verify-email)(?:$|\?)/.test(
        originalRequest.url ?? '',
      )
    ) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          if (!refreshInFlight) {
            refreshInFlight = (async () => {
              const tenantId =
                typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;
              const response = await axios.post(
                `${api.defaults.baseURL}/auth/refresh`,
                { refreshToken },
                tenantId ? { headers: { 'x-tenant-id': tenantId } } : undefined,
              );
              const tokenData = response.data.data ?? response.data;
              if (!tokenData.accessToken || !tokenData.refreshToken)
                throw new Error('Invalid refresh response');
              setToken(tokenData.accessToken, tokenData.refreshToken);
            })().finally(() => {
              refreshInFlight = null;
            });
          }
          await refreshInFlight;

          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          if (typeof window !== 'undefined') {
            removeToken();
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
      }
    }

    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/403';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default api;
