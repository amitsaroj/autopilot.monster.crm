'use client';

import { useState, useEffect } from 'react';
import { adminUsageService } from '@/services/admin-usage.service';

export default function AdminUsagePage() {
  const [usage, setUsage] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usageRes, summaryRes] = await Promise.all([
        adminUsageService.findAll(),
        adminUsageService.getSummary()
      ]);
      setUsage(usageRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to load usage data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-accent">Admin / Platform Usage</h1>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summary.map((item) => (
              <div key={item.metric} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">{item.metric.replace('_', ' ')}</div>
                <div className="text-3xl font-extrabold text-blue-600">{item.totalQuantity}</div>
                <div className="text-xs text-gray-400 mt-1">Total Cost: ${parseFloat(item.totalCost).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-50">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Recent Activity</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period End</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usage.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.tenantId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-[10px] font-bold uppercase">{record.metric}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{record.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">${record.totalCost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.periodEnd).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
