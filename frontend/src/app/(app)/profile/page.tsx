'use client';

import { useEffect, useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Camera, 
  Loader2, 
  Save,
  CheckCircle2,
  Calendar,
  Lock
} from 'lucide-react';
import { userService, User } from '@/services/user.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', avatarUrl: '' });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getMe();
      const userData = (res as any).data.data;
      setUser(userData);
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatarUrl: userData.avatarUrl || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await userService.updateUser(user.id, formData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your personal information and account security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-card rounded-3xl border border-gray-200 dark:border-border shadow-soft p-8 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-3xl bg-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-500/40 border-4 border-white dark:border-gray-800">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  <span>{formData.firstName[0]}{formData.lastName[0]}</span>
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-indigo-600 transition">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{formData.firstName} {formData.lastName}</h2>
            <p className="text-sm text-gray-500 mb-6">{user?.email}</p>
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-800/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Account
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-indigo-200" />
              <h3 className="font-bold">Security Status</h3>
            </div>
            <p className="text-sm text-indigo-100 mb-6">Your account is secured with dual-factor authentication.</p>
            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition border border-white/20">
              Update Security
            </button>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white dark:bg-card rounded-3xl border border-gray-200 dark:border-border shadow-soft overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">First Name</label>
                  <input
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">Last Name</label>
                  <input
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    disabled
                    value={user?.email}
                    className="w-full pl-12 pr-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed font-medium"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-200 px-2 py-0.5 rounded-md">Locked</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">Avatar URL</label>
                <input
                  value={formData.avatarUrl}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl border border-gray-200 dark:border-input bg-gray-50/50 dark:bg-background/50 focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="pt-4 flex items-center gap-6 text-sm text-gray-500 pb-2 border-b border-gray-100 dark:border-border">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user?.createdAt || '').toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Last changed 2d ago
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-border flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-2xl font-black text-sm transition shadow-xl shadow-indigo-500/20"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
