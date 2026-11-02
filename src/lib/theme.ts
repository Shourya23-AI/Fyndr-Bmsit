import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'fyndr-theme';
const listeners = new Set<() => void>();

const system = (): Theme => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function stored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

let current: Theme = stored() ?? system();

function apply(): void {
  document.documentElement.dataset.theme = current;
}

/** Call once before the first render so there is no flash of the wrong theme. */
export function initTheme(): void {
  apply();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (stored() === null) {
      current = system();
      apply();
      listeners.forEach(fn => fn());
    }
  });
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const theme = useSyncExternalStore(
    fn => {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    () => current,
    () => current,
  );
  const toggle = useCallback(() => {
    current = current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(KEY, current);
    } catch {
      // not saved, still applied for this visit
    }
    apply();
    listeners.forEach(fn => fn());
  }, []);
  return { theme, toggle };
}
