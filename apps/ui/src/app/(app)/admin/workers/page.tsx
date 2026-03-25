'use client';

import { useState, useEffect } from 'react';
import { adminWorkersService } from '@/services/admin-workers.service';

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const response = await adminWorkersService.getStatus();
      setWorkers(response.data);
    } catch (error) {
      console.error('Failed to load workers status', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Worker Clusters</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div>Loading workers...</div>
        ) : (
          workers.map((worker) => (
            <div key={worker.queueName} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{worker.queueName} Queue</div>
                <div className="text-2xl font-black text-gray-900">{worker.activeWorkers} Workers</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                worker.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
              }`}>
                {worker.status}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 bg-blue-50 p-8 rounded-3xl border border-blue-100">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Cluster Information</h3>
        <p className="text-sm text-blue-700 leading-relaxed">
          The background job workers are distributed across multiple nodes. Monitoring active worker counts ensures that the system can handle current throughput for critical tasks like notification delivery and AI processing.
        </p>
      </div>
    </div>
  );
}
