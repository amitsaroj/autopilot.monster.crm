'use client';

import { NotificationPreferencesForm } from '@/components/settings/notification-preferences-form';

export default function SettingsNotificationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Notification Settings</h1>
        <p className="page-description">Choose how you receive notifications</p>
      </div>
      <NotificationPreferencesForm />
    </div>
  );
}
