import api from '../lib/api/client';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
  tenant?: any;
}

export const authService = {
  async login(data: any): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: any): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout(allSessions = false): Promise<void> {
    await api.post('/auth/logout', { allSessions });
  },

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(data: any): Promise<void> {
    await api.post('/auth/reset-password', data);
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async enableMfa(): Promise<{ secret: string; qrCodeUrl: string }> {
    const response = await api.post('/auth/mfa/enable');
    return response.data;
  },

  async verifyMfa(totpCode: string): Promise<void> {
    await api.post('/auth/mfa/verify', { totpCode });
  },

  async disableMfa(): Promise<void> {
    await api.delete('/auth/mfa');
  },

  async getSessions(): Promise<any[]> {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  async me(): Promise<any> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
