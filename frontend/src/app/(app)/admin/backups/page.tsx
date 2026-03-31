'use client';

import { useState, useEffect } from 'react';
import { adminBackupsService } from '@/services/admin-backups.service';

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await adminBackupsService.findAll();
      setBackups(response.data);
    } catch (error) {
      console.error('Failed to load backups', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    if (!confirm('This will trigger a full system backup. Continue?')) return;
    try {
      await adminBackupsService.trigger();
      alert('Backup process initiated in background.');
      loadBackups();
    } catch (error) {
      console.error('Failed to trigger backup', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / System Backups</h1>
        <button 
          onClick={handleTrigger}
          className="bg-black text-white px-8 py-4 rounded-3xl font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          INITIATE GLOBAL SNAPSHOT
        </button>
      </div>

      {loading ? (
        <div>Retrieving backup manifests...</div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-0">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/50 text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
                <tr>
                  <th className="px-8 py-6 text-left">Manifest ID</th>
                  <th className="px-8 py-6 text-left">Filename</th>
                  <th className="px-8 py-6 text-left">Size</th>
                  <th className="px-8 py-6 text-left">Status</th>
                  <th className="px-8 py-6 text-left">Generated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {backups.map((bk) => (
                  <tr key={bk.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 text-xs font-mono font-bold text-gray-400">{bk.id}</td>
                    <td className="px-8 py-6 text-sm font-black text-gray-900">{bk.name}</td>
                    <td className="px-8 py-6 text-xs font-bold text-gray-400">{bk.size}</td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bk.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {bk.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-400">
                      {new Date(bk.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {backups.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-gray-300 italic">No backup records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
