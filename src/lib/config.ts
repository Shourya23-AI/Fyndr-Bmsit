/** Server address. Empty means "the same site that served this page" (or the Vite dev proxy). */
export const API_BASE: string = (import.meta.env.VITE_API_BASE ?? '').trim().replace(/\/+$/, '');

export const FREE_EMAIL = /@(gmail|yahoo|outlook|hotmail|proton|protonmail|icloud|aol)\./i;
