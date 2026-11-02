import type { CategoryKey } from '../types';

export const CATEGORIES: readonly { key: CategoryKey; label: string }[] = [
  { key: 'code', label: 'Software' },
  { key: 'data', label: 'Data' },
  { key: 'ai', label: 'AI and ML' },
  { key: 'cloud', label: 'Cloud and DevOps' },
  { key: 'sec', label: 'Security' },
  { key: 'design', label: 'Design' },
  { key: 'mkt', label: 'Marketing' },
  { key: 'write', label: 'Content' },
  { key: 'fin', label: 'Finance' },
  { key: 'biz', label: 'Business' },
  { key: 'people', label: 'People and Ops' },
  { key: 'eng', label: 'Engineering' },
  { key: 'sci', label: 'Science' },
  { key: 'health', label: 'Healthcare' },
  { key: 'law', label: 'Law and Policy' },
];

const KEYS = new Set<string>(CATEGORIES.map(c => c.key));

/** Anything unknown in the data falls back to Business so a listing is never lost. */
export const asCategory = (value: string | undefined): CategoryKey =>
  value !== undefined && KEYS.has(value) ? (value as CategoryKey) : 'biz';

export const categoryLabel = (key: CategoryKey): string =>
  CATEGORIES.find(c => c.key === key)?.label ?? 'Business';
