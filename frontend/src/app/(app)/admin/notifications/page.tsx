'use client';

import { useState, useEffect } from 'react';
import { adminNotificationsService } from '@/services/admin-notifications.service';

export default function AdminNotificationsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', type: 'INFO' });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await adminNotificationsService.getBroadcastHistory();
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminNotificationsService.sendBroadcast(form);
      alert('Broadcast initiated!');
      setForm({ title: '', message: '', type: 'INFO' });
      loadHistory();
    } catch (error) {
      console.error('Failed to broadcast', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / System Notifications</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Send Broadcast</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Title</label>
              <input 
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                placeholder="Notification Title"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Message</label>
              <textarea 
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                placeholder="Broadcast Message Content"
                rows={4}
                required
              />
            </div>
            <button className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all">
              BROADCAST TO ALL USERS
            </button>
          </form>
        </div>

        <div className="bg-white p-0 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Notification History</h2>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-6">Loading history...</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-50 text-xs">
                <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="px-6 py-4 text-left">Notification</th>
                    <th className="px-6 py-4 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{h.title}</div>
                        <div className="text-gray-400 truncate max-w-xs">{h.message}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(h.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-gray-300 italic">No history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
