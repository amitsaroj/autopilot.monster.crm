'use client';

import { NotificationPreferencesForm } from '@/components/settings/notification-preferences-form';

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Notification Preferences</h1>
        <p className="page-description">Manage your notification channels</p>
      </div>
      <NotificationPreferencesForm />
    </div>
  );
}
