export const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Main
  DASHBOARD: '/dashboard',

  // CRM
  CONTACTS: '/crm/contacts',
  LEADS: '/crm/leads',
  DEALS: '/crm/deals',
  PIPELINES: '/crm/pipelines',
  COMPANIES: '/crm/companies',
  PRODUCTS: '/crm/products',
  QUOTES: '/crm/quotes',
  TASKS: '/crm/tasks',
  ACTIVITIES: '/crm/activities',

  // Workflow
  WORKFLOWS: '/workflows',
  WORKFLOW_BUILDER: '/workflows/builder',

  // AI
  AI: '/ai',
  AI_CHAT: '/ai/chat',

  // Voice
  VOICE: '/voice',
  CALLS: '/voice/calls',

  // WhatsApp
  WHATSAPP: '/whatsapp',
  WHATSAPP_INBOX: '/whatsapp/inbox',

  // Inbox
  INBOX: '/inbox',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Analytics
  ANALYTICS: '/analytics',

  // Storage
  STORAGE: '/storage',

  // Billing
  BILLING: '/billing',
  BILLING_PLANS: '/billing/plans',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_API: '/settings/api',
  SETTINGS_ROLES: '/settings/roles',
  SETTINGS_USERS: '/settings/users',

  // Admin
  ADMIN: '/admin',
  ADMIN_TENANTS: '/admin/tenants',
  ADMIN_PRICING: '/admin/pricing',
  ADMIN_METRICS: '/admin/metrics',
  ADMIN_LOGS: '/logs',

  // Marketplace
  MARKETPLACE: '/marketplace',

  // Plugins
  PLUGINS: '/plugins',

  // Search
  SEARCH: '/search',

  // Builder
  BUILDER: '/builder',
} as const;
