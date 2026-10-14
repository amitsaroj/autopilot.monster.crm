'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from './ui';
export function useResource<T>(loader: () => Promise<T>, pollMs = 0) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const sequence = useRef(0);
  const mounted = useRef(true);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    const request = ++sequence.current;
    try {
      const result = await loaderRef.current();
      if (mounted.current && request === sequence.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (mounted.current && request === sequence.current) setError(errorMessage(e));
    } finally {
      if (mounted.current && request === sequence.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const pending = sequence;
    mounted.current = true;
    void reload();
    const id = pollMs
      ? setInterval(() => {
          if (document.visibilityState === 'visible') void reload();
        }, pollMs)
      : null;
    return () => {
      mounted.current = false;
      pending.current++;
      if (id) clearInterval(id);
    };
  }, [reload, pollMs]);
  return { data, loading, error, reload };
}
