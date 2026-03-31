'use client';

import { useState, useEffect } from 'react';
import { adminHealthService } from '@/services/admin-health.service';

export default function AdminHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      const response = await adminHealthService.getHealth();
      setHealth(response.data);
    } catch (error) {
      console.error('Failed to load health status', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Checking system health...</div>;
  if (!health) return <div className="p-6 text-red-400">Failed to load health status.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / System Health</h1>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${health.status === 'OK' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm font-bold text-gray-700">{health.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Memory Usage</div>
          <div className="text-2xl font-black text-gray-900">
            {Math.round(health.memory.usage.rss / 1024 / 1024)} MB
          </div>
          <div className="text-[10px] text-gray-400 mt-1">RSS (Resident Set Size)</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">System Uptime</div>
          <div className="text-2xl font-black text-blue-600">
            {Math.round(health.uptime / 3600)} Hours
          </div>
          <div className="text-[10px] text-gray-400 mt-1">{Math.round(health.uptime)} Seconds Total</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Node Version</div>
          <div className="text-2xl font-black text-purple-600">{health.nodeVersion}</div>
          <div className="text-[10px] text-gray-400 mt-1">Running on {health.platform}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">System Resources</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="text-sm text-gray-500 font-medium">Memory (Free / Total)</span>
            <span className="text-sm font-bold text-gray-800">
              {Math.round(health.memory.free / 1024 / 1024 / 1024)} GB / {Math.round(health.memory.total / 1024 / 1024 / 1024)} GB
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="text-sm text-gray-500 font-medium">CPU Load Average (1m, 5m, 15m)</span>
            <span className="text-sm font-bold text-gray-800">
              {health.cpu.load.map((l: number) => l.toFixed(2)).join(' , ')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 font-medium">CPU Cores</span>
            <span className="text-sm font-bold text-gray-800">{health.cpu.count} Cores</span>
          </div>
        </div>
      </div>
    </div>
  );
}
