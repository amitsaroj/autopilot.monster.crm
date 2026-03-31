'use client';

import { useState, useEffect } from 'react';
import { adminStorageService } from '@/services/admin-storage.service';

export default function AdminStoragePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminStorageService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load storage stats', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Global Storage Cluster</h1>
      </div>

      {loading ? (
        <div>Calculating storage footprint...</div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Total Platform Usage</div>
              <div className="text-7xl font-black text-gray-900 tracking-tighter mb-2">{stats.totalSize}</div>
              <div className="text-sm font-bold text-gray-400">Distributed across {stats.buckets.length} active buckets</div>
            </div>

            <div className="bg-black p-10 rounded-[2.5rem] text-white flex flex-col justify-center">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Storage Provider</div>
              <div className="text-4xl font-black mb-2 tracking-tight">{stats.provider} Cluster</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Region: High-Availability (Local)</div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900">Bucket Inventory</h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Metrics</span>
            </div>
            <div className="p-0">
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50/50 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-8 py-5 text-left">Bucket Name</th>
                    <th className="px-8 py-5 text-left">Files</th>
                    <th className="px-8 py-5 text-right">Size On Disk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.buckets.map((bucket: any) => (
                    <tr key={bucket.name} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-black text-gray-800 font-mono">{bucket.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-gray-400">{bucket.fileCount.toLocaleString()} objects</td>
                      <td className="px-8 py-6 text-right text-sm font-black text-gray-900">{bucket.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
