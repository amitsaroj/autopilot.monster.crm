"use client";

import { useState, useEffect } from 'react';
import { X, Save, Trash2, Key, Globe, Phone, Info } from 'lucide-react';
import { tenantSettingsService } from '@/services/tenant-settings.service';

interface Props {
  integration: {
    id: string;
    name: string;
    iconStr: string;
  };
  onClose: () => void;
  onSaved: () => void;
}

export default function ConfigureIntegrationModal({ integration, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [integration.id]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const resp = await tenantSettingsService.getSettings();
      const filtered = resp.data.filter((s: any) => s.group === integration.name.toUpperCase());
      const mapped: Record<string, string> = {};
      filtered.forEach((s: any) => { mapped[s.key] = s.value; });
      setSettings(mapped);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        tenantSettingsService.updateSetting({ key, value, group: integration.name.toUpperCase() })
      );
      await Promise.all(promises);
      onSaved();
      onClose();
    } catch (err) {
       alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to remove this override?')) return;
    try {
        await tenantSettingsService.deleteSetting(key);
        const newSettings = { ...settings };
        delete newSettings[key];
        setSettings(newSettings);
    } catch (err) {
        alert('Failed to delete setting');
    }
  }

  const renderFields = () => {
    switch (integration.name) {
      case 'OpenAI':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">OpenAI API Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="password" 
                    value={settings['openai_key'] || ''} 
                    onChange={e => setSettings({...settings, openai_key: e.target.value})}
                    placeholder="sk-..."
                    className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Info className="w-3 h-3"/> Overrides platform-wide OpenAI key for your workspace.</p>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Default Model</label>
                <select 
                  value={settings['ai_default_model'] || 'gpt-4o'} 
                  onChange={e => setSettings({...settings, ai_default_model: e.target.value})}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm"
                >
                  <option value="gpt-4o">GPT-4o (Omni)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
            </div>
          </>
        );
      case 'Twilio':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Account SID</label>
                <input 
                  type="text" 
                  value={settings['twilio_account_sid'] || ''} 
                  onChange={e => setSettings({...settings, twilio_account_sid: e.target.value})}
                  placeholder="AC..."
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Auth Token</label>
                <input 
                  type="password" 
                  value={settings['twilio_auth_token'] || ''} 
                  onChange={e => setSettings({...settings, twilio_auth_token: e.target.value})}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Twilio Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={settings['twilio_phone_number'] || ''} 
                    onChange={e => setSettings({...settings, twilio_phone_number: e.target.value})}
                    placeholder="+1..."
                    className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm"
                  />
                </div>
              </div>
            </div>
          </>
        );
      case 'Meta WhatsApp':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">App ID</label>
                <input 
                  type="text" 
                  value={settings['whatsapp_app_id'] || ''} 
                  onChange={e => setSettings({...settings, whatsapp_app_id: e.target.value})}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Access Token</label>
                <input 
                  type="password" 
                  value={settings['whatsapp_access_token'] || ''} 
                  onChange={e => setSettings({...settings, whatsapp_access_token: e.target.value})}
                  className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Phone ID</label>
                    <input 
                        type="text" 
                        value={settings['whatsapp_phone_number_id'] || ''} 
                        onChange={e => setSettings({...settings, whatsapp_phone_number_id: e.target.value})}
                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Business Account ID</label>
                    <input 
                        type="text" 
                        value={settings['whatsapp_business_account_id'] || ''} 
                        onChange={e => setSettings({...settings, whatsapp_business_account_id: e.target.value})}
                        className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm"
                    />
                 </div>
              </div>
            </div>
          </>
        );
      default:
        return <p className="text-sm text-muted-foreground italic">No specialized configuration available for this integration yet.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-xl border border-border/50 shadow-sm">
              {integration.iconStr}
            </div>
            <div>
              <h2 className="font-bold text-foreground">Configure {integration.name}</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tenant Level Override</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6">
          {loading ? (
             <div className="h-40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <>
              {renderFields()}

              <div className="mt-8 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                  Save Overrides
                </button>
              </div>
            </>
          )}
        </form>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
            <div className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>Configuring these keys will disconnect this workspace from the platform-wide global credentials and use your specific provider billing.</p>
            </div>
        </div>

      </div>
    </div>
  );
}
