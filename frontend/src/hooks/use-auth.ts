import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, AuthResponse } from '../services/auth.service';

interface AuthState {
  user: any | null;
  tenant: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  mfaPendingEmail?: string | null;
  mfaPendingPassword?: string | null;

  setAuth: (response: AuthResponse) => void;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      mfaPendingEmail: null,
      mfaPendingPassword: null,

      setAuth: (response: AuthResponse) => {
        set({
          user: response.user,
          tenant: response.tenant || null,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          error: null,
          mfaPendingEmail: null,
          mfaPendingPassword: null,
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
          document.cookie = `access_token=${response.accessToken}; path=/; max-age=86400; samesite=strict`;
          if (response.tenant?.id) {
            localStorage.setItem('tenant_id', response.tenant.id);
            document.cookie = `tenant_id=${response.tenant.id}; path=/; max-age=86400; samesite=strict`;
          }
        }
      },

      login: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(data);
          const authData = (response as any).data;
          set({
            user: authData.user,
            tenant: authData.tenant || null,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            mfaPendingEmail: null,
            mfaPendingPassword: null,
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', authData.accessToken);
            localStorage.setItem('refresh_token', authData.refreshToken);
            document.cookie = `access_token=${authData.accessToken}; path=/; max-age=86400; samesite=strict`;
            if (authData.tenant?.id) {
              localStorage.setItem('tenant_id', authData.tenant.id);
              document.cookie = `tenant_id=${authData.tenant.id}; path=/; max-age=86400; samesite=strict`;
            }
          }
        } catch (error: any) {
          const message = error.response?.data?.message;
          if (message === 'MFA code required') {
            set({ 
              mfaPendingEmail: data.email, 
              mfaPendingPassword: data.password,
              isLoading: false 
            });
            window.location.href = '/mfa';
            return;
          }
          set({ 
            error: message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          const authData = (response as any).data;
          set({
            user: authData.user,
            tenant: authData.tenant || null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          const { clearAuth } = get();
          clearAuth();
        }
      },

      clearAuth: () => {
        set({
          user: null,
          tenant: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          mfaPendingEmail: null,
          mfaPendingPassword: null,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('tenant_id');
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'tenant_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        mfaPendingEmail: state.mfaPendingEmail,
        mfaPendingPassword: state.mfaPendingPassword,
      }),
    }
  )
);
