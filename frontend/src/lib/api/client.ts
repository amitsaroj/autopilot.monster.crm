import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Auth and Tenant headers
api.interceptors.request.use((config) => {
  const extractCookie = (name: string) => {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };
  
  const token = extractCookie('access_token');
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }

  return config;
});

// Response interceptor for handling errors and refreshing tokens
api.interceptors.response.use(
  (response) => {
    // Wrap response data if it's already in { status, message, error, data } format
    // as per project requirements for APIs.
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const extractCookie = (name: string) => {
        if (typeof window === 'undefined') return null;
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      
      const refreshToken = extractCookie('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data.data;

          document.cookie = `access_token=${accessToken}; path=/; max-age=86400; samesite=strict; secure`;
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          if (typeof window !== 'undefined') {
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
            document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure';
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
  }
);

export default api;
