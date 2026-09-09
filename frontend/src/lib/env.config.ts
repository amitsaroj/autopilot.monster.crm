export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  api: {
    baseUrl:
      process.env.NEXT_PUBLIC_API_URL ??
      (process.env.NODE_ENV === 'production'
        ? 'https://api.autopilots.monster/api/v1'
        : 'http://localhost:8000/api/v1'),
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://autopilotmonster.com',
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  },
};

export const API_BASE = env.api.baseUrl;
export const SITE_URL = env.site.url;
