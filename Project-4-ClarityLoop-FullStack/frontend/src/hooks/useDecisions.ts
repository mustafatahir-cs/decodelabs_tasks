import { useCallback, useEffect, useRef, useState } from 'react';
import { getDecisions } from '@/services/api';
import type { Decision } from '@/types';

interface State {
  decisions: Decision[];
  loading: boolean;
  error: string | null;
}

// Fetches all decisions once (and on demand via `refresh`). The consumer
// owns filtering / sorting — this hook only handles the network state.
export function useDecisions() {
  const [state, setState] = useState<State>({
    decisions: [],
    loading: true,
    error: null,
  });
  const reqId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++reqId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const decisions = await getDecisions();
      if (id === reqId.current)
        setState({ decisions, loading: false, error: null });
    } catch (err) {
      if (id === reqId.current)
        setState({
          decisions: [],
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load decisions.',
        });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
