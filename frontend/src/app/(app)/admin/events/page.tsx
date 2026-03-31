'use client';

import { useState, useEffect } from 'react';
import { adminEventsService } from '@/services/admin-events.service';

export default function AdminEventsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await adminEventsService.getDefinitions();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load event definitions', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / System Events</h1>
      </div>

      {loading ? (
        <div>Loading events...</div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <h2 className="text-sm font-bold uppercase tracking-widest text-blue-500">{cat.category}</h2>
              </div>
              <div className="p-0">
                <table className="min-w-full divide-y divide-gray-100">
                  <tbody className="bg-white divide-y divide-gray-50">
                    {cat.events.map((event: string) => (
                      <tr key={event} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-gray-700">{event}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded uppercase font-bold">Registerred</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
