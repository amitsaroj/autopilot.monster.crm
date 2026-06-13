import api from '../lib/api/client';

export interface IpWhitelistDto {
  id?: string;
  ipAddress: string;
  description?: string;
  enabled?: boolean;
}

export interface ConsentRecordDto {
  id?: string;
  contactId: string;
  consentType: string;
  granted: boolean;
  source?: string;
}

export const securityService = {
  // IP Whitelisting
  getIpWhitelist: () => api.get('/settings/security/ip-whitelist'),
  addIpToWhitelist: (dto: { ipAddress: string; description?: string }) => 
    api.post('/settings/security/ip-whitelist', dto),
  removeIpFromWhitelist: (id: string) => 
    api.delete(`/settings/security/ip-whitelist/${id}`),

  // Consent Tracking
  getConsentRecords: (contactId: string) => 
    api.get(`/settings/security/consent/${contactId}`),
  recordConsent: (dto: ConsentRecordDto) => 
    api.post('/settings/security/consent', dto),
  revokeConsent: (contactId: string, consentType: string) => 
    api.post(`/settings/security/consent/${contactId}/revoke`, { consentType }),

  // GDPR GDPR Tools
  exportGdprData: (contactId: string) => 
    api.get(`/settings/security/gdpr/export/${contactId}`),
};
