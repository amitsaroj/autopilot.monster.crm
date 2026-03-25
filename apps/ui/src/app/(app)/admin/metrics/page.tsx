'use client';

import { useState, useEffect } from 'react';
import { adminMetricsService } from '@/services/admin-metrics.service';

export default function AdminMetricsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminMetricsService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load metrics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading metrics...</div>;
  if (!stats) return <div className="p-6 text-red-400">Failed to load metrics.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Platform Metrics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Tenants</div>
          <div className="text-3xl font-black text-gray-900">{stats.tenants}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Users</div>
          <div className="text-3xl font-black text-gray-900">{stats.users}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Subscriptions</div>
          <div className="text-3xl font-black text-blue-600">{stats.activeSubscriptions}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</div>
          <div className="text-3xl font-black text-green-600">${stats.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Global Usage Breakdown</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {Object.entries(stats.usage || {}).map(([key, value]: [string, any]) => (
              <div key={key} className="space-y-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{key.replace(/_/g, ' ')}</div>
                <div className="text-xl font-bold text-gray-800">{String(value)}</div>
              </div>
            ))}
            {(!stats.usage || Object.keys(stats.usage).length === 0) && (
              <div className="col-span-3 py-12 text-gray-300 italic text-sm">No usage data available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
