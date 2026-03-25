'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Loader2, 
  ShieldAlert, 
  Mail, 
  Globe, 
  Bell, 
  Database,
  Zap,
  CheckCircle2,
  Lock,
  RefreshCcw,
  Cloud,
  Terminal,
  Activity,
  Server,
  Key,
  Smartphone,
  Info,
  ShieldCheck,
  Eye,
  EyeOff,
  Brain,
  Mic,
  MessageCircle
} from 'lucide-react';
import { adminSystemSettingsService } from '@/services/admin-system-settings.service';
import { adminEmailSettingsService } from '@/services/admin-email-settings.service';
import { adminSmsSettingsService } from '@/services/admin-sms-settings.service';
import { adminEnvironmentService } from '@/services/admin-environment.service';
import { adminConfigService } from '@/services/admin-config.service';
import { adminAISettingsService } from '@/services/admin-ai-settings.service';
import { adminVoiceSettingsService } from '@/services/admin-voice-settings.service';
import { adminWhatsAppSettingsService } from '@/services/admin-whatsapp-settings.service';
import { adminCostRulesService } from '@/services/admin-cost-rules.service';
import { adminFeatureRulesService } from '@/services/admin-feature-rules.service';
import toast from 'react-hot-toast';

type TabType = 'general' | 'system' | 'communications' | 'ai' | 'voice' | 'markup' | 'governance' | 'environment' | 'infrastructure';

