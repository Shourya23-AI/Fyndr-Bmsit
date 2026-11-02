// Per-route meta tags, canonical link and JSON-LD. Updated on every route change.
const SITE = 'Fyndr';

function setMeta(attr: 'name' | 'property', key: string, value: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export function applySeo(title: string, description: string, path: string): void {
  const full = path === '/' ? `${SITE}: ${title}` : `${title} - ${SITE}`;
  document.title = full;
  const url = window.location.href.split('#')[0] + (path === '/' ? '' : '#' + path);
  setMeta('name', 'description', description);
  setMeta('property', 'og:title', full);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', full);
  setMeta('name', 'twitter:description', description);
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
  let ld = document.getElementById('ld-json');
  if (!ld) {
    ld = document.createElement('script');
    ld.id = 'ld-json';
    ld.setAttribute('type', 'application/ld+json');
    document.head.appendChild(ld);
  }
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE,
    url: window.location.href.split('#')[0],
    description,
    potentialAction: { '@type': 'SearchAction', target: window.location.href.split('#')[0] + '#/browse?q={query}', 'query-input': 'required name=query' },
  });
}
