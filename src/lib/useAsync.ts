import { useCallback, useEffect, useState } from 'react';
import { errorText } from './api';

export type Async<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T };

/** Runs a loader on mount (and when `reload` is called). Cancels stale answers. */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]): { state: Async<T>; reload: () => void } {
  const [state, setState] = useState<Async<T>>({ status: 'loading' });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick(n => n + 1), []);

  useEffect(() => {
    let alive = true;
    setState(s => (s.status === 'ready' ? s : { status: 'loading' }));
    load().then(
      data => alive && setState({ status: 'ready', data }),
      (e: unknown) => alive && setState({ status: 'error', message: errorText(e) }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { state, reload };
}