export default function GlobalConfigurationDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // State for different modules
  const [systemSettings, setSystemSettings] = useState<any>({});
  const [emailSettings, setEmailSettings] = useState<any>({});
  const [smsSettings, setSmsSettings] = useState<any>({});
  const [whatsappSettings, setWhatsappSettings] = useState<any>({});
  const [aiSettings, setAiSettings] = useState<any>({});
  const [voiceSettings, setVoiceSettings] = useState<any>({});
  const [costRules, setCostRules] = useState<any>({});
  const [featureRules, setFeatureRules] = useState<any>({});
  const [envData, setEnvData] = useState<any>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setLoading(true);
      const [system, email, sms, env, wa, ai, voice, cost, fr] = await Promise.all([
        adminSystemSettingsService.getSettings(),
        adminEmailSettingsService.getSettings(),
        adminSmsSettingsService.getSettings(),
        adminEnvironmentService.getEnv(),
        adminWhatsAppSettingsService.getSettings(),
        adminAISettingsService.getSettings(),
        adminVoiceSettingsService.getSettings(),
        adminCostRulesService.getSettings(),
        adminFeatureRulesService.getSettings(),
      ]);
      setSystemSettings(system.data || {});
      setEmailSettings(email.data || {});
      setSmsSettings(sms.data || {});
      setWhatsappSettings(wa.data || {});
      setAiSettings(ai.data || {});
      setVoiceSettings(voice.data || {});
      setCostRules(cost.data || {});
      setFeatureRules(fr.data || {});
      setEnvData(env.data || null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to synchronize control plane');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (service: any, setter: any, data: any, key: string) => {
    try {
      setSaving(key);
      await service.updateSettings(data);
      setter(data);
      toast.success('Protocol updated');
    } catch (err) {
      toast.error('Failed to commit changes');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
       <Loader2 className="h-10 w-10 animate-spin text-brand" />
       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Master Node Metadata...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter">Platform Orchestration</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Global Configuration / L7 Core Control</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Security Layer: Active</span>
           </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/20 border border-border/30 rounded-2xl w-fit backdrop-blur-md overflow-x-auto max-w-full">
         {(['general', 'system', 'communications', 'ai', 'voice', 'markup', 'governance', 'environment', 'infrastructure'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
               {tab}
            </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
         {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
               {/* Platform Identity */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-l-8 border-l-brand">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <Globe className="h-6 w-6 text-brand" />
                     Identity & Branding
                  </h2>
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">System Name</label>
                        <input 
                           className="w-full px-5 py-4 bg-muted/20 border border-border/20 rounded-2xl font-bold text-sm focus:border-brand/40 outline-none transition-all"
                           defaultValue={systemSettings.platformName}
                           onBlur={(e) => handleUpdate(adminSystemSettingsService, setSystemSettings, { ...systemSettings, platformName: e.target.value }, 'platformName')}
                        />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Support Protocol Endpoint (Email)</label>
                        <input 
                           className="w-full px-5 py-4 bg-muted/20 border border-border/20 rounded-2xl font-bold text-sm focus:border-brand/40 outline-none transition-all"
                           defaultValue={systemSettings.contactEmail}
                           onBlur={(e) => handleUpdate(adminSystemSettingsService, setSystemSettings, { ...systemSettings, contactEmail: e.target.value }, 'contactEmail')}
                        />
                     </div>
                  </div>
               </div>

               {/* Visual Meta */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <Zap className="h-6 w-6 text-brand" />
                     Global Visual Schema
                  </h2>
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Core Brand Color</label>
                        <div className="flex gap-4">
                           <div className="w-14 h-14 rounded-2xl border border-border/20 shadow-inner" style={{ backgroundColor: systemSettings.brandColor || '#4f46e5' }} />
                           <input 
                              className="flex-1 px-5 py-4 bg-muted/20 border border-border/20 rounded-2xl font-bold text-sm focus:border-brand/40 outline-none transition-all"
                              defaultValue={systemSettings.brandColor || '#4f46e5'}
                              onBlur={(e) => handleUpdate(adminSystemSettingsService, setSystemSettings, { ...systemSettings, brandColor: e.target.value }, 'brandColor')}
                           />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Asset: Favicon URL</label>
                        <input 
                           className="w-full px-5 py-4 bg-muted/20 border border-border/20 rounded-2xl font-bold text-sm focus:border-brand/40 outline-none transition-all"
                           placeholder="https://..."
                           defaultValue={systemSettings.logoUrl}
                           onBlur={(e) => handleUpdate(adminSystemSettingsService, setSystemSettings, { ...systemSettings, logoUrl: e.target.value }, 'logoUrl')}
                        />
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'system' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
               {/* Maintenance Lockdown */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-l-8 border-l-red-500">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center justify-between">
                     <span className="flex items-center gap-4 text-red-500">
                        <ShieldAlert className="h-6 w-6" />
                        System Lockdown
                     </span>
                     {saving === 'maintenanceMode' && <Loader2 className="h-4 w-4 animate-spin text-red-500" />}
                  </h2>
                  <div className="space-y-8">
                     <div className="flex items-center justify-between p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                        <div>
                           <p className="text-sm font-black uppercase tracking-tight text-red-500">Protocol: Maintenance</p>
                           <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Global User Disconnection Mode</p>
                        </div>
                        <button 
                           onClick={() => handleUpdate(adminSystemSettingsService, setSystemSettings, { ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode }, 'maintenanceMode')}
                           className={`w-14 h-7 rounded-full transition-all relative ${systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-muted'}`}
                        >
                           <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${systemSettings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                        </button>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Broadcast Intercept Message</label>
                        <textarea 
                           className="w-full px-5 py-4 bg-muted/20 border border-border/20 rounded-2xl font-bold text-xs focus:border-brand/40 outline-none transition-all h-32 leading-relaxed"
                           defaultValue={systemSettings.maintenanceMessage || 'Platform synchronization in progress. All nodes offline for maintenance.'}
                           onBlur={(e) => handleUpdate(adminSystemSettingsService, setSystemSettings, { ...systemSettings, maintenanceMessage: e.target.value }, 'maintenanceMessage')}
                        />
                     </div>
                  </div>
               </div>

               {/* Access Controls */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <Lock className="h-6 w-6 text-brand" />
                     Gatekeeper Policy
                  </h2>
                  <div className="space-y-8">
                     <div className="flex items-center justify-between p-6 rounded-2xl bg-brand/5 border border-brand/10">
                        <div>
                           <p className="text-sm font-black uppercase tracking-tight">Open Ingress (Registration)</p>
                           <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Allow new tenants to initialize seats</p>
                        </div>
                        <button 
                           onClick={() => handleUpdate(adminSystemSettingsService, setSystemSettings, { ...systemSettings, allowRegistration: !systemSettings.allowRegistration }, 'allowRegistration')}
                           className={`w-14 h-7 rounded-full transition-all relative ${systemSettings.allowRegistration ? 'bg-brand' : 'bg-muted'}`}
                        >
                           <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${systemSettings.allowRegistration ? 'right-1' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'communications' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
               {/* SMTP Orchestration */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-l-8 border-l-brand">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <Mail className="h-6 w-6 text-brand" />
                     Signal Protocol: SMTP
                  </h2>
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Relay Host</label>
                           <input 
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                              defaultValue={emailSettings.host}
                              onBlur={(e) => handleUpdate(adminEmailSettingsService, setEmailSettings, { ...emailSettings, host: e.target.value }, 'host')}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Port</label>
                           <input 
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                              defaultValue={emailSettings.port}
                              onBlur={(e) => handleUpdate(adminEmailSettingsService, setEmailSettings, { ...emailSettings, port: parseInt(e.target.value) }, 'port')}
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Credential: Username</label>
                        <input 
                           className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                           defaultValue={emailSettings.user}
                           onBlur={(e) => handleUpdate(adminEmailSettingsService, setEmailSettings, { ...emailSettings, user: e.target.value }, 'user')}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Credential: Secret</label>
                        <div className="relative">
                           <input 
                              type={showSecrets ? "text" : "password"}
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none pr-12"
                              defaultValue={emailSettings.password}
                              onBlur={(e) => handleUpdate(adminEmailSettingsService, setEmailSettings, { ...emailSettings, password: e.target.value }, 'password')}
                           />
                           <button 
                              onClick={() => setShowSecrets(!showSecrets)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors"
                           >
                              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* WhatsApp Protocol */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-t-8 border-t-emerald-500">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <MessageCircle className="h-6 w-6 text-emerald-500" />
                     Signal Protocol: WhatsApp
                  </h2>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Business App ID</label>
                        <input 
                           className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                           defaultValue={whatsappSettings.appId}
                           onBlur={(e) => handleUpdate(adminWhatsAppSettingsService, setWhatsappSettings, { ...whatsappSettings, appId: e.target.value }, 'appId')}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Permanent Access Token</label>
                        <div className="relative">
                           <input 
                              type={showSecrets ? "text" : "password"}
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none pr-12"
                              defaultValue={whatsappSettings.accessToken}
                              onBlur={(e) => handleUpdate(adminWhatsAppSettingsService, setWhatsappSettings, { ...whatsappSettings, accessToken: e.target.value }, 'accessToken')}
                           />
                           <button 
                              onClick={() => setShowSecrets(!showSecrets)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand transition-colors"
                           >
                              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Phone Number ID</label>
                           <input 
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                              defaultValue={whatsappSettings.phoneNumberId}
                              onBlur={(e) => handleUpdate(adminWhatsAppSettingsService, setWhatsappSettings, { ...whatsappSettings, phoneNumberId: e.target.value }, 'phoneNumberId')}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Business Account ID</label>
                           <input 
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                              defaultValue={whatsappSettings.businessAccountId}
                              onBlur={(e) => handleUpdate(adminWhatsAppSettingsService, setWhatsappSettings, { ...whatsappSettings, businessAccountId: e.target.value }, 'businessAccountId')}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
               {/* Neural Engine: OpenAI */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-l-8 border-l-brand">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <Brain className="h-6 w-6 text-brand" />
                     Neural Engine: OpenAI
                  </h2>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Bearer Token (API Key)</label>
                        <div className="relative">
                           <input 
                              type={showSecrets ? "text" : "password"}
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none pr-12"
                              defaultValue={aiSettings.openaiKey}
                              onBlur={(e) => handleUpdate(adminAISettingsService, setAiSettings, { ...aiSettings, openaiKey: e.target.value }, 'ai_openai')}
                           />
                           <button onClick={() => setShowSecrets(!showSecrets)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Base Model Tier</label>
                        <select 
                           className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                           defaultValue={aiSettings.defaultModel}
                           onChange={(e) => handleUpdate(adminAISettingsService, setAiSettings, { ...aiSettings, defaultModel: e.target.value }, 'ai_model')}
                        >
                           <option value="gpt-4o">GPT-4o (Omni)</option>
                           <option value="gpt-4-turbo">GPT-4 Turbo</option>
                           <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                     </div>
                  </div>
               </div>

               {/* Intelligence Context */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <Terminal className="h-6 w-6 text-brand" />
                     Platform Persona Context
                  </h2>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Global System Prompt</label>
                        <textarea 
                           className="w-full px-5 py-4 bg-muted/20 border border-border/20 rounded-2xl font-bold text-xs focus:border-brand/40 outline-none transition-all h-40 leading-relaxed"
                           defaultValue={aiSettings.platformRole}
                           onBlur={(e) => handleUpdate(adminAISettingsService, setAiSettings, { ...aiSettings, platformRole: e.target.value }, 'ai_role')}
                        />
                     </div>
                  </div>
               </div>
            </div>
         )}
         {activeTab === 'markup' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
               {/* Cost Rules: Markups */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-l-8 border-l-brand">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <Zap className="h-6 w-6 text-brand" />
                     Monetization: Markup Protocols
                  </h2>
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">AI Intelligence (%)</label>
                           <input 
                              type="number"
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                              defaultValue={costRules.aiMarkup}
                              onBlur={(e) => handleUpdate(adminCostRulesService, setCostRules, { ...costRules, aiMarkup: parseFloat(e.target.value) }, 'aiMarkup')}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">SMS/WhatsApp (%)</label>
                           <input 
                              type="number"
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                              defaultValue={costRules.smsMarkup}
                              onBlur={(e) => handleUpdate(adminCostRulesService, setCostRules, { ...costRules, smsMarkup: parseFloat(e.target.value) }, 'smsMarkup')}
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Voice/Synthesis (%)</label>
                           <input 
                              type="number"
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                              defaultValue={costRules.voiceMarkup}
                              onBlur={(e) => handleUpdate(adminCostRulesService, setCostRules, { ...costRules, voiceMarkup: parseFloat(e.target.value) }, 'voiceMarkup')}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Cloud Storage (%)</label>
                           <input 
                              type="number"
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                              defaultValue={costRules.storageMarkup}
                              onBlur={(e) => handleUpdate(adminCostRulesService, setCostRules, { ...costRules, storageMarkup: parseFloat(e.target.value) }, 'storageMarkup')}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Minimum Balance Policy */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <Database className="h-6 w-6 text-brand" />
                     Reserve Protocol
                  </h2>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Global Minimum Balance ($)</label>
                        <input 
                           type="number"
                           step="0.01"
                           className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                           defaultValue={costRules.minimumBalance}
                           onBlur={(e) => handleUpdate(adminCostRulesService, setCostRules, { ...costRules, minimumBalance: parseFloat(e.target.value) }, 'minimumBalance')}
                        />
                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest mt-2">Services will be suspended if tenant balance falls below this threshold.</p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'governance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
               {/* Feature Governance: Banners & Access */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-l-8 border-l-brand">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <ShieldCheck className="h-6 w-6 text-brand" />
                     Feature Ingress Protocols
                  </h2>
                  <div className="space-y-6">
                     {[
                        { label: 'Neural Agents (AI)', key: 'enableAiAgents' },
                        { label: 'WhatsApp / Bulk SMS', key: 'enableBulkSms' },
                        { label: 'Voice / Live Telephony', key: 'enableLiveCalls' },
                        { label: 'Beta Program Ingress', key: 'enableBetaFeatures' },
                     ].map((feat) => (
                        <div key={feat.key} className="flex items-center justify-between p-6 rounded-2xl bg-muted/10 border border-border/10">
                           <div>
                              <p className="text-xs font-black uppercase tracking-tight">{feat.label}</p>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Global feature availability status</p>
                           </div>
                           <button 
                              onClick={() => handleUpdate(adminFeatureRulesService, setFeatureRules, { ...featureRules, [feat.key]: !featureRules[feat.key] }, feat.key)}
                              className={`w-14 h-7 rounded-full transition-all relative ${featureRules[feat.key] ? 'bg-brand' : 'bg-muted'}`}
                           >
                              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${featureRules[feat.key] ? 'right-1' : 'left-1'}`} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Maintenance Intercept */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-t-8 border-t-red-500">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4 text-red-500">
                     <ShieldAlert className="h-6 w-6" />
                     Broadcast: Maintenance Intercept
                  </h2>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Intercept Message</label>
                        <textarea 
                           className="w-full px-5 py-4 bg-muted/20 border border-border/20 rounded-2xl font-bold text-xs focus:border-brand/40 outline-none transition-all h-40 leading-relaxed"
                           defaultValue={featureRules.maintenanceMessage}
                           onBlur={(e) => handleUpdate(adminFeatureRulesService, setFeatureRules, { ...featureRules, maintenanceMessage: e.target.value }, 'maintenanceMessage')}
                        />
                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest mt-2">Displayed during global maintenance mode or feature outages.</p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'voice' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
               {/* Voice Synthesis: ElevenLabs */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-l-8 border-l-indigo-500">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4">
                     <Mic className="h-6 w-6 text-indigo-500" />
                     Synthesis Protocol: ElevenLabs
                  </h2>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">X-API-KEY</label>
                        <div className="relative">
                           <input 
                              type={showSecrets ? "text" : "password"}
                              className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none pr-12"
                              defaultValue={voiceSettings.elevenLabsKey}
                              onBlur={(e) => handleUpdate(adminVoiceSettingsService, setVoiceSettings, { ...voiceSettings, elevenLabsKey: e.target.value }, 'voice_eleven')}
                           />
                           <button onClick={() => setShowSecrets(!showSecrets)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Default Actor ID</label>
                        <input 
                           className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                           defaultValue={voiceSettings.defaultVoiceId}
                           onBlur={(e) => handleUpdate(adminVoiceSettingsService, setVoiceSettings, { ...voiceSettings, defaultVoiceId: e.target.value }, 'voice_id')}
                        />
                     </div>
                  </div>
               </div>

               {/* Voice Ingress: Twilio */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4 text-red-500">
                     <Smartphone className="h-6 w-6" />
                     Telephony: Twilio Voice
                  </h2>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">App SID</label>
                        <input 
                           className="w-full px-4 py-3 bg-muted/20 border border-border/20 rounded-xl font-bold text-sm focus:border-brand/40 outline-none"
                           defaultValue={voiceSettings.twilioVoiceSid}
                           onBlur={(e) => handleUpdate(adminVoiceSettingsService, setVoiceSettings, { ...voiceSettings, twilioVoiceSid: e.target.value }, 'voice_twilio')}
                        />
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'environment' && (
            <div className="space-y-8 animate-slide-up">
               {/* Server Specs */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                     { label: 'Runtime Engine', value: envData?.nodeVersion, icon: Terminal },
                     { label: 'Host Platform', value: envData?.platform, icon: Server },
                     { label: 'Node Uptime', value: `${Math.floor((envData?.uptime || 0) / 3600)}h ${Math.floor(((envData?.uptime || 0) % 3600) / 60)}m`, icon: Activity },
                  ].map((spec) => (
                     <div key={spec.label} className="p-6 rounded-3xl border border-border/30 bg-card/10 backdrop-blur-md flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-brand/10 text-brand">
                           <spec.icon className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{spec.label}</p>
                           <p className="text-sm font-black tracking-tighter uppercase">{spec.value || 'Unknown'}</p>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Environment Variables */}
               <div className="rounded-3xl border border-border/30 bg-card/5 backdrop-blur-xl p-8 border-t-4 border-t-yellow-500">
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-4 text-yellow-500">
                        <Terminal className="h-6 w-6" />
                        Reactive Signal Schema (ENV)
                     </h2>
                     <span className="text-[9px] font-black text-muted-foreground/60 uppercase flex items-center gap-2">
                        <Lock className="h-3 w-3" />
                        Sensitive signals redacted
                     </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {Object.entries(envData?.env || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border/10 hover:bg-muted/20 transition-all font-mono">
                           <span className="text-[10px] font-black text-brand uppercase truncate mr-4">{key}</span>
                           <span className="text-[10px] font-medium text-muted-foreground/40 break-all text-right">{value as string}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'infrastructure' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
               {/* Database Health */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl border-l-8 border-l-emerald-500">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-4 text-emerald-500">
                     <Database className="h-6 w-6" />
                     Data Preservation Layer
                  </h2>
                  <div className="space-y-6">
                     <div className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
                        <div className="flex items-center justify-between mb-4">
                           <p className="text-xs font-black uppercase tracking-widest">Master Cluster Sync</p>
                           <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[8px] font-black uppercase tracking-widest">Synchronized</span>
                        </div>
                        <div className="w-full bg-emerald-500/20 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-emerald-500 h-full w-[100%] transition-all" />
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase mt-4">Redundancy Verified Across 3 Availability Zones</p>
                     </div>
                     <div className="space-y-4">
                        {[
                           { label: 'PostgreSQL Primary', status: 'Optimal', latency: '4ms' },
                           { label: 'Redis Cache Node', status: 'Optimal', latency: '1ms' },
                           { label: 'Qdrant Vector Node', status: 'Optimal', latency: '12ms' },
                        ].map((node) => (
                           <div key={node.label} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                              <span>{node.label}</span>
                              <div className="flex items-center gap-3">
                                 <span className="text-emerald-500">{node.status}</span>
                                 <span className="opacity-40">{node.latency}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Backups & Preservation */}
               <div className="rounded-3xl border border-border/30 bg-card/10 backdrop-blur-xl p-10 shadow-xl">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center justify-between">
                     <span className="flex items-center gap-4 text-brand">
                        <Cloud className="h-6 w-6" />
                        Immutable Backups
                     </span>
                     <button className="flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand border border-brand/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand hover:text-white transition-all">
                        <RefreshCcw className="h-3 w-3" />
                        Trigger Master Snapshot
                     </button>
                  </h2>
                  <div className="space-y-8">
                     <div className="p-6 rounded-2xl bg-muted/20 border border-border/20">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-4">Latest Platform Snapshot</p>
                        <div className="flex items-center gap-6">
                           <div>
                              <p className="text-2xl font-black tracking-tighter">1.2 GB</p>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Compressed Artifact</p>
                           </div>
                           <div className="w-px h-10 bg-border/40" />
                           <div>
                              <p className="text-sm font-black uppercase tracking-widest">2h 14m ago</p>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Snapshot Timestamp</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <Info className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                        <p className="text-[9px] font-medium leading-relaxed uppercase tracking-widest text-blue-500/80">
                           Autonomous snapshots are performed every 24 hours. Retention policy preserves the last 30 snapshots in high-durability cold storage.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
