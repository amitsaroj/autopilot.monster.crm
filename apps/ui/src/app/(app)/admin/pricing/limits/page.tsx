'use client';

import { useState, useEffect } from 'react';
import { adminLimitsService } from '@/services/admin-limits.service';

export default function AdminLimitsPage() {
  const [limits, setLimits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    try {
      const response = await adminLimitsService.findAll();
      setLimits(response.data);
    } catch (error) {
      console.error('Failed to load limits', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Pricing / Limits</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">New Limit</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {limits.map((limit) => (
                <tr key={limit.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{limit.plan?.name || limit.planId}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm uppercase">{limit.metric}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {limit.value === '-1' || limit.value === -1 ? (
                      <span className="text-gray-900 font-bold italic">Unlimited</span>
                    ) : (
                      <span className="text-gray-900">{limit.value}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{limit.period}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
