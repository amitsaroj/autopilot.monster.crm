'use client';

import { useEffect, useState } from 'react';
import {
  Lock,
  Save,
  Loader2,
  ShieldCheck,
  KeyRound,
  Smartphone,
  ShieldOff,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api/client';
import { authService } from '@/services/auth.service';

export default function SecurityPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    authService
      .me()
      .then((user) => {
        setMfaEnabled(Boolean(user?.isMfaEnabled ?? user?.user?.isMfaEnabled));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('New vault phrases do not match');
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Security Vault phrase rotated successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to rotate Security Vault phrase');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async () => {
    setMfaLoading(true);
    try {
      const data = await authService.enableMfa();
      setMfaSetup(data);
      toast.success('Scan the QR code with your authenticator app');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to start MFA setup');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setMfaLoading(true);
    try {
      await authService.verifyMfa(verifyCode.trim());
      setMfaEnabled(true);
      setMfaSetup(null);
      setVerifyCode('');
      toast.success('Two-factor authentication enabled');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Invalid verification code');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!confirm('Disable two-factor authentication for your account?')) return;
    setMfaLoading(true);
    try {
      await authService.disableMfa();
      setMfaEnabled(false);
      setMfaSetup(null);
      setVerifyCode('');
      toast.success('Two-factor authentication disabled');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(message || 'Failed to disable MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl pb-20">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">
          Vault Security Rotation
        </h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
          Manage infrastructure access keys and authentication primitives
        </p>
      </div>

      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8 group">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-4xl font-black text-emerald-400 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="text-center md:text-left">
          <p className="text-2xl font-black text-white uppercase tracking-tighter">
            Zero Trust Enabled
          </p>
          <p className="text-xs text-gray-500 font-medium leading-relaxed mt-2 max-w-lg">
            Your identity artifacts are protected by AES-256 encryption. We recommend rotating your
            Vault keys every 90 days to maintain maximum tenant compliance.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] p-8 md:p-10 shadow-2xl space-y-8"
      >
        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">
            Phrase Rotation
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">
              Current Identity Phrase
            </label>
            <input
              type="password"
              required
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all font-mono placeholder:font-sans tracking-widest"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">
              New Identity Phrase
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all font-mono placeholder:font-sans tracking-widest"
            />
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2">
              Require: 8+ Chars, 1 Target Int, 1 Special Glyph
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">
              Confirm Identity Phrase
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-emerald-500/5 transition-all font-mono placeholder:font-sans tracking-widest"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Compile Rotation Schema
          </button>
        </div>
      </form>

      <div className="rounded-[40px] border border-white/[0.05] bg-white/[0.02] p-8 md:p-10 shadow-2xl space-y-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-6">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tighter">
              Two-Factor Authentication
            </h2>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
              {mfaEnabled ? 'Enabled on your account' : 'Add an authenticator app for sign-in'}
            </p>
          </div>
        </div>

        {mfaEnabled && !mfaSetup && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">
                MFA is active. You will be prompted for a code when signing in.
              </p>
            </div>
            <button
              type="button"
              disabled={mfaLoading}
              onClick={() => void handleDisableMfa()}
              className="flex items-center justify-center gap-2 w-full py-4 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {mfaLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldOff className="w-4 h-4" />
              )}
              Disable MFA
            </button>
          </div>
        )}

        {!mfaEnabled && !mfaSetup && (
          <button
            type="button"
            disabled={mfaLoading}
            onClick={() => void handleEnableMfa()}
            className="flex items-center justify-center gap-3 w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
          >
            {mfaLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            Enable Two-Factor Authentication
          </button>
        )}

        {!mfaEnabled && mfaSetup && (
          <form onSubmit={handleVerifyMfa} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="shrink-0 p-4 rounded-2xl bg-white border border-white/10">
                <img
                  src={mfaSetup.qrCodeUrl}
                  alt="MFA QR code"
                  className="w-40 h-40"
                />
              </div>
              <div className="space-y-3 flex-1">
                <p className="text-xs text-gray-400">
                  Scan the QR code with your authenticator app, or enter this secret manually:
                </p>
                <code className="block text-xs font-mono text-indigo-300 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 break-all">
                  {mfaSetup.secret}
                </code>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-indigo-500/50 transition-all font-mono tracking-[0.5em] text-center"
              />
            </div>
            <button
              type="submit"
              disabled={mfaLoading || verifyCode.length < 6}
              className="flex items-center justify-center gap-3 w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {mfaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Verify and Activate
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
