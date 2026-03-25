'use client';

import { useState, useEffect } from 'react';
import { adminApiLogsService } from '@/services/admin-api-logs.service';

export default function AdminApiLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await adminApiLogsService.findAll();
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to load API logs', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / API Logs</h1>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4 text-left">Method</th>
                <th className="px-6 py-4 text-left">URL</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Tenant</th>
                <th className="px-6 py-4 text-left">Duration</th>
                <th className="px-6 py-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.method === 'GET' ? 'bg-green-50 text-green-700' :
                      log.method === 'POST' ? 'bg-blue-50 text-blue-700' :
                      log.method === 'DELETE' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {log.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 truncate max-w-xs">{log.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-bold ${log.statusCode >= 400 ? 'text-red-500' : 'text-green-500'}`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{log.tenantId || 'SYSTEM'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{log.durationMs}ms</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-400 italic text-sm">No API logs found.</div>
          )}
        </div>
      )}
    </div>
  );
}
