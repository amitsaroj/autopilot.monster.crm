'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import api from '@/lib/api/client';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const res = await api.patch(`/users/${user.id}`, formData);
      toast.success('Profile updated successfully');

      // Update local context
      const updatedRes = await api.get('/users/me');
      if (updatedRes.data?.data) {
        // Force session refresh
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl pb-20">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground uppercase">
          Profile Configuration
        </h1>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide mt-1">
          Manage your identity and artifact preferences
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-4xl font-semibold text-blue-700 dark:text-blue-400 uppercase shadow-xl">
          {formData.firstName?.[0] || 'U'}
        </div>
        <div className="text-center md:text-left">
          <p className="text-2xl font-semibold text-foreground uppercase tracking-tighter">
            {formData.firstName} {formData.lastName}
          </p>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mt-1">
            {formData.email} • {user.roles?.join(', ')}
          </p>
          <div className="flex gap-4 mt-6 justify-center md:justify-start">
            <button className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wide bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-foreground dark:hover:text-white transition-all">
              Upload Identity Token
            </button>
            <button className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wide bg-card text-muted-foreground border border-border rounded-xl hover:text-red-400 transition-all">
              Flush Artifact
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-card p-8 md:p-10 shadow-2xl space-y-8"
      >
        <div className="flex items-center gap-3 border-b border-border pb-6">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-700 dark:text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-tighter">
            Core Matrices
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide ml-2">
              First name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide ml-2">
              Last name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide ml-2 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Primary Vector
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide ml-2">
              Communications Node (Phone)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-card border border-border rounded-2xl px-5 py-4 text-sm text-foreground outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all"
            />
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Commit Identity Modifications
          </button>
        </div>
      </form>
    </div>
  );
}
