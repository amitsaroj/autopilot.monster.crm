'use client';

import { useState } from 'react';
import { adminRestoreService } from '@/services/admin-restore.service';

export default function AdminRestorePage() {
  const [backupId, setBackupId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('WARNING: THIS WILL OVERWRITE CURRENT SYSTEM STATE. PROCEED?')) return;
    setLoading(true);
    try {
      await adminRestoreService.initiate(backupId);
      alert('System recovery initiated. The platform may be temporarily unavailable.');
    } catch (error) {
      console.error('Restore failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Disaster Recovery</h1>
      </div>

      <div className="max-w-4xl mx-auto mt-20">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-red-500/5 border border-red-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-50/50 rounded-full blur-3xl -mr-40 -mt-40"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Initiate Platform Restore</h2>
            <p className="text-gray-400 text-sm mb-10 leading-relaxed max-w-lg">
              Enter a valid Backup Manifest ID to begin the recovery process. This action is destructive and cannot be undone. All current data will be replaced by the snapshot.
            </p>

            <form onSubmit={handleRestore} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Backup Manifest ID</label>
                <input 
                  value={backupId}
                  onChange={e => setBackupId(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-[2rem] px-8 py-5 text-sm font-bold focus:bg-white focus:border-red-500 transition-all outline-none shadow-inner"
                  placeholder="e.g. bak-001-2023-10-25"
                  required
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  disabled={loading}
                  className="flex-[2] bg-red-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all uppercase text-xs tracking-widest disabled:opacity-50"
                >
                  {loading ? 'RESTORING SYSTEM...' : 'EXECUTE EMERGENCY RESTORE'}
                </button>
                <button 
                  type="button"
                  className="flex-1 bg-white text-gray-400 font-bold py-6 rounded-[2rem] border-2 border-gray-100 hover:text-gray-600 transition-all text-xs tracking-widest uppercase"
                >
                  Safe Mode
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-blue-100 transition-all">
            <div className="text-[10px] font-black text-blue-500 uppercase mb-2">DB Snapshot</div>
            <p className="text-xs text-gray-400 leading-tight">PostgreSQL table state restoration including all tenant isolation rules.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-green-100 transition-all">
            <div className="text-[10px] font-black text-green-500 uppercase mb-2">Storage Sync</div>
            <p className="text-xs text-gray-400 leading-tight">MinIO object restoration including public and private secure segments.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-purple-100 transition-all">
            <div className="text-[10px] font-black text-purple-500 uppercase mb-2">Redis Flush</div>
            <p className="text-xs text-gray-400 leading-tight">Automatic cache invalidation to prevent stale data post-recovery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
