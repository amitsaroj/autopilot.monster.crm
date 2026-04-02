import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, AuthResponse } from '../services/auth.service';
import { setToken, removeToken } from '../lib/auth';

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
        setToken(response.accessToken, response.refreshToken, response.tenant?.id);
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
          setToken(authData.accessToken, authData.refreshToken, authData.tenant?.id);
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
        removeToken();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
        mfaPendingEmail: state.mfaPendingEmail,
        mfaPendingPassword: state.mfaPendingPassword,
      }),
    }
  )
);
