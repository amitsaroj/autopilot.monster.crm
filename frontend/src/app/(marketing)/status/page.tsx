"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface HealthCheck {
  name: string;
  status: 'ok' | 'error' | 'unknown';
}

interface HealthResponse {
  status?: string;
  info?: Record<string, { status: string }>;
  error?: Record<string, { status: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export default function StatusPage() {
  const [loading, setLoading] = useState(true);
  const [overall, setOverall] = useState<'operational' | 'degraded' | 'unknown'>('unknown');
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [lastChecked, setLastChecked] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/health`);
      const json = (await res.json()) as HealthResponse;
      const items: HealthCheck[] = [];
      if (json.info) {
        for (const [name, detail] of Object.entries(json.info)) {
          items.push({ name, status: detail.status === 'up' ? 'ok' : 'unknown' });
        }
      }
      if (json.error) {
        for (const [name] of Object.entries(json.error)) {
          items.push({ name, status: 'error' });
        }
      }
      setChecks(items);
      setOverall(
        json.status === 'ok' ? 'operational' : items.some((c) => c.status === 'error') ? 'degraded' : 'unknown',
      );
      setLastChecked(new Date().toLocaleString());
    } catch {
      setOverall('degraded');
      setChecks([{ name: 'API', status: 'error' }]);
      setLastChecked(new Date().toLocaleString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Platform Status
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Live health from the public <code className="text-indigo-400">/health</code> endpoint.
          </p>
        </motion.div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              ) : overall === 'operational' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-500" />
              )}
              <span className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                {loading ? 'Checking…' : overall === 'operational' ? 'All systems operational' : 'Service degraded'}
              </span>
            </div>
            <button
              onClick={() => void load()}
              className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-indigo-400 transition-colors"
              aria-label="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {lastChecked && (
            <p className="text-xs text-gray-500">Last checked: {lastChecked}</p>
          )}

          <div className="space-y-3">
            {checks.length === 0 && !loading && (
              <p className="text-sm text-gray-500">No detailed checks returned.</p>
            )}
            {checks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-white/[0.06] last:border-0"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {check.name}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${
                    check.status === 'ok'
                      ? 'text-emerald-500'
                      : check.status === 'error'
                        ? 'text-red-500'
                        : 'text-gray-500'
                  }`}
                >
                  {check.status === 'ok' ? 'Operational' : check.status === 'error' ? 'Down' : 'Unknown'}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 pt-4">
            For SLA commitments see{' '}
            <Link href="/sla" className="text-indigo-400 hover:underline">
              Service Level Agreement
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
