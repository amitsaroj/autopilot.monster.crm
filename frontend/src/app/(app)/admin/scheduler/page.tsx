'use client';

import { useState, useEffect } from 'react';
import { adminSchedulerService } from '@/services/admin-scheduler.service';

export default function AdminSchedulerPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await adminSchedulerService.getJobs();
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to load scheduled jobs', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Scheduled Jobs</h1>
      </div>

      {loading ? (
        <div>Loading jobs...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-6 py-4 text-left">Job Name</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Last Run</th>
                <th className="px-6 py-4 text-left">Next Run</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 font-mono text-xs">
              {jobs.map((job) => (
                <tr key={job.name} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-bold">{job.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      job.running ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                    }`}>
                      {job.running ? 'Running' : 'Stopped'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {job.lastDate ? new Date(job.lastDate).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-500 font-bold">
                    {job.nextDate ? new Date(job.nextDate).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic text-sm">No scheduled jobs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
