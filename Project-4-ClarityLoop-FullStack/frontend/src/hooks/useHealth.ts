import { useCallback, useEffect, useRef, useState } from 'react';
import { checkHealth } from '@/services/api';
import type { HealthStatus } from '@/types';

const INITIAL: HealthStatus = {
  ok: false,
  status: 'offline',
  message: 'Checking connection…',
  database: 'unknown',
};

// Polls /api/health on a fixed interval and exposes the latest result.
// Used by the top-bar status pill and the overview banner.
export function useHealth(intervalMs = 30000) {
  const [health, setHealth] = useState<HealthStatus>(INITIAL);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = useCallback(async () => {
    const next = await checkHealth();
    setHealth(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const next = await checkHealth();
      if (active) {
        setHealth(next);
        setLoading(false);
      }
    })();
    timer.current = setInterval(run, intervalMs);
    return () => {
      active = false;
      if (timer.current) clearInterval(timer.current);
    };
  }, [intervalMs, run]);

  return { health, loading, refresh: run };
}
