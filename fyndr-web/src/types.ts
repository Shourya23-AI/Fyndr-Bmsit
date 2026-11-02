// Shared types for Fyndr. The catalog files in public/catalog/ are compact rows (see lib/group.ts for how they are expanded).

export type Kind = 'job' | 'internship' | 'course';

export const KINDS: readonly Kind[] = ['job', 'internship', 'course'];

export type CategoryKey =
  | 'ai' | 'data' | 'sec' | 'cloud' | 'code' | 'mkt' | 'fin' | 'health'
  | 'sci' | 'eng' | 'design' | 'law' | 'write' | 'people' | 'biz';

/** free: costs nothing to learn. freemium: free to start. paid: paid or trial. search: only a search page. */
export type PayTier = 'free' | 'freemium' | 'paid' | 'search';

/** u: UG students, p: PG and final-year, a: anyone starting out */
export type Level = 'u' | 'p' | 'a';

/** One button on a listing: opens a provider's or job board's own search page. */
export interface SourceLink {
  name: string;
  url: string;
  tier?: PayTier;
  certificate?: boolean;
  pay?: string;
  duration?: string;
  what?: string;
}

/**
 * One course topic, or one job or internship role in one city.
 * HONEST NOTE: these are search links, not postings. Fyndr has not checked any single page behind them.
 */
export interface Listing {
  id: string;
  kind: Kind;
  title: string;
  /** Names of the sites the buttons open, best first. */
  sources: string[];
  location: string;
  city: string | null;
  remote: boolean;
  category: CategoryKey;
  skills: string[];
  pay: string;
  duration: string;
  summary: string;
  bestFor: string[];
  whatYouGet: string[];
  links: SourceLink[];
  free: boolean;
  allFree: boolean;
  certificate: boolean;
  level: Level;
  /** Only used to mix the catalog in a stable order. Never shown. */
  order: number;
  /** Lower-case text the search looks in. */
  hay: string;
}

/** [topic, provider index, category, level flag, skills] */
export type CourseRow = [topic: string, provider: number, category: string, level?: string, skills?: string];
/** [title, 'i' internship | 'j' job, board index, city, category, skills] */
export type JobRow = [title: string, kind: string, board: number, city: string | null, category: string, skills?: string];

export interface CatalogFile<T> {
  v: number;
  rows: T[];
}
