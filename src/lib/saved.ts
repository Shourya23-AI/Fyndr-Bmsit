import { useSyncExternalStore } from 'react';

// Saved catalog items live on this device. Same storage key as the old site, so nothing people saved before is lost.
// (Part 2 adds saving real, signed-in listings to the cloud.)
const KEY = 'fyndr-catsaved';
const listeners = new Set<() => void>();

function read(): readonly string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

let snapshot: readonly string[] = read();

function write(next: readonly string[]): void {
  snapshot = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or a full disk: the list still works until the tab closes.
  }
  listeners.forEach(fn => fn());
}

export function toggleSaved(id: string): boolean {
  const saved = !snapshot.includes(id);
  write(saved ? [...snapshot, id] : snapshot.filter(x => x !== id));
  return saved;
}

/** Old per-row ids ("cat_c123") become the id of the grouped listing that replaced them. */
export function migrateSaved(legacy: ReadonlyMap<string, string>): void {
  if (!snapshot.some(id => legacy.has(id))) return;
  write([...new Set(snapshot.map(id => legacy.get(id) ?? id))]);
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent): void => {
    if (e.key === KEY) {
      snapshot = read();
      fn();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

export function useSaved(): { ids: readonly string[]; has: (id: string) => boolean; toggle: (id: string) => void } {
  const ids = useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
  return { ids, has: id => ids.includes(id), toggle: id => void toggleSaved(id) };
}
