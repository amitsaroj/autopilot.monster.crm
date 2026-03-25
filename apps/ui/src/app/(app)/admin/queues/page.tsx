'use client';

import { useState, useEffect } from 'react';
import { adminQueuesService } from '@/services/admin-queues.service';

export default function AdminQueuesPage() {
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueues();
    const interval = setInterval(loadQueues, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadQueues = async () => {
    try {
      const response = await adminQueuesService.getStatus();
      setQueues(response.data);
    } catch (error) {
      console.error('Failed to load queues status', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanQueue = async (name: string) => {
    if (!confirm(`Clean queue ${name}?`)) return;
    try {
      await adminQueuesService.cleanQueue(name);
      loadQueues();
    } catch (error) {
      console.error('Failed to clean queue', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Backround Queues</h1>
        <button 
          onClick={loadQueues}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          REFRESH NOW
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div>Loading queues...</div>
        ) : (
          queues.map((queue) => (
            <div key={queue.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 font-mono">{queue.name}</h2>
                <button 
                  onClick={() => cleanQueue(queue.name)}
                  className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase"
                >
                  Clean
                </button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Waiting</div>
                  <div className="text-lg font-black text-gray-800">{queue.counts.waiting}</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Active</div>
                  <div className="text-lg font-black text-blue-600">{queue.counts.active}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-green-400 uppercase mb-1">Completed</div>
                  <div className="text-lg font-black text-green-600">{queue.counts.completed}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <div className="text-[10px] font-bold text-red-400 uppercase mb-1">Failed</div>
                  <div className="text-lg font-black text-red-600">{queue.counts.failed}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
