import { useCallback, useEffect, useState } from 'react';
import { loadCatalog, type Catalog } from './catalog';
import { migrateSaved } from './saved';

export type CatalogState =
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'ready'; catalog: Catalog };

type Internal = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; catalog: Catalog };

export function useCatalog(): CatalogState {
  const [tries, setTries] = useState(0);
  const [state, setState] = useState<Internal>({ status: 'loading' });
  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setTries(n => n + 1);
  }, []);

  useEffect(() => {
    let alive = true;
    loadCatalog().then(
      catalog => {
        migrateSaved(catalog.legacy);
        if (alive) setState({ status: 'ready', catalog });
      },
      (err: unknown) => {
        if (alive) setState({ status: 'error', message: err instanceof Error ? err.message : 'The catalog did not load.' });
      },
    );
    return () => {
      alive = false;
    };
  }, [tries]);

  return state.status === 'error' ? { status: 'error', message: state.message, retry } : state;
}
