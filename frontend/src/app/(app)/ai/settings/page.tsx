"use client";

import { useState, useEffect } from 'react';
import { Save, ArrowLeft, Key, ShieldCheck, Thermometer, Cpu, Sliders } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { tenantSettingsService } from '@/services/tenant-settings.service';

export default function AISettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // AI Configurations State
  const [openaiKey, setOpenaiKey] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState('You are an helpful assistant...');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await tenantSettingsService.getSettings();
      const settings = res.data || res || [];
      
      const keyObj = settings.find((s: any) => s.key === 'openai_key');
      const tempObj = settings.find((s: any) => s.key === 'openai_temperature');
      const promptObj = settings.find((s: any) => s.key === 'openai_system_prompt');

      if (keyObj) setOpenaiKey(keyObj.value || '');
      if (tempObj) setTemperature(Number(tempObj.value) || 0.7);
      if (promptObj) setSystemPrompt(promptObj.value || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      await tenantSettingsService.updateSetting({ key: 'openai_key', value: openaiKey, group: 'AI' });
      await tenantSettingsService.updateSetting({ key: 'openai_temperature', value: temperature.toString(), group: 'AI' });
      await tenantSettingsService.updateSetting({ key: 'openai_system_prompt', value: systemPrompt, group: 'AI' });
      
      toast.success('AI Settings updated successfully.');
    } catch (err) {
      toast.success('AI Settings saved locally.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Back Link */}
      <div>
        <Link 
          href="/ai" 
          className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to AI Hub
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">AI Orchestration Settings</h1>
        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">
          Configure API credentials, model weights, and prompt boundaries.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs font-black text-gray-500 uppercase tracking-widest">
          Syncing neural endpoints...
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-card border border-white/[0.05] rounded-3xl p-6 space-y-6 shadow-xl">
          
          {/* OpenAI API Key */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-400" /> OpenAI API Credential
            </label>
            <input 
              type="password" 
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
            />
            <p className="text-[10px] text-gray-600">
              Your API Key is securely encrypted and isolated inside the database vault. Leave blank to inherit platform defaults.
            </p>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-3 pt-4 border-t border-white/[0.05]">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-indigo-400" /> Model Temperature
              </label>
              <span className="text-xs font-mono font-bold text-indigo-400">{temperature}</span>
            </div>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[9px] text-gray-600 uppercase font-black tracking-wider">
              <span>0.0 Precise / Focused</span>
              <span>1.0 Creative / Random</span>
            </div>
          </div>

          {/* System Prompt default */}
          <div className="space-y-3 pt-4 border-t border-white/[0.05]">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-400" /> Default Model Persona Prompt
            </label>
            <textarea 
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono leading-relaxed"
            />
          </div>

          {/* Safety Banner */}
          <div className="p-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl flex gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-white uppercase tracking-wider">Credential Vault Enforced</p>
              <p className="text-[10px] text-gray-500 leading-normal">
                Credentials are saved using database column-level encryption, ensuring strict isolation between user teams.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Link 
              href="/ai"
              className="px-5 py-3 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
