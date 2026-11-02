import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

// A tiny hash router. Hash URLs (#/jobs, #/apply/abc) are what the old site used, so old links and bookmarks keep working.

export interface Route {
  /** "/jobs" */
  path: string;
  /** ["jobs"] */
  segments: string[];
  params: URLSearchParams;
}

function read(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [p = '', q = ''] = raw.split('?');
  return { path: '/' + p.replace(/\/+$/, ''), segments: p.split('/').filter(Boolean), params: new URLSearchParams(q) };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(read);
  useEffect(() => {
    const onChange = (): void => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export type Params = Record<string, string | undefined>;

export function href(path: string, params?: Params): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v) q.set(k, v);
  const s = q.toString();
  return '#' + path + (s ? '?' + s : '');
}

export function navigate(path: string, params?: Params): void {
  window.location.hash = href(path, params);
}

/** Updates the address bar without a page change (used while typing in search). */
export function replaceParams(path: string, params: Params): void {
  window.history.replaceState(null, '', href(path, params));
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  params?: Params;
  children: ReactNode;
}

export function Link({ to, params, children, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>): void => {
    onClick?.(e);
    // Same-page links should still scroll to the top.
    if (!e.defaultPrevented && href(to, params) === window.location.hash) window.scrollTo({ top: 0 });
  };
  return (
    <a href={href(to, params)} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
